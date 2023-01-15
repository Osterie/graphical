//---------------------Accessing DOM elements------------------------
//TODO: size is only used to change absolute_width

const c =  console.log.bind(console);

const get_hue_expression = document.getElementById("hue_expression");
const get_saturation_expression = document.getElementById(
  "saturation_expression"
);
const get_lightness_expression = document.getElementById(
  "lightness_expression"
);
const get_size_lower = document.getElementById("size_lower");
const get_size_upper = document.getElementById("size_upper");
const get_pixel_ratio = document.getElementById("pixel_ratio");

const get_upscale = document.getElementById("upscale");

get_hue_expression.addEventListener("change", function () {
  hue_expression = get_hue_expression.value;
  class_method_loop(1);
});
get_saturation_expression.addEventListener("change", function () {
  saturation_expression = get_saturation_expression.value;
  class_method_loop(2);
});
get_lightness_expression.addEventListener("change", function () {
  lightness_expression = get_lightness_expression.value;
  class_method_loop(3);
});
get_pixel_ratio.addEventListener("change", function () {
  
  pixel_ratio = +get_pixel_ratio.value;
  size_lower = ~~(+get_size_lower.value / pixel_ratio);
  size_upper = ~~(+get_size_upper.value / pixel_ratio);
  size = size_upper - size_lower + 1;
  absolute_width = canvas.width / size;
  change_pixel_ratio();
});

get_size_lower.addEventListener("change", function () {
  let old_size = size_lower
  size_lower = ~~(+get_size_lower.value / pixel_ratio);
  size = size_upper - size_lower + 1;
  absolute_width = canvas.width / size ;
  change_size(old_size, 'lower');
});

get_size_upper.addEventListener("change", function () {
  let old_size = size_upper
  size_upper = ~~(+get_size_upper.value / pixel_ratio);
  size = size_upper - size_lower + 1;
  absolute_width = canvas.width / size;
  change_size(old_size, 'higher');
});

get_upscale.addEventListener("click", function () {
  draw_pixels(size_lower, size_upper, size_lower, size_upper);
  original_img.src = canvas.toDataURL()
});

//-----------------------Canvas-----------------------------

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;
// ctx.imageSmoothingQuality = "high"

//----------------Creation of pixels--------------------------------

let matrix_pixels = [];
let size_lower = +get_size_lower.value;
let size_upper = +get_size_upper.value;
let size = size_upper - size_lower + 1;
let absolute_width;
var pixel_ratio = parseFloat(get_pixel_ratio.value);

//Distance from top left corner for x and y values

let hue_expression = get_hue_expression.value;
let saturation_expression = get_saturation_expression.value;
let lightness_expression = get_lightness_expression.value;

//-------------------------------GUIDING BOX FOR RESIZE--------------------

canvas.addEventListener("mousedown", function (e) {
  get_cursor_position(canvas, e);
});
canvas.addEventListener("mouseup", function (e) {
  get_cursor_position(canvas, e);
});

//image used for resizing
let resizing_img;
resizing_img = new Image();
let dataURL;

//how the image looks when all pixels are drawn at once at their "intended" size
let original_img;
original_img = new Image();
let dataURL2;

let clicked_released_xpos = [];
let clicked_released_ypos = [];

//----------------------------Classes-------------------------

