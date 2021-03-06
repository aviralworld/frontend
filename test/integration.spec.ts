import { ChildProcess, fork } from "child_process";
import { readFileSync } from "fs";

import dotenvSafe from "dotenv-safe";
import "mocha";
import { assert } from "chai";
import { Client } from "pg";
import puppeteer from "puppeteer";
import "pptr-testing-library/extend";

import { parseDecimalInt } from "../src/normalize";

dotenvSafe.config({
  path: process.env.DOTENV_FILE,
});

const {
  PG_CONNECTION_STRING,
  SHOW_PUPPETEER_BROWSER,
  FRONTEND_TEST_SERVER,
  FRONTEND_TEST_NAVIGATION_TIMEOUT: _FRONTEND_TEST_NAVIGATION_TIMEOUT,
  FRONTEND_TEST_SHOW_SERVER_OUTPUT,
  FRONTEND_MIN_RECORDING_LENGTH_SECONDS,
} = process.env;

const FRONTEND_TEST_NAVIGATION_TIMEOUT = parseInt(
  _FRONTEND_TEST_NAVIGATION_TIMEOUT,
  10,
);

const START_PORT = 50000;
const END_PORT = 55000;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let baseUrl: URL;

let urlPromise: Promise<unknown>;

if (FRONTEND_TEST_SERVER === undefined) {
  const serverPort = randomInt(START_PORT, END_PORT);

  let server: ChildProcess;

  const exitListener = () => {
    throw new Error("child process exited");
  };

  before(() => {
    server = fork("./__sapper__/build", [], {
      env: {
        DOTENV_FILE: "testing.env",
        PORT: serverPort.toString(),
        FRONTEND_BASE_URL: `http://localhost:${serverPort}/`,
        FRONTEND_ADMIN_PORT: (serverPort + 1).toString(),
        FRONTEND_HEALTH_CHECK_TIMEOUT_MS: "1",
        ROARR_LOG: "true",
        NEW_RELIC_ENABLED: "false",
      },
      stdio: "pipe",
    });

    server.on("error", (e) => {
      throw new Error(e.toString());
    });

    server.on("exit", exitListener);

    if (FRONTEND_TEST_SHOW_SERVER_OUTPUT === "1") {
      server.stdout.pipe(process.stdout);
      server.stderr.pipe(process.stderr);
    }

    urlPromise = new Promise((resolve) => {
      server.stdout.on("data", (line: Buffer) => {
        try {
          const string = line.toString();

          const parsed = JSON.parse(string);
          const { port } = parsed.context;
          if (port !== undefined) {
            baseUrl = new URL(`http://127.0.0.1:${port}/`);
            resolve(null);
            return;
          }
        } catch (e) {}
      });
    });
  });

  after(() => {
    server.off("exit", exitListener);
    server.kill();
  });
} else {
  baseUrl = new URL(FRONTEND_TEST_SERVER);
  urlPromise = Promise.resolve(null);
}

