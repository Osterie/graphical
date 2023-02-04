

onmessage = function(e) {
    importScripts("./library/classdefinition.js");

    // receive data from main thread
    let data = e.data;
    // perform computation-intensive task
    let result = computePixels(data.start_x, data.start_y, data.width, data.length, data.pixel_ratio, data.absolute_width, data.hue, data.saturation, data.lightness);
    // send result back to main thread
    postMessage(result);
}

function computePixels(start_x, start_y, width, length, pixel_ratio, absolute_width, hue, saturation, lightness) {
    let matrix_pixels = new Array(~~width)

    //column
    //width is locally declared as width for improved performance by reducing amount of property lookups
  for (let x = start_x, runs = width; x <= runs; x++) {
    if (matrix_pixels[x] == undefined) {
      matrix_pixels[x] = new Array(~~length);
    }

    for (let y = start_y, runs = length; y <= runs; y++) {
      let color_x = x * pixel_ratio
      let color_y = y * pixel_ratio
      matrix_pixels[x][y] = new Pixel(
        (x - start_x) * absolute_width,
        (y - start_y) * absolute_width,
        set_hue(hue, color_x, color_y),
        set_saturation(saturation, color_x, color_y),
        set_lightness(lightness, color_x, color_y),
        absolute_width
      );
    }
  }

  if (start_x == start_y && width == length) {
    // dataURL = canvas.toDataURL();
    // original_img.src = dataURL;
    // resizing_img.src = dataURL;
    return matrix_pixels;
  }

  // row
  for (let x = start_y, runs = length; x <= runs; x++) {
    if (matrix_pixels[x] == undefined) {
      matrix_pixels[x] = [];
      // matrix_pixels[x] = new Array(~~width);
    }

    for (let y = start_x, runs = width; y <= runs; y++) {
      let color_x = x * pixel_ratio
      let color_y = y * pixel_ratio

      matrix_pixels[x][y] = new Pixel(
        (x - start_x) * absolute_width,
        (y - start_y) * absolute_width,
        set_hue(hue, color_x, color_y),
        set_saturation(saturation, color_x, color_y),
        set_lightness(lightness, color_x, color_y),
        absolute_width
      );
    }
  }

  return matrix_pixels;
}

function set_hue(expression, x, y) {
    return Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )();
  }
  
  function set_saturation(expression, x, y) {
    //Sawtooth pattern
    return Math.abs( ((100 + Function( `return + ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
  }
  
  function set_lightness(expression, x, y) {
    return Math.abs( ((100 + Function( `return + ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100
    );
  }
  