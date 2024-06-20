"use strict";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/video-framer/sw.js")
    .then((registration) => {
      console.debug(
        "ServiceWorker registration successful with scope:",
        registration.scope,
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
        video.id = "video";
        video.src = URL.createObjectURL(videoBlob);
        app.replaceChildren(video);
        const frames = [];
        const loop = async () => {
          const frame = await createImageBitmap(video);
          frames.push(frame);
          if (!video.ended) video.requestVideoFrameCallback(loop);
        };
        video.requestVideoFrameCallback(loop);
        video.onended = () => {
          console.log(frames.length);
          const canvas = document.createElement("canvas");
          canvas.id = "canvas";
          const ctx = canvas.getContext("2d");

          const render = (frame) => {
            canvas.width = frame.width;
            canvas.height = frame.height;
            ctx.drawImage(frame, 0, 0);
          };

          let index = 0;
          canvas.onclick = (e) => {
            const ratio = (e.clientX * 100) / canvas.width;
            const position =
              ratio < 30 ? "left" : ratio < 70 ? "center" : "right";
            console.log({ index, position });
            switch (position) {
              case "left":
                if (index <= 0) return;
                render(frames[--index]);
                return;

              case "center":
                return;

              case "right":
                if (index >= frames.length - 1) return;
                render(frames[++index]);
                return;
            }
          };

          app.replaceChildren(canvas);
          render(frames[0]);
        };
        video.play();
        return;
      }

      default: {
        console.error("unknown event action received:", event.data.action);
      }
    }
  };
}

const videoInput = document.getElementById("videoInput");
videoInput.onchange = () => {
  if (videoInput.files.length == 0) return;
  const file = videoInput.files.item(0);
  const body = new FormData();
  body.append("file", file);
  fetch("/video-framer/share", {
    method: "POST",
    body,
  });
};
