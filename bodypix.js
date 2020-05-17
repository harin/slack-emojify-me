let sketch = function (p) {
  let bodypix;
  let video;
  let segmentation;
  let img;
  let result;
  let canvas;
  let emoji;
  let slider;
  let save;
  let download;
  const options = {
    outputStride: 8, // 8, 16, or 32, default is 16
    segmentationThreshold: 0.5, // 0 - 1, defaults to 0.5
  };

  const canvasSide = 128;

  /**
   * Takes a screenshot from video.
   * @param videoEl {Element} Video element
   * @param scale {Number} Screenshot scale (default = 1)
   * @returns {Element} Screenshot image element
   */
  function getScreenshot(videoEl, scale) {
    scale = scale || 1;

    const canvas = document.createElement("canvas");
    canvas.width = videoEl.width * scale;
    canvas.height = videoEl.height * scale;
    canvas
      .getContext("2d")
      .drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }

  function downloadImage(img) {
    p.saveCanvas(img, "png");
  }

  p.preload = function () {
    ml5.p5Utils.setP5Instance(p);
    bodypix = ml5.bodyPix(options);
  };

  p.setup = function () {
    p.createCanvas(canvasSide, canvasSide);
    canvas = document.querySelector(".p5Canvas");
    canvas.style.border = "1px solid black";

    save = document.querySelector("#save");
    download = document.querySelector("#download");
    result = document.querySelector("#result");
    slider = document.querySelector("#myslider");

    // load up your video
    video = p.createCapture(p.VIDEO);
    // set to make it work with ios and android
    video.elt.setAttribute("playsinline", "");
    video.hide();

    save.addEventListener("click", function (e) {
      emoji = new Image();
      emoji.src = canvas.toDataURL();
      emoji.style.border = "1px solid black";
      save.innerHTML = "Retake";
      download.style.display = "block";
      result.innerHTML = "";
      result.appendChild(emoji);
    });

    download.addEventListener("click", function () {
      downloadImage();
    });

    slider.addEventListener("change", function () {
      bodypix.config.segmentationThreshold = parseInt(slider.value) / 100;
    });
  };

  let startProcessing = false;
  let loadingFinishes = false;
  let numElipses = 0;

  p.draw = function () {
    if (video.loadedmetadata && startProcessing == false) {
      startProcessing = true;
      bodypix.segment(video, gotResults);
    }

    if (loadingFinishes == false) {
      p.clear();
      let str = "Loading";
      for (let i = 0; i < numElipses; i += 30) {
        str += ".";
      }
      p.text(str, 30, 60);
      numElipses += 1;
      numElipses %= 90; // 30fps, 1 ellipse per second}
    }
  };

  function gotResults(err, result) {
    loadingFinishes = true;
    if (err) {
      console.log(err);
      return;
    }

    segmentation = result;
    p.clear();
    dx = 0;
    dy = 0;
    dwidth = canvasSide;
    dheight = canvasSide;
    let scale = dheight / video.elt.height;
    let offset = 64 / scale;
    sx = video.elt.width / 2 - offset;
    sy = video.elt.height / 2 - offset;

    let ratio = video.elt.height / video.elt.width;
    p.image(
      segmentation.backgroundMask,
      dx,
      dy,
      dwidth,
      dheight,
      sx,
      sy,
      offset * 2,
      offset * 2
    );

    bodypix.segment(video, gotResults);
  }
};

new p5(sketch, "emoji-preview");
