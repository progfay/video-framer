"use strict";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/video-framer/sw.js")
    .then((registration) => {
      console.debug(
        "ServiceWorker registration successful with scope:",
        registration.scope
      );
    })
    .catch((err) => {
      console.error("ServiceWorker registration failed:", err);
    });

  navigator.serviceWorker.onmessage = function (event) {
    switch (event.data.action) {
      case "share-video": {
        const videoBlob = event.data.file;
        const app = document.getElementById("app");
        const video = document.createElement("video");
        video.src = URL.createObjectURL(videoBlob);
        app.appendChild(video);
        return;
      }

      default: {
        console.error("unknown event action received:", event.data.action);
      }
    }
  };
}
