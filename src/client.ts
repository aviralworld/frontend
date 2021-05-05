import * as sapper from "@sapper/app";

sapper.start({
  target: document.querySelector("#sapper"),
});

// we had a default Sapper service worker, which caused a lot of problems
const { serviceWorker } = navigator;

if (serviceWorker !== undefined) {
  serviceWorker
    .getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister()));
}