class pixel { 
  constructor(xpos, ypos, hue, saturation, lightness, pixel_size) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.hue = hue;
    this.saturation = saturation;
    this.lightness = lightness;
    absolute_width = pixel_size
    this.tegn();
  }

  tegn() {
    switch (true) {
      case isFinite(this.hue):
        this.color = `hsl( ${this.hue} , ${this.saturation}% , ${this.lightness}%)`;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.xpos, this.ypos, absolute_width, absolute_width) ;
        break;

      default:
        this.color = `hsl(0, 0%, 0%)`;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.xpos, this.ypos, absolute_width, absolute_width) ;
        break;
    }
  }

  hue_changed(x, y) {
    this.hue = Function( `return ${hue_expression.replace(/X/g, x).replace(/Y/g, y)}` )();
    this.tegn();
  }

  saturation_changed(x, y) {
    this.saturation = Math.abs( ((100 + Function( `return ${saturation_expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
    this.tegn();
  }
  lightness_changed(x, y) {
    this.lightness = Math.abs( ((100 + Function( `return ${lightness_expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
    this.tegn();
  }

}

//------------------------INITIALIZATION------------------------

window.onload = winInit;
function winInit() {
  // ctx.filter = "hue-rotate(200deg)" //INTERESTING!
  size = size_upper - size_lower + 1;
  absolute_width = (canvas.width / size ); //width in px of every "pixel" drawn on canvas
  new_pixels(size_lower, size_lower, size_upper, size_upper);
}

//-----------------------FUNCTIONS------------------------

//TODO arguments should be same for new/draw_pixels


function new_pixels(start_x, start_y, width, length) {
  //column
  //width is locally declared as width for improved performance by reducing amount of property lookups
  for (let x = start_x, runs = width; x <= runs; x++) {
    if (matrix_pixels[x] == undefined) {
      matrix_pixels[x] = new Array(~~length);
    }

    for (let y = start_y, runs = length; y <= runs; y++) {
      let color_x = x * pixel_ratio
      let color_y = y * pixel_ratio
      matrix_pixels[x][y] = new pixel(
        (x - start_x) * absolute_width,
        (y - start_x) * absolute_width,
        change_hue(color_x, color_y),
        change_saturation(color_x, color_y),
        change_lightness(color_x, color_y),
        absolute_width
      );
    }
  }

  if (start_x == start_y && width == length) {
    dataURL = canvas.toDataURL();
    original_img.src = dataURL;
    resizing_img.src = dataURL;
    return;
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

      matrix_pixels[x][y] = new pixel(
        (x - size_lower) * absolute_width,
        (y - size_lower) * absolute_width,
        change_hue(color_x, color_y),
        change_saturation(color_x, color_y),
        change_lightness(color_x, color_y),
        absolute_width
      );
    }
  }

  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

function draw_pixels(start_x, width, start_y, length) {
  for (let x = start_x, runs = width; x <= runs; x++) {
    for (let y = start_y, runs = length; y <= runs; y++) {

      matrix_pixels[x][y].xpos = (x - start_x) * absolute_width;
      matrix_pixels[x][y].ypos = (y - start_y) * absolute_width;
      matrix_pixels[x][y].tegn();
    }
  }
  resizing_img.src = canvas.toDataURL();
}

//TODO: is resizing_img needed?

function change_size(old_size_bipartite , change){
  //old_size_bipartite means its either the old size_lower or old size_upper
  switch (true) {

    //size_upper changed
    case change === 'higher' && size_upper >= old_size_bipartite:
    //size of pixel - the old size (abs(size_lower) + abs(size_upper))
      var image_size = ~~((absolute_width) * (old_size_bipartite+1 - size_lower))
      ctx.drawImage(resizing_img, 0, 0, image_size, image_size);
      new_pixels(size_lower, old_size_bipartite+1, size_upper, size_upper);
      break;


    //size_lower changed
    case change === 'lower' && size_lower <= old_size_bipartite :

      //size of pixel - the old size (abs(size_lower) + abs(size_upper))
      var distance_from_top_left = ~~(absolute_width) * (old_size_bipartite - size_lower)
      var image_size = ~~((absolute_width) * (size_upper - old_size_bipartite + 1 ))

      ctx.drawImage(resizing_img, distance_from_top_left, distance_from_top_left, image_size, image_size);
      new_pixels(size_lower, size_lower, old_size_bipartite-1, size_upper);
      break;

    //size_upper has decreased or size_lower has increased
    default:

      draw_pixels(size_lower, size_upper, size_lower, size_upper);
      original_img.src = canvas.toDataURL();
      break;
  }
}


function change_pixel_ratio() {
  //Checks if get_pixel_ratio.value has quotations, having quotations creates a cool effect
  //Because it makes pixel_ratio a string and not a float
  if (get_pixel_ratio.value.includes('"')) {
    pixel_ratio = get_pixel_ratio.value.replace(/\"/g, "");
  } 
  else {
    pixel_ratio = parseFloat(get_pixel_ratio.value);
  }
  new_pixels(size_lower, size_lower, size_upper, size_upper);
}

function class_method_loop(letter) {
  //Hue
  if (letter === 1) {
    var letter_method = pixel.prototype.hue_changed;
  }
  //Saturation
  else if (letter === 2) {
    var letter_method = pixel.prototype.saturation_changed;
  }
  //Lightness
  else if (letter === 3) {
    var letter_method = pixel.prototype.lightness_changed;
  }


  for (let x = size_lower; x < size_upper; x++) {
    for (let y = size_lower; y < size_upper; y++) {
      letter_method.call(matrix_pixels[x][y], x*pixel_ratio, y*pixel_ratio);
    }
  }
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

function change_hue(x, y) {
  return Function( `return ${hue_expression.replace(/X/g, x).replace(/Y/g, y)}` )();
}

function change_saturation(x, y) {
  //Sawtooth pattern
  return Math.abs( ((100 + Function( `return + ${saturation_expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
}

function change_lightness(x, y) {
  return Math.abs( ((100 + Function( `return + ${lightness_expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100
  );
}


//---------------------ZOOMING-------------------

function get_cursor_position(canvas, event) {

  if (event.type == "mousedown") {
    canvas.addEventListener("mousemove", zoom_guider);

    //finds the absolute coordinates clicked
    let down_x = event.offsetX;
    let down_y = event.offsetY;

    clicked_released_xpos = [down_x];
    clicked_released_ypos = [down_y];
  } 
  
  else if (event.type == "mouseup") {

    canvas.removeEventListener("mousemove", zoom_guider);

    if (event.ctrlKey) {
      size = size_upper - size_lower + 1;
      absolute_width = canvas.width / size;
      ctx.drawImage(original_img, 0, 0, 600, 600);
      resizing_img.src = canvas.toDataURL();
      return;
    } 
    
    else {
      //sorts array from lowest to highest
      clicked_released_xpos.sort(function (a, b) {return a - b;});
      clicked_released_ypos.sort(function (a, b) {return a - b;});

      let start_x = ~~(clicked_released_xpos[0] / absolute_width) + size_lower;
      let end_x = ~~(clicked_released_xpos[1] / absolute_width) + size_lower;
      let start_y = -(~~(clicked_released_ypos[1] / absolute_width) + size_lower);
      let end_y = -(~~(clicked_released_ypos[0] / absolute_width) + size_lower);


      //TODO: remove me
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (end_x - start_x > end_y - start_y) {
        start_y -= 1;
      } 
      else if (end_x - start_x < end_y - start_y) {
        start_x -= 1;
      }

      size = end_x - start_x + 1;
      absolute_width = canvas.width / size ;

      draw_pixels(start_x, end_x , -end_y, -start_y);
    }
  }
}

function zoom_guider() {

  ctx.drawImage(resizing_img, 0, 0, 600, 600);

  current_x = event.offsetX;
  current_y = event.offsetY;

  clicked_released_xpos[1] = current_x;
  clicked_released_ypos[1] = current_y;

  let guiding_box_height; //Positive values down, negative values up.
  let guiding_box_width; //positive values to the right, negative to the left.

  //checks where current x and y pos are in relation to down_x and down_y
  let right = false;
  let above = false;

  let distance_from_down_x = Math.abs(current_x - clicked_released_xpos[0])
  let distance_from_down_y =  Math.abs(current_y - clicked_released_ypos[0])

  if (current_x - clicked_released_xpos[0] > 0) {
    right = true;
  }

  if (current_y - clicked_released_ypos[0] < 0) {
    above = true;
  }

  //current mouse position is in top right or bottom left quadrant
  if ((right && above) || (!right && !above)) {
    //FIXME: Super chunky and ugly
    if (distance_from_down_x > distance_from_down_y) {
      guiding_box_width  = current_x - clicked_released_xpos[0];
      guiding_box_height = clicked_released_xpos[0] - current_x;
    } 
    
    else {
      guiding_box_width = clicked_released_ypos[0] - current_y;
      guiding_box_height = current_y - clicked_released_ypos[0];
    }
  } 
  
  else if ((right && !above) || (!right && above)) {
    
    if (distance_from_down_x > distance_from_down_y) {
      guiding_box_width  = current_x - clicked_released_xpos[0];
      guiding_box_height = current_x - clicked_released_xpos[0];
    } 
    else {
      guiding_box_width  = current_y - clicked_released_ypos[0];
      guiding_box_height = current_y - clicked_released_ypos[0];
    }
  }

  //Draws the guiding box
  clicked_released_xpos[1] = clicked_released_xpos[0] + ~~guiding_box_width;
  clicked_released_ypos[1] = clicked_released_ypos[0] + ~~guiding_box_height;

  ctx.beginPath();
  ctx.rect(clicked_released_xpos[0], clicked_released_ypos[0], guiding_box_width, guiding_box_height);
  ctx.stroke();
}


//------------------START--------------------
//TO BE USED ANOTHER TIME?
// var animId;

// const get_runspeed = document.getElementById("runspeed");
// get_runspeed.addEventListener("change", change_runspeed);
// var runspeed = 1;
// function change_runspeed() {
//   if (get_runspeed.value == 0) {
//     clearInterval(animId);
//   } else {
//     if (animId) {
//       clearInterval(animId);
//     }
//     runspeed = get_runspeed.value;
//     animId = setInterval(draw_pixels, 1000 / runspeed);
//TODO: the draw_pixels function must be made again if i want make a changing variable that changes every second or whatever
//   }
// }
//------------------END--------------------

//!HUGE? TODO: use webworkers, ask chat gpt-3 for help

//?WONFIX TODO: Minor fix in the new_pixels function, it creates the corner piece twice

//TODO: Research complex plotting or whatever, make an option to change to using complex numbers?

//TODO: Create a settings button where settings can be changed/toggled?
//TODO:! Add a button for the option to redraw the black background, creates very interesting patterns when the size of the pixels are < 1
//TODO: Make an option to turn on the sawtooth pattern for hue too? and create lower and upper limit, this.hue =  Math.abs(( (100 + Function("return " + hue_expression)()) % 200) - 100)
//!TODO: Create a option to toggle between clicking a button to run script and running script when a variable is changed.
//!TODO: Performance mode and fast mode, ise ctx.drawimage method for fast and redraw every pixel every time for fast mode.
//TODO: save settings in localstorage

//TODO: make it possible to zoom in on inzoomed image.

//TODO: Create option to make a variable that changes every second f.eks. goes from 1 to 10 then 10 to 1, call it n and then n can be
// used in the color chooser

//TODO: when changing size, the direction of which the new image is drawn in is wrong..
//TODO: Add more color models, i.e rgb and such
//TODO: Make it possible to click a button, or hold down shift, or something, and then be able to hover a pixel, get the position and color(both see the color as a larger image and see the values for the color)?

//*------------------------------------------------COMPLETED---------------------------------------
//* Create variable for width and height of pixels(or just size of pixels), must change array size to compensate
//* Create vector to angle function and make it usable in hue, saturation and color variables. Works for radians and degrees!
//* Make a smooth tranistion for saturation and lighness
//* Maybe will have to, but make a "enhance" button, if the image is unclear, it should be possible to redraw every pixel
//* It is probably faster/more efficient to just change color of all pixels when changing color, instead of creating new pixels
//* Use same draw image method for zoom_outline
//* Fix: pixel_ratio creates a bug when changing size
//* Fix: dont need to make new Image() everytime resizing_img is declared or whatever
//* No point in drawing everything of only a small part is shown,
//* make it so that you can only draw complete pixels with zoom_guider, and only draw and show the pixels "selected"
//* HUGE create own functions and such instead of using fulabl libraries. Functions to be made self include : tegnFyltRektangel, tegnfirkant, tegnBrukXY, tegnBrukBakgrunn, tegnBrukSynsfelt, tegnBrukCanvas
//* size_lower_changed and size_upper_changed turned into one function