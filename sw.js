const CACHE_NAME = "video-framer";

const SAME_ORIGIN_RESOURCE = [
  // "/video-framer",
  // "/video-framer/index.html",
  // "/video-framer/manifest.json",
  // "/video-framer/sw.js",
  // "/video-framer/favicon.ico",
  // "/video-framer/images/android-chrome-192x192.png",
  // "/video-framer/images/android-chrome-512x512.png",
  // "/video-framer/images/apple-touch-icon.png",
  // "/video-framer/images/favicon-16x16.png",
  // "/video-framer/images/favicon-32x32.png",
];

const CROSS_ORIGIN_RESOURCE = [];

self.addEventListener("install", (e) => {
  const installing = async () => {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll([
      ...SAME_ORIGIN_RESOURCE,
      ...CROSS_ORIGIN_RESOURCE.map((url) => new Request(url, { mode: "cors" })),
    ]);
  };

  e.waitUntil(installing());
});

self.addEventListener("fetch", function (e) {
  if (
    e.request.method === "POST" &&
    e.request.url.startsWith(`${location.origin}/video-framer/share`)
  ) {
    e.respondWith(
      Response.redirect(`${location.origin}/video-framer/index.html`),
    );
    e.waitUntil(
      Promise.resolve().then(async () => {
        const data = await e.request.formData();
        const client = await self.clients.get(
          e.resultingClientId || e.clientId,
        );
        const file = data.get("file");
        client.postMessage({ file, action: "share-video" });
      }),
    );
    return;
  }

  // e.respondWith(
  //   caches
  //     .match(e.request.url, { ignoreSearch: true })
  //     .then(async (response) => {
  //       if (response) return response;

  //       const resp = fetch(e.request.url, { mode: "cors" });

  //       setTimeout(async () => {
  //         if (!/^https?:\/\//.test(e.request.url)) return;
  //         const cache = await caches.open(CACHE_NAME);
  //         await cache.put(e.request.url, await resp);
  //       }, 0);

  //       return resp;
  //     })
  // );
});
