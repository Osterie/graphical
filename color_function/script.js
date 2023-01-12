
//---------------------Accessing DOM elements------------------------

const get_hue_expression = document.getElementById("hue_expression");
const get_saturation_expression = document.getElementById("saturation_expression");
const get_lightness_expression = document.getElementById( "lightness_expression" );
const get_size_lower = document.getElementById("size_lower");
const get_size_upper = document.getElementById("size_upper");
const get_pixel_size = document.getElementById("pixel_size");

const get_upscale = document.getElementById("upscale");

get_hue_expression.addEventListener("change", function () { hue_expression = get_hue_expression.value; hsl_loop(1); });
get_saturation_expression.addEventListener("change", function () { saturation_expression = get_saturation_expression.value; hsl_loop(2); });
get_lightness_expression.addEventListener("change", function () { lightness_expression = get_lightness_expression.value; hsl_loop(3); });
get_size_lower.addEventListener("change", change_size_lower);
get_size_upper.addEventListener("change", change_size_upper);
get_pixel_size.addEventListener("change", change_pixel_size);

get_upscale.addEventListener("click", function () {
  distance_x = size_lower * pixel_size;
  distance_y = size_lower * pixel_size;
  // absolute_width = canvas.width / size;
  // absolute_width = absolute_width/ pixel_size
  draw_pixels(size_lower, size_upper, size_lower, size_upper);
});

//-----------------------Canvas-----------------------------

let canvas = document.getElementById("canvas");
canvas.addEventListener("mousedown", function (e) { get_cursor_position(canvas, e); });
canvas.addEventListener("mouseup", function (e) { get_cursor_position(canvas, e); })
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;
// ctx.imageSmoothingQuality = "high"

//----------------Creation of pixels--------------------------------

let matrix_pixels = [];
let size_lower = +get_size_lower.value;
let size_upper = +get_size_upper.value;
let size =  (size_upper - size_lower);
let absolute_width;
var pixel_size = parseFloat(get_pixel_size.value);

//Distance from top left corner for x and y values
let distance_x = size_lower;
let distance_y = size_lower;

let hue_expression = get_hue_expression.value
let saturation_expression = get_saturation_expression.value
let lightness_expression = get_lightness_expression.value

//-------------------------------GUIDING BOX FOR RESIZE--------------------

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
    // this.pixel_size = pixel_size;
    this.tegn();
  }

  tegn() {
    if (isFinite(this.hue)) {
      draw(
        this.xpos,
        this.ypos,
        `hsl( ${this.hue} , ${this.saturation}% , ${this.lightness}%)`
      );
    } 
    else {
      draw(
        this.xpos,
        this.ypos,
        `hsl(0, 0%, 0%)`
      );
    }
    // tegnTekst(`(${this.xpos}, ${this.ypos})` ,this.xpos, this.ypos, 'black', 0, 'left', 10, 'Calibri', 'bottom')
  }

  hue_changed(x, y) {
    this.hue = Function(`return ${hue_expression.replace(/X/g, x).replace(/Y/g, y)}`)();
    this.tegn();
  }

  saturation_changed(x, y) {
    this.saturation = Math.abs(
      ((100 + Function(`return ${saturation_expression.replace(/X/g, x).replace(/Y/g, y)}`)()) % 200) - 100);
    this.tegn();
  }
  lightness_changed(x, y) {
    this.lightness = Math.abs(
      ((100 + Function(`return ${lightness_expression.replace(/X/g, x).replace(/Y/g, y)}`)()) % 200) - 100);
    this.tegn();
  }
}

//------------------------INITIALIZATION------------------------

window.onload = winInit;
function winInit() {
  // ctx.filter = "hue-rotate(200deg)" INTERESTING!
  size = ( size_upper - size_lower);
  absolute_width = canvas.width / size; //width in px of every "pixel" drawn on canvas
  new_pixels(size_lower, size_lower, size_upper, size_upper);
}

//-----------------------FUNCTIONS------------------------

