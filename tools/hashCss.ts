import { createHash } from "crypto";
import { createReadStream, readFileSync, createWriteStream, renameSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

import fg = require("fast-glob");
import RewritingStream = require("parse5-html-rewriting-stream");
import yargs = require("yargs");

const FILENAME_RE = /^(\/?)([^.]+)((?:\.[^.]+)?)(\.[^.]+)$/;
const EXTENSION_RE = /\.css$/;
const SUFFIX = ".rewritten";

const { argv } = yargs
  .strict()
  .option("clean", {
    default: true,
    description: "whether to remove old hashed files",
    type: "boolean",
  })
  .option("html", {
    default: "template.html",
    description: "HTML file to edit",
    type: "string",
  })
  .option("directory", {
    default: "__sapper__/build",
    description: "root directory",
    type: "string",
  })
  .option("assets-path", {
    default: "static",
    description: "subdirectory under which static assets are placed",
    type: "string",
  })
  .option("digest-length", {
    default: 10,
    description: "length of prefix of actual digest to use as hash",
    type: "number",
  })
  .command("$0", "Hash CSS and update HTML", (yargs) => yargs, (yargs) => {
    const { html, directory, clean } = yargs;
    const assetsPath = yargs["assets-path"];

    const htmlPath = join(directory, html);
    console.info("Updating", htmlPath);

    const newHtmlPath = `${htmlPath}${SUFFIX}`;
    const out = createWriteStream(newHtmlPath, { encoding: "utf8" });
    const rewriter = new RewritingStream();
    rewriter.on("startTag", (startTag) => {
      if (startTag.tagName === "link") {
        const rel = startTag.attrs.find((a) => a.name === "rel");

        if (rel?.value === "stylesheet") {
          const hrefAttribute = startTag.attrs.find((a) => a.name === "href");
          const [, slash, stem, , extension] = hrefAttribute.value.match(FILENAME_RE);
          const filePath = `${stem}${extension}`;

          if (clean) {
            const glob = `${stem}.*${extension}`;
            const files = fg.sync(glob);
            for (const file of files) {
              unlinkSync(file);
            }
          }

          const hash = createHash("sha1");
          const css = readFileSync(filePath).toString();
          hash.update(css);

          const digest = hash.digest("hex").substring(0, yargs["digest-length"]);

          const newFilePath = `${stem}.${digest}${extension}`;
          hrefAttribute.value = `${slash}${newFilePath}`;
          writeFileSync(newFilePath, css, { encoding: "utf8"});
        }
      }

      rewriter.emitStartTag(startTag);
    });

    const input = createReadStream(htmlPath, { encoding: "utf8" });
    input.pipe(rewriter).pipe(out);

    out.on("close", () => {
      unlinkSync(htmlPath);
      renameSync(newHtmlPath, htmlPath);
    });
  });
