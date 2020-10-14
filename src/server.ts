import dotenvSafe from "dotenv-safe";
import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";

dotenvSafe.config();

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

polka()
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware(),
  )
  .listen(PORT, (err: any) => {
    if (err) console.log("error", err);
  });

export const SETTINGS = {
  apiUrl: new URL(process.env.FRONTEND_API_URL),
};
