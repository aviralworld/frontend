import { assign, createMachine, actions, StateMachine } from "xstate";

const { respond } = actions;

interface IContext {
  chunks: readonly unknown[];
  time: number;
  maxLength: number;
}

export type ChunkEvent =
  | { type: "PUSH"; chunk: unknown }
  | { type: "STOP" }
  | { type: "CLEAR" };

type ChunkState =
  | { value: "ready"; context: IContext }
  | { value: "completed"; context: IContext };

interface IChunkSchema {
  states: {
    speak: unknown;
    ready: unknown;
    completed: unknown;
  };
}

export function chunksMachine(
  maxLength: number,
): StateMachine<IContext, IChunkSchema, ChunkEvent, ChunkState> {
  return createMachine<IContext, ChunkEvent, ChunkState>(
    {
      initial: "ready",
      context: { chunks: [], time: 0, maxLength },
      states: {
        ready: {
          on: {
            PUSH: [
              {
                cond: "underMaximumLength",
                actions: [
                  "addChunk",
                  respond((context) => ({
                    type: "TIME",
                    time: context.time,
                  })),
                ],
              },
              { target: "completed" },
            ],
            CLEAR: {
              target: "",
              actions: "clear",
            },
            STOP: "completed",
          },
        },
        completed: {
          type: "final",
          entry: respond((context) => ({
            type: "DATA",
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            blob: new Blob(context.chunks as any[]),
          })),
        },
      },
      strict: true,
    },
    {
      actions: {
        addChunk: assign({
          chunks: (context, event) =>
            context.chunks.concat([event.type === "PUSH" && event.chunk]),
          time: (context) => context.time + 1,
        }),
        clear: assign({
          chunks: [] as readonly unknown[],
        }),
      },
      guards: {
        underMaximumLength: (context, event) =>
          event.type === "PUSH" && context.time + 1 <= context.maxLength,
      },
    },
  ) as StateMachine<IContext, IChunkSchema, ChunkEvent, ChunkState>;
}