function new_pixels(start_x, start_y, width, length) {
  // console.log({start_x}, {start_y}, {width}, {length})
  absolute_width = (canvas.width / size / pixel_size);

  //column
  //width is locally declared as width for improved performance by reducing amount of property lookups
  for (let x = start_x, runs = width; x < runs; x++) {
    if (matrix_pixels[x] == undefined) {
      matrix_pixels[x] = new Array(~~length);
    }
    
    for (let y = start_y, runs = length; y < runs; y++) {
      matrix_pixels[x][y] = new pixel(
        x * pixel_size,
        y * pixel_size,
        change_hue(x * pixel_size, y * pixel_size),
        change_saturation(x * pixel_size, y * pixel_size),
        change_lightness(x * pixel_size, y * pixel_size),
        pixel_size
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
  for (let x = start_y, runs = length; x < runs; x++) {
    if (matrix_pixels[x] == undefined) {
      matrix_pixels[x] = [];
      // matrix_pixels[x] = new Array(~~width);
    }

    for (let y = start_x, runs = width; y < runs; y++) {

      matrix_pixels[x][y] = new pixel(
        x * pixel_size,
        y * pixel_size,
        change_hue(x * pixel_size, y * pixel_size),
        change_saturation(x * pixel_size, y * pixel_size),
        change_lightness(x * pixel_size, y * pixel_size),
        pixel_size
      );
    }
  }
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

function create_pixels(start, end) {
  size = size_upper - size_lower;
  new_pixels(start, start, end, end);
}


function draw(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    (x - distance_x) * absolute_width,
    (y - distance_y) * absolute_width + absolute_width,
    absolute_width,
    -(absolute_width)
  );
}


function draw_pixels(dimension_start_x, dimension_end_x, dimension_start_y, dimension_end_y) {
  for (let x = dimension_start_x, width = dimension_end_x; x < width; x++) {
    for (let y = dimension_start_y, length = dimension_end_y; y < length; y++) {
      matrix_pixels[x][y].tegn();
    }
  }
  resizing_img.src = canvas.toDataURL();
}

function change_pixel_size() {
  
  //Checks if get_pixel_size.value has quotations, having quotations creates a cool effect
  //Because it makes pixel_size a string and not a float
  if (get_pixel_size.value.includes('"')) {
    pixel_size = get_pixel_size.value.replace(/\"/g, "");
  } 
  else {
    pixel_size = parseFloat(get_pixel_size.value);
  }

  size_lower = get_size_lower.value / pixel_size;
  size_upper = get_size_upper.value / pixel_size;
  size =  size_upper - size_lower;
  new_pixels(size_lower, size_lower, size_upper, size_upper)
}

function hsl_loop(letter) {
  if (letter === 1) {
    var letter_method = pixel.prototype.hue_changed;
  } 
  else if (letter === 2) {
    var letter_method = pixel.prototype.saturation_changed;
  } 
  else if (letter === 3) {
    var letter_method = pixel.prototype.lightness_changed;
  }

  distance_x = size_lower;
  distance_y = size_lower;

  absolute_width = canvas.width / size; //width in px of every "pixel" drawn on canvas

  for (let x = size_lower; x < size_upper; x++) {
    for (let y = size_lower; y < size_upper; y++) {
      letter_method.call(matrix_pixels[x][y], x * pixel_size, y * pixel_size);
    }
  }
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

function change_hue(x, y) {
  return Function(`return ${hue_expression.replace(/X/g, x).replace(/Y/g, y)}`)();
}

function change_saturation(x, y) {
  //Sawtooth pattern
  return Math.abs(((100 + Function(`return + ${saturation_expression.replace(/X/g, x).replace(/Y/g, y)}`)()) % 200) - 100);
}

function change_lightness(x, y) {
  return Math.abs(((100 + Function(`return + ${lightness_expression.replace(/X/g, x).replace(/Y/g, y)}`)()) % 200) - 100);
}

//TODO: turn into 1 function... ?

function change_size_upper() {
  let new_size = parseInt(get_size_upper.value) / pixel_size;

  switch (true) {
    
    case new_size > size_upper:
      let old_size_upper = size_upper;
      size_upper = new_size;

      size =  size_upper - size_lower;
      
      ctx.drawImage(
        resizing_img,
        0,
        0,
        ~~((600 / size) * (size - (new_size - old_size_upper))),
        ~~((600 / size) * (size - (new_size - old_size_upper)))
      );
      
      new_pixels(size_lower, old_size_upper, size_upper, size_upper);
      break;

    default:
      size_upper = new_size;
      distance_x = size_lower * pixel_size;
      distance_y = size_lower * pixel_size;
      size =  size_upper - size_lower;
      absolute_width = canvas.width / size / pixel_size
      draw_pixels(size_lower, size_upper, size_lower, size_upper);
      break;
  }
}

function change_size_lower() {
  let new_size = parseInt(get_size_lower.value) / pixel_size;

  switch (true) {
    case new_size < size_lower:
      let old_size_lower = size_lower;
      size_lower = new_size;

      size =  size_upper - size_lower;

      ctx.drawImage(
        resizing_img,
        (600 / size) * (old_size_lower - new_size),
        (600 / size) * (old_size_lower - new_size),
        ~~((600 / size) * (size - (old_size_lower - new_size))),
        ~~((600 / size) * (size - (old_size_lower - new_size)))
      );

      distance_x = size_lower * pixel_size;
      distance_y = size_lower * pixel_size;
      new_pixels(new_size, new_size, old_size_lower, size_upper);
      
      break;

      default:
      
        size_lower = new_size;
        distance_x = (size_lower * pixel_size);
        distance_y = (size_lower * pixel_size);

        
        size =  size_upper - size_lower;
        absolute_width = canvas.width / size / pixel_size
        draw_pixels(size_lower, size_upper, size_lower, size_upper);
      break;
  }
}


//---------------------ZOOMING-------------------

function get_cursor_position(canvas, event) {
  size =  size_upper - size_lower;

  let absolute_width_pixel = canvas.width / size;
  // let absolute_heigth_pixel = canvas.height / size;

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
      ctx.drawImage(original_img, 0, 0, 600, 600);
      resizing_img.src = canvas.toDataURL();
      return;
    } 
    
    else {
      //sorts array from lowest to highest
      clicked_released_xpos.sort(function (a, b) {return a - b;});
      clicked_released_ypos.sort(function (a, b) {return a - b;});

      let start_x = ~~(clicked_released_xpos[0] / absolute_width_pixel) + size_lower;
      let end_x   = ~~(clicked_released_xpos[1] / absolute_width_pixel) + size_lower;
      let start_y = ~~(clicked_released_ypos[0] / absolute_width_pixel) + size_lower;
      let end_y   = ~~(clicked_released_ypos[1] / absolute_width_pixel) + size_lower;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (end_x - start_x > end_y - start_y) {
        start_y -= 1;
      } 
      else if (end_x - start_x < end_y - start_y) {
        start_x -= 1;
      }

      size = end_x - start_x + 1;
      distance_x = start_x;
      distance_y = start_y;
      absolute_width = canvas.width / size;
      draw_pixels(start_x, end_x + 1, start_y, end_y + 1);
    }
  }
}

function zoom_guider() {
  ctx.drawImage(resizing_img, 0, 0, 600, 600);

  current_x = event.offsetX;
  current_y = event.offsetY;

  clicked_released_xpos[1] = current_x;
  clicked_released_ypos[1] = current_y;
  ctx.beginPath();

  let height; //Positive values down, negative values up.
  let width; //positive values to the right, negative to the left.

  //checks where current x and y pos are in relation to down_x and down_y
  let right = false;
  let above = false;

  if (current_x - clicked_released_xpos[0] > 0) {
    right = true;
  }

  if (current_y - clicked_released_ypos[0] < 0) {
    above = true;
  }

  if ((right && above) || (!right && !above)) {
    
    //FIXME: Super chunky and ugly
    if (Math.abs(current_x - clicked_released_xpos[0]) > Math.abs(current_y - clicked_released_ypos[0])) {
      width = current_x - clicked_released_xpos[0];
      height = -(current_x - clicked_released_xpos[0]);
    } 
    else {
      width = -(current_y -  clicked_released_ypos[0]);
      height = current_y -  clicked_released_ypos[0];
    }
  } 
  else if ((right && !above) || (!right && above)) {
    
    if (Math.abs(current_x - clicked_released_xpos[0]) > Math.abs(current_y - clicked_released_ypos[0])) {
      width = current_x - clicked_released_xpos[0];
      height = current_x - clicked_released_xpos[0];
    } 
    else {
      width = current_y - clicked_released_ypos[0];
      height = current_y - clicked_released_ypos[0];
    }
  }

  //Draws the guiding box
  clicked_released_xpos[1] = clicked_released_xpos[0] + ~~width;
  clicked_released_ypos[1] = clicked_released_ypos[0] + ~~height;
  ctx.rect(clicked_released_xpos[0], clicked_released_ypos[0], width, height);
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
//* Fix: pixel_size creates a bug when changing size
//* Fix: dont need to make new Image() everytime resizing_img is declared or whatever
//* No point in drawing everything of only a small part is shown,
//* make it so that you can only draw complete pixels with zoom_guider, and only draw and show the pixels "selected"
//* HUGE create own functions and such instead of using fulabl libraries. Functions to be made self include : tegnFyltRektangel, tegnfirkant, tegnBrukXY, tegnBrukBakgrunn, tegnBrukSynsfelt, tegnBrukCanvas
