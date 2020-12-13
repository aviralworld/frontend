import dotenvSafe from "dotenv-safe";
import "mocha";
import { assert } from "chai";
import puppeteer from "puppeteer";

dotenvSafe.config();

const { PORT } = process.env;
const { TESTING_AVW_HOST } = process.env;

const BASE = new URL(`${TESTING_AVW_HOST}`);

describe("The server", function () {
  this.timeout(process.env.MOCHA_TIMEOUT);
  let browser: puppeteer.Browser;

  before(async () => {
    browser = await puppeteer.launch({ headless: true });
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
});
