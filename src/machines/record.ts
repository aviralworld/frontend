import {
  createMachine,
  actions,
  assign,
  interpret,
  spawn,
  Spawnable,
  SpawnedActorRef,
  StateMachine,
} from "xstate";

import { createRecorder } from "../recorder";
import { ChunkEvent, chunksMachine } from "./chunks";

const { log, send } = actions;

const TIME_SLICE_MS = 1000;

interface IRecordingMachineSchema {
  states: {
    inactive: unknown;
    checking: unknown;
    preparing: unknown;
    ready: unknown;
    recording: {
      states: {
        empty: unknown;
        noData: unknown;
      };
    };
    processing: unknown;
    completed: unknown;
    disabled: unknown;
  };
}

interface IFormat {
  format: string;
}

interface IWithRecorder {
  recorder: MediaRecorder;
  listener: SpawnedActorRef<ListenerEvent, RecordingEvent>;
}

interface ITime {
  machine: SpawnedActorRef<ChunkEvent, RecordingEvent>;
  time: number;
}

interface IData {
  data: Blob;
}

interface IRecordingContext {
  format?: string;
  recorder?: MediaRecorder;
  listener?: SpawnedActorRef<ListenerEvent, any>;
  machine?: SpawnedActorRef<ChunkEvent, any>;
  time?: number;
  data?: Blob;
}

type RecordingEvent =
  | { type: "PREPARE"; format: string | undefined }
  | { type: "START"; sliceMs: number; maxLength: number }
  | { type: "STOP" }
  | { type: "CHUNK"; chunk: unknown }
  | { type: "TIME"; time: number }
  | { type: "done.invoke.createRecorder"; data: MediaRecorder }
  | { type: "DATA"; blob: Blob };

type RecordingState =
  | {
      value: "inactive";
      context: IRecordingContext & {
        format: undefined;
        recorder: undefined;
        machine: undefined;
        data: undefined;
        time: undefined;
      };
    }
  | {
      value: "preparing";
      context: IRecordingContext &
        IFormat & {
          recorder: undefined;
          machine: undefined;
          data: undefined;
          time: undefined;
        };
    }
  | {
      value: "ready";
      context: IRecordingContext &
        IFormat &
        IWithRecorder & {
          data: undefined;
          time: undefined;
        };
    }
  | {
      value: "recording";
      context: IRecordingContext &
        ITime &
        IFormat &
        IWithRecorder & {
          data: undefined;
        };
    }
  | {
      value: "processing";
      context: IRecordingContext &
        ITime &
        IFormat &
        IWithRecorder & {
          data: undefined;
        };
    }
  | {
      value: "completed";
      context: IRecordingContext & IData & ITime & IFormat & IWithRecorder;
    }
  | { value: "disabled"; context: IRecordingContext };

type ListenerEvent =
  | { type: "SET_RECORDER"; value: MediaRecorder }
  | { type: "START_RECORDER" }
  | { type: "STOP_RECORDER" };

function recordingMachine(
  minLength: number,
  maxLength: number,
): StateMachine<
  IRecordingContext,
  IRecordingMachineSchema,
  RecordingEvent,
  RecordingState
> {
  const dataCallback: Spawnable = (callback, receive) => {
    let recorder: MediaRecorder;

    const listener = (e: BlobEvent) => {
      if (e.data.size > 0) {
        callback({ type: "CHUNK", chunk: e.data });
      }
    };

    receive((event: ListenerEvent) => {
      switch (event.type) {
        case "SET_RECORDER":
          recorder = event.value;
          recorder.addEventListener("dataavailable", listener);
          break;
        case "START_RECORDER":
          recorder.start(TIME_SLICE_MS);
          break;
        case "STOP_RECORDER":
          recorder.stop();
          break;
      }
    });

    return () => {
      recorder.removeEventListener("dataavailable", listener);
    };
  };

  return createMachine<IRecordingContext, RecordingEvent, RecordingState>(
    {
      id: "recording",
      initial: "inactive",
      context: {},
      states: {
        inactive: {
          on: {
            PREPARE: [
              {
                cond: "passedSupportedFormat",
                target: "preparing",
                actions: "setFormat",
              },
              { target: "disabled" },
            ],
          },
        },
        preparing: {
          invoke: {
            src: "createRecorder",
            onDone: {
              target: "ready.empty",
              actions: ["setRecorder", "createListener"],
            },
          },
        },
        ready: {
          initial: "empty",
          states: {
            empty: {
              always: {
                target: "#recording.recording",
                actions: [
                  send(
                    (context) => ({
                      type: "SET_RECORDER",
                      value: context.recorder,
                    }),
                    { to: "recorder-listener" },
                  ),
                  "spawnChunksMachine",
                ],
              },
            },
            noData: {
              on: {
                START: "#recording.recording",
              },
            },
          },
          exit: "resetTime",
        },
        recording: {
          on: {
            CHUNK: {
              actions: send(
                (_context, { chunk }) => ({ type: "PUSH", chunk }),
                { to: "chunks-recorder" },
              ),
            },
            STOP: [
              {
                cond: "hasData",
                target: "processing",
                actions: send("STOP", { to: "chunks-recorder" }),
              },
              {
                target: "ready.noData",
                actions: send("CLEAR", { to: "chunks-recorder" }),
              },
            ],
            TIME: {
              actions: [
                assign({
                  time: (_context, event) => event.time,
                }),
              ],
            },
          },
          entry: send("START_RECORDER", { to: "recorder-listener" }),
          exit: send("STOP_RECORDER", { to: "recorder-listener" }),
        },
        processing: {
          on: {
            DATA: {
              target: "completed",
              actions: "setData",
            },
          },
        },
        disabled: {
          type: "final",
        },
        completed: {
          type: "final",
        },
      },
      strict: true,
    },
    {
      actions: {
        createListener: assign({
          listener: () => spawn(dataCallback, { name: "recorder-listener" }),
        }),
        spawnChunksMachine: assign({
          machine: () =>
            spawn(chunksMachine(maxLength), {
              name: "chunks-recorder",
            }),
        }),
        setData: assign({
          data: (_context, event) => event.type === "DATA" && event.blob,
        }),
        setFormat: assign({
          format: (_context, event) => event.type === "PREPARE" && event.format,
        }),
        setRecorder: assign({
          recorder: (_context, event) =>
            event.type === "done.invoke.createRecorder" && event.data,
        }),
        resetTime: assign({
          time: () => 0,
        }),
        setTime: assign({
          time: (_context, event) => event.type === "TIME" && event.time,
        }),
        cleanup: (context) => {
          context.listener?.stop();
          context.machine?.stop();
        },
      },
      guards: {
        hasData: (context) => context.time >= minLength,
        passedSupportedFormat: (_context, event) => {
          return event.type === "PREPARE" && event.format !== undefined;
        },
      },
      services: {
        createRecorder: (context) => createRecorder(context.format),
      },
    },
  ) as StateMachine<
    // this `as` shouldn't to be necessary but the
    // type inference doesn't work correctly without it
    IRecordingContext,
    IRecordingMachineSchema,
    RecordingEvent,
    RecordingState
  >;
}

export function createRecordingMachine(minLength: number, maxLength: number) {
  return interpret(recordingMachine(minLength, maxLength)).start();
}
