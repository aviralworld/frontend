import { readFileSync } from "fs";

import dotenvSafe from "dotenv-safe";
import "mocha";
import { assert } from "chai";
import { Client } from "pg";
import puppeteer from "puppeteer";

dotenvSafe.config();

const { PORT } = process.env;
const {
  TESTING_AVW_HOST,
  PG_CONNECTION_STRING,
  SHOW_PUPPETEER_BROWSER,
} = process.env;

const BASE = new URL(`${TESTING_AVW_HOST}`);
const SEED = 0.7;

describe("The server", function () {
  this.timeout(process.env.MOCHA_TIMEOUT);
  let browser: puppeteer.Browser;

  before(async () => {
    const client = new Client({ connectionString: PG_CONNECTION_STRING });
    await client.connect();
    const data = JSON.parse(
      readFileSync("./test/data.json", { encoding: "utf-8" }),
    );

    const {
      mimeTypes,
      audioFormats,
      ages,
      categories,
      genders,
      recordings,
      recordingTokens,
    } = data;

    await client.query("TRUNCATE mime_types CASCADE;");

    for (const mimeType of mimeTypes) {
      await client.query(
        "INSERT INTO mime_types (id, essence) VALUES ($1, $2);",
        mimeType,
      );
    }

    await client.query("TRUNCATE audio_formats CASCADE;");

    for (const format of audioFormats) {
      await client.query(
        "INSERT INTO audio_formats (id, container, codec, extension, mime_type_id) VALUES ($1, $2, $3, $4, $5);",
        format,
      );
    }

    for (const [k, v] of Object.entries({ ages, categories, genders })) {
      await client.query(`TRUNCATE ${k} CASCADE;`);

      for (const row of v) {
        await client.query(
          `INSERT INTO ${k} (id, label, enabled) VALUES ($1, $2, TRUE);`,
          row,
        );
      }
    }

    await client.query("TRUNCATE recordings CASCADE;");

    for (const {
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
    } of recordings) {
      await client.query(
        "INSERT INTO recordings (id, created_at, updated_at, deleted_at, url, mime_type_id, parent_id, category_id, name, age_id, gender_id, location, occupation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);",
        [
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
      );
    }

    await client.query("TRUNCATE recording_tokens CASCADE;");

    for (const { id, parentId } of recordingTokens) {
      await client.query(
        "INSERT INTO recording_tokens (id, parent_id) VALUES ($1, $2);",
        [id, parentId],
      );
    }

    await client.query("SELECT setseed($1);", [SEED]);

    await client.end();
  });

  before(async () => {
    browser = await puppeteer.launch({
      headless: SHOW_PUPPETEER_BROWSER !== "1",
    });
  });

  after(async () => {
    try {
      await browser.close();
    } catch (e) {}
  });

  it("can be reached", async () => {
    const page = await browser.newPage();
    await page.goto(BASE.toString());
    assert.equal(await page.title(), "A Viral World");
  });

  it("returns 404 for non-existent recordings", async () => {
    const page = await browser.newPage();
    const response = await page.goto(
      new URL("/recording/youdontexist/", BASE).toString(),
    );
    assert.equal(response.status(), 404);
  });

  it("returns 410 for deleted recordings", async () => {
    const page = await browser.newPage();
    const response = await page.goto(
      new URL(
        "/recording/f11ecb2c-3225-4fa9-a059-0bd2601496e9/",
        BASE,
      ).toString(),
    );
    assert.equal(response.status(), 410);
  });

  it("displays the details of recordings", async () => {
    const page = await browser.newPage();
    await page.goto(
      new URL(
        "/recording/14b68be1-08d8-4d74-afdf-1da226b821ff/",
        BASE,
      ).toString(),
    );

    assert.equal(await page.title(), "A story by Avon Boliviano Cotton (cyan)");
  });
});