describe("The server", function () {
  this.timeout(process.env.MOCHA_TIMEOUT);

  let browser: puppeteer.Browser;

  before(async () => {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();

    try {
      const data = JSON.parse(
        readFileSync("./test/data.json", { encoding: "utf-8" }),
      );
      await initializeDatabase(client, data);
    } finally {
      await client.end();
    }

    await urlPromise;
  });

  before(async () => {
    browser = await puppeteer.launch({
      headless: SHOW_PUPPETEER_BROWSER !== "1",
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--use-file-for-fake-audio-capture=./test/example.wav",
        "--allow-file-access",
        "--no-sandbox",
      ],
    });
  });

  after(async () => {
    try {
      await browser?.close();
    } catch (e) {}
  });

  it(
    "can be reached",
    withPage(
      () => browser,
      async (page) => {
        await page.goto(baseUrl.toString());
        assert.equal(await page.title(), "A Viral World");
      },
    ),
  );

  it(
    "returns 404 for non-existent recordings",
    withPage(
      () => browser,
      async (page) => {
        const response = await page.goto(
          new URL("/recording/youdontexist/", baseUrl).toString(),
        );
        assert.equal(response.status(), 404);
      },
    ),
  );

  it(
    "returns 410 for deleted recordings",
    withPage(
      () => browser,
      async (page) => {
        const response = await page.goto(
          new URL(
            "/recording/f11ecb2c-3225-4fa9-a059-0bd2601496e9/",
            baseUrl,
          ).toString(),
        );
        assert.equal(response.status(), 410);
      },
    ),
  );

  it(
    "displays the details of recordings",
    withPage(
      () => browser,
      async (page) => {
        await page.goto(
          new URL(
            "/recording/14b68be1-08d8-4d74-afdf-1da226b821ff/",
            baseUrl,
          ).toString(),
        );

        assert.equal(
          await page.title(),
          "A story by Avon Boliviano Cotton from cyan",
        );

        const document = await page.getDocument();
        const element = await document.queryByText("Reply");
        assert.equal(element, null);
      },
    ),
  );

  describe("handles recording tokens correctly when they", () => {
    it(
      "are malformed",
      withPage(
        () => browser,
        async (page) => {
          const url = new URL(
            "/recording/14b68be1-08d8-4d74-afdf-1da226b821ff/",
            baseUrl,
          );

          for (const val of [
            " ",
            "abcd",
            "14b68be1-08d8-4d74-afdf-1da226b821f",
          ]) {
            url.searchParams.set("token", val);
            await page.goto(url.toString());
            assert.equal(await page.title(), "400");
          }
        },
      ),
    );

    it(
      "don't exist",
      withPage(
        () => browser,
        async (page) => {
          const url = new URL(
            "/recording/14b68be1-08d8-4d74-afdf-1da226b821ff/?token=14b68be1-08d8-4d74-afdf-1da226b821ff",
            baseUrl,
          );

          await page.goto(url.toString());
          assert.equal(await page.title(), "400");
        },
      ),
    );

    it(
      "don't match the recording",
      withPage(
        () => browser,
        async (page) => {
          const url = new URL(
            "/recording/091b2ecd-f1a2-48db-a1c4-d050c74986ed/?token=0802bf94-a784-4826-8e50-9f43a00104e3",
            baseUrl,
          );

          await page.goto(url.toString());
          assert.equal(await page.title(), "400");
        },
      ),
    );
  });

  it(
    "correctly handles valid recording tokens",
    withPage(
      () => browser,
      async (page) => {
        page.setDefaultTimeout(FRONTEND_TEST_NAVIGATION_TIMEOUT);
        const url = new URL(
          "/recording/6bff43d4-66b1-44a1-9970-c0896f778578/?token=0802bf94-a784-4826-8e50-9f43a00104e3",
          baseUrl,
        );

        await page.goto(url.toString());
        assert.equal(
          await page.title(),
          "A story by Car from payment Steel Bike",
        );

        let document = await page.getDocument();

        const nameInput = await document.getByLabelText("What is your name?", {
          exact: false,
        });
        await nameInput.type("Car");

        await page.waitForXPath("//span[contains(., 'already a recording')]");

        assert.notEqual(
          await document.queryByText("haptic yellow Forward extensible", {
            exact: false,
          }),
          null,
        );

        const categoryOption = await document.getByText(
          "Forward yellow haptic",
        );
        await categoryOption.click();

        await page.goto(url.toString());

        document = await page.getDocument();
        const nameInput2 = await document.getByLabelText("What is your name?", {
          exact: false,
        });
        await document.evaluate((i) => {
          (i as any).value = "";
        }, nameInput2);
        await nameInput2.type("Another Car");

        await page.waitForXPath("//span[contains(., 'already a recording')]", {
          hidden: true,
        });

        await record(page, 100);

        assert.notEqual(
          await document.queryByText("for at least", { exact: false }),
          null,
          "must show notice about recording being too short",
        );

        const recordingLength =
          parseDecimalInt(FRONTEND_MIN_RECORDING_LENGTH_SECONDS) * 1000 + 100;
        await record(page, recordingLength);

        await page.waitForTimeout(100);

        assert.notEqual(
          await document.queryByText("recording your reply", { exact: false }),
          null,
        );

        let publishButton = await getPublishButton(page);

        const emailInput = await document.getByLabelText("email address", {
          exact: false,
        });
        await emailInput.type("foo@bar.com");

        await page.setOfflineMode(true);
        publishButton = await getPublishButton(page);
        await publishButton.click();
        await page.waitForTimeout(100);
        await page.waitForXPath(
          "//p[@class = 'error' and contains(., 'try again')]",
        );
        await page.setOfflineMode(false);

        let promise = new Promise((resolve, reject) => {
          let timeout = setTimeout(reject, 5000, undefined);
          page.once("dialog", (dialog) => {
            dialog.accept();
            clearTimeout(timeout);
            setImmediate(resolve, undefined);
          });
        });
        await page.click(".reset-button");
        await promise;

        await page.waitForSelector(".reset-button", { hidden: true });
        await record(page, recordingLength);

        await page.waitForTimeout(100);

        publishButton = await getPublishButton(page);

        await publishButton.click();

        const input = await page.waitForXPath("//li/form/input");
        const text: string = await page.evaluate((input) => input.value, input);
        assert(text.indexOf("/recording/") > -1);

        const managementLink = await page.$('a[href*="/lookup/"]');
        await managementLink.click();
        await page.waitForFunction(
          () => (document as any).title.indexOf("Another Car") > -1,
        );

        // TODO there's an issue with Puppeteer where the `clipboard-write`
        // permission seems to be ignored and the copy fails, so we skip testing
        // that part for now

        // await page
        //   .browserContext()
        //   .overridePermissions(baseUrl.toString(), [
        //     "clipboard-read",
        //     "clipboard-write",
        //   ]);

        // const button = await page.waitForXPath("//li/form/button");
        // await button.click();
        // await page.waitForTimeout(50);

        // await page.waitForTimeout(60000);
        // const copied = await page.evaluate(() =>
        //   navigator.clipboard.readText(),
        // );
        // assert(copied.indexOf("/recordings") > -1);
      },
    ),
  );
});

function withPage(
  browser: () => puppeteer.Browser,
  fn: (page: puppeteer.Page) => Promise<void>,
): () => Promise<void> {
  return async () => {
    const page = await browser().newPage();

    try {
      await fn(page);
    } finally {
      await page.close();
    }
  };
}

async function record(page: puppeteer.Page, ms: number): Promise<void> {
  let recordButton = await page.waitForSelector(".record-button");

  await recordButton.click();
  await page.waitForTimeout(ms);

  recordButton = await page.waitForSelector(".record-button");
  await recordButton.click();

  await page.waitForTimeout(100);
}

function getPublishButton(
  page: puppeteer.Page,
): Promise<puppeteer.ElementHandle> {
  return page.waitForXPath("//button[contains(., 'Publish')]");
}

async function initializeDatabase(client: Client, data: any) {
  const {
    mimeTypes,
    audioFormats,
    ages,
    categories,
    genders,
    recordings,
    recordingTokens,
  } = data;

  await insert(client, "mime_types", "id, essence", "$1, $2", mimeTypes);
  await insert(
    client,
    "audio_formats",
    "id, container, codec, extension, mime_type_id",
    "$1, $2, $3, $4, $5",
    audioFormats,
  );
  await insert(client, "ages", "id, label, enabled", "$1, $2, TRUE", ages);
  await insert(
    client,
    "categories",
    "id, label, enabled, description",
    "$1, $2, TRUE, $3",
    categories.map(([a, b, c]) => [a, b, c]),
  );
  await insert(
    client,
    "genders",
    "id, label, enabled",
    "$1, $2, TRUE",
    genders,
  );
  await insert(
    client,
    "recordings",
    "id, created_at, updated_at, deleted_at, url, mime_type_id, parent_id, category_id, name, age_id, gender_id, location, occupation",
    "$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13",
    recordings.map(
      ({
        id,
        createdAt,
        updatedAt,
        deletedAt,
        url,
        mimeTypeId,
        parentId,
        categoryId,
        name,
        ageId,
        genderId,
        location,
        occupation,
      }) => [
        id,
        createdAt,
        updatedAt,
        deletedAt,
        url,
        mimeTypeId,
        parentId,
        categoryId,
        name,
        ageId,
        genderId,
        location,
        occupation,
      ],
    ),
  );

  await insert(
    client,
    "recording_tokens",
    "id, parent_id",
    "$1, $2",
    recordingTokens.map(({ id, parentId }) => [id, parentId]),
  );
}

async function insert(
  client: Client,
  table: string,
  columns: string,
  values: string,
  data: any[][],
) {
  await client.query(`TRUNCATE ${table} CASCADE`);

  for (const row of data) {
    await client.query(
      `INSERT INTO ${table} (${columns}) VALUES (${values});`,
      row,
    );
  }
}
