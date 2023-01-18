//---------------------Accessing DOM elements------------------------
//TODO: size is only used to change absolute_width

const c =  console.log.bind(console);

const get_hue_expression = document.getElementById("hue_expression");
const get_saturation_expression = document.getElementById("saturation_expression");
const get_lightness_expression = document.getElementById("lightness_expression");
const get_size_lower = document.getElementById("size_lower");
const get_size_upper = document.getElementById("size_upper");
const get_pixel_ratio = document.getElementById("pixel_ratio");

const get_upscale_button = document.getElementById("upscale");

get_hue_expression.addEventListener("change", function () {
  hue_expression = get_hue_expression.value;

  matrix_squares.class_method_loop("hue", hue_expression);
});
get_saturation_expression.addEventListener("change", function () {
  saturation_expression = get_saturation_expression.value;

  matrix_squares.class_method_loop("saturation", saturation_expression);
});
get_lightness_expression.addEventListener("change", function () {
  lightness_expression = get_lightness_expression.value;

  matrix_squares.class_method_loop("lightness", lightness_expression);
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

get_upscale_button.addEventListener("click", function () {
  matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
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

let hue_expression = get_hue_expression.value;
let saturation_expression = get_saturation_expression.value;
let lightness_expression = get_lightness_expression.value;

//-------------------------------GUIDING BOX FOR RESIZE--------------------

canvas.addEventListener("mousedown", function (e) {get_cursor_position(canvas, e);});
canvas.addEventListener("mouseup", function (e) {get_cursor_position(canvas, e);});

let original_img = new Image(); //how the image looks when all pixels are drawn at once at their "intended" size
let resizing_img = new Image(); //image used for resizing
let dataURL;


let clicked_released_xpos = [];
let clicked_released_ypos = [];

//when zooming, is used to tell how far from top left the squares that are going to be drawn are
var distance_left_x_zooming = size_lower
var distance_top_y_zooming = size_lower

//----------------------------Classes-------------------------

class Square {
  constructor(xpos, ypos, hue, saturation, lightness, square_size) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.hue = hue;
    this.saturation = saturation;
    this.lightness = lightness;
    this.square_size = square_size
    this.draw();
  }

  draw() {
    // console.log('drawing'
    switch (true) {
      case isFinite(this.hue):
        this.color = `hsl( ${this.hue} , ${this.saturation}% , ${this.lightness}%)`;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.xpos, this.ypos, this.square_size, this.square_size) ;
        break;

      default:
        this.color = `hsl(0, 0%, 0%)`;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.xpos, this.ypos, this.square_size, this.square_size) ;
        break;
    }
  }

  hue_changed(expression, x, y) {
    this.hue = Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )();
    this.draw();
  }

  saturation_changed(expression, x, y) {
    this.saturation = Math.abs( ((100 + Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
    this.draw();
  }
  lightness_changed(expression, x, y) {
    this.lightness = Math.abs( ((100 + Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
    this.draw();
  }

}

class Square_matrix {

  constructor(hue, saturation, lightness){
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = false;
    this.square_matrix = []
    this.hue = hue
    this.saturation = saturation
    this.lightness = lightness
  }

  create_squares(start_x, start_y, width, length, square_dimensions, pixel_ratio){

    //column
    //width is locally declared as width for improved performance by reducing amount of property lookups
    for (let x = start_x, runs = width; x <= runs; x++) {
      if (this.square_matrix[x] == undefined) {
        this.square_matrix[x] = new Array(~~length);
      }

      for (let y = start_y, runs = length; y <= runs; y++) {
        let color_x = x * pixel_ratio
        let color_y = y * pixel_ratio
        this.square_matrix[x][y] = new Square(
          (x - start_x) * square_dimensions,
          (y - start_x) * square_dimensions,
          this.set_hue(this.hue, color_x, color_y),
          this.set_saturation(this.saturation, color_x, color_y),
          this.set_lightness(this.lightness, color_x, color_y),
          square_dimensions
        );
      }
    }
    
    if (start_x == start_y && width == length) {
      return;
    }
    
    // row
    for (let x = start_y, runs = length; x <= runs; x++) {
      if (this.square_matrix[x] == undefined) {
        this.square_matrix[x] = [];
        // this.square_matrix[x] = new    Array(~~width);
      }
  
      for (let y = start_x, runs = width; y <= runs; y++) {
        let color_x = x * pixel_ratio
        let color_y = y * pixel_ratio
  
        this.square_matrix[x][y] = new Square(
          (x - size_lower) * square_dimensions,
          (y - size_lower) * square_dimensions,
          this.set_hue(this.hue, color_x, color_y),
          this.set_saturation(this.saturation, color_x, color_y),
          this.set_lightness(this.lightness, color_x, color_y),
          square_dimensions
        );
      }
    }
  }
//TODO arguments should be same for new/draw_pixels
  draw_squares(start_x, end_x, start_y, end_y){
    for (let x = start_x, runs = end_x; x <= runs; x++) {
      for (let y = start_y, runs = end_y; y <= runs; y++) {
        this.square_matrix[x][y].xpos = (x  - start_x) * absolute_width;
        this.square_matrix[x][y].ypos = (y - start_y) * absolute_width;
        this.square_matrix[x][y].square_size = absolute_width;
        this.square_matrix[x][y].draw();
      }
    }
  }

  set_hue(expression, x, y) {
    return Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )();
  }

  set_saturation(expression, x, y) {
    return Math.abs( ((100 + Function( `return + ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 ); //Sawtooth pattern
  }
  
  set_lightness(expression, x, y) {
    return Math.abs( ((100 + Function( `return + ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100); //Sawtooth pattern
  }

  class_method_loop(method, component) {

    if (method === "hue") {
      var component_expression = component
      var class_method = Square.prototype.hue_changed;
    }
  
    else if (method === "saturation") {
      var component_expression = component
      var class_method = Square.prototype.saturation_changed;
    }
  
    else if (method === "lightness") {
      var component_expression = component
      var class_method = Square.prototype.lightness_changed;
    }
  
    for (let x = size_lower; x <= size_upper; x++) {
      for (let y = size_lower; y <= size_upper; y++) {
        class_method.call(this.square_matrix[x][y], component_expression, x*pixel_ratio, y*pixel_ratio);
      }
    }
  }
}

//------------------------INITIALIZATION------------------------

window.onload = winInit;
function winInit() {


  // ctx.filter = "hue-rotate(200deg)" //INTERESTING!
  size = size_upper - size_lower + 1;
  absolute_width = (canvas.width / size ); //width in px of every "pixel" drawn on canvas
  // new_pixels(size_lower, size_lower, size_upper, size_upper);
  matrix_squares = new Square_matrix(hue_expression, saturation_expression, lightness_expression)
  matrix_squares.create_squares(size_lower, size_lower, size_upper, size_upper, absolute_width, pixel_ratio)
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

//-----------------------FUNCTIONS------------------------


function change_size(old_size_bipartite , change){

  //old_size_bipartite means its either the old size_lower or old size_upper
  switch (true) {

    //size_upper changed
    case change === 'higher' && size_upper >= old_size_bipartite:
    //size of pixel - the old size (abs(size_lower) + abs(size_upper))

      var image_size = ~~((absolute_width) * (old_size_bipartite+1 - size_lower))
      ctx.drawImage(resizing_img, 0, 0, image_size, image_size);
      matrix_squares.create_squares(size_lower, old_size_bipartite+1, size_upper, size_upper, absolute_width, pixel_ratio)
      dataURL = canvas.toDataURL();
      original_img.src = dataURL;
      resizing_img.src = dataURL;
      // new_pixels(size_lower, old_size_bipartite+1, size_upper, size_upper);
      break;


    //size_lower changed
    case change === 'lower' && size_lower <= old_size_bipartite :

      //size of pixel - the old size (abs(size_lower) + abs(size_upper))
      var distance_from_top_left = ~~(absolute_width) * (old_size_bipartite - size_lower)
      var image_size = ~~((absolute_width) * (size_upper - old_size_bipartite + 1 ))

      ctx.drawImage(resizing_img, distance_from_top_left, distance_from_top_left, image_size, image_size);
      matrix_squares.create_squares(size_lower, size_lower, old_size_bipartite-1, size_upper, absolute_width, pixel_ratio)
      dataURL = canvas.toDataURL();
      original_img.src = dataURL;
      resizing_img.src = dataURL;
      break;

    //size_upper has decreased or size_lower has increased
    default:
      absolute_width = (canvas.width / size )
      matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
      dataURL = canvas.toDataURL();
      original_img.src = dataURL;
      resizing_img.src = dataURL;
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
  matrix_squares.create_squares(size_lower, size_lower, size_upper, size_upper, absolute_width, pixel_ratio)
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

function class_method_loop(method, component) {

  if (method === "hue") {
    var component_expression = component
    var class_method = Square.prototype.hue_changed;
  }

  else if (method === "saturation") {
    var component_expression = component
    var class_method = Square.prototype.saturation_changed;
  }

  else if (method === "lightness") {
    var component_expression = component
    var class_method = Square.prototype.lightness_changed;
  }

  for (let x = size_lower; x <= size_upper; x++) {
    for (let y = size_lower; y <= size_upper; y++) {
      class_method.call(matrix_squares[x][y], component_expression, x*pixel_ratio, y*pixel_ratio);
    }
  }

  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
}

function set_hue(x, y) {
  return Function( `return ${hue_expression.replace(/X/g, x).replace(/Y/g, y)}` )();
}

function set_saturation(x, y) {
  //Sawtooth pattern
  return Math.abs( ((100 + Function( `return + ${saturation_expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
}

function set_lightness(x, y) {
  
  return Math.abs( ((100 + Function( `return + ${lightness_expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100);
}


//---------------------ZOOMING-------------------


function get_cursor_position(canvas, event) {

  if (event.type == "mousedown") {
    canvas.addEventListener("mousemove", zoom_guider);

    //finds the absolute coordinates clicked
    let down_x = event.offsetX;
    let down_y = event.offsetY;

    //by setting index 0 and 1 to the same, when clicking a pixel you get the color
    clicked_released_xpos = [down_x, down_x];
    clicked_released_ypos = [down_y, down_y];
  }

  else if (event.type == "mouseup") {

    canvas.removeEventListener("mousemove", zoom_guider);

    if (event.ctrlKey) {
      size = size_upper - size_lower + 1;
      absolute_width = canvas.width / size;
      distance_left_x_zooming = size_lower
      distance_top_y_zooming = size_lower
      ctx.drawImage(original_img, 0, 0, 600, 600);
      resizing_img.src = canvas.toDataURL();
      return;
    }

    else {
      //sorts array from lowest to highest

      clicked_released_xpos.sort(function (a, b) {return a - b;});
      clicked_released_ypos.sort(function (a, b) {return a - b;});
      //TODO: instead of size_lower, shold be lowest size of current image
      let start_x = ~~(clicked_released_xpos[0] / absolute_width) + distance_left_x_zooming;
      let end_x = ~~(clicked_released_xpos[1] / absolute_width) + distance_left_x_zooming;

      let start_y = (~~(clicked_released_ypos[0] / absolute_width) + distance_top_y_zooming);
      let end_y = (~~(clicked_released_ypos[1] / absolute_width) + distance_top_y_zooming);


      if (end_x - start_x > end_y - start_y) {
        if (start_y-1 >= size_lower && start_y-1 <= size_upper){
          start_y -= 1;
        }
      }
      else if (end_x - start_x < end_y - start_y) {
        if (start_x-1 >= size_lower && start_x-1 <= size_upper){
        start_x -= 1;
        }
      }

      distance_left_x_zooming = start_x
      distance_top_y_zooming = start_y

      size = end_x - start_x + 1;
      absolute_width = canvas.width / size ;
      matrix_squares.draw_squares(start_x, end_x, start_y, end_y)
      dataURL = canvas.toDataURL();
      resizing_img.src = dataURL;
    }
  }
}


function zoom_guider() {

  let current_x = event.offsetX;
  let current_y = event.offsetY;

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


  //Parameters, must be between 0 and canvas.width/heigth
  let param_x = clicked_released_xpos[0] + ~~guiding_box_width;
  let param_y = clicked_released_ypos[0] + ~~guiding_box_height;

  //Draws the guiding box
  if ( (param_x < canvas.width && param_x > 0) && (param_y < canvas.height && param_y > 0 )){

    clicked_released_xpos[1] = param_x;
    clicked_released_ypos[1] = param_y;

    ctx.drawImage(resizing_img, 0, 0, 600, 600);
    ctx.beginPath();
    ctx.rect(clicked_released_xpos[0], clicked_released_ypos[0], guiding_box_width, guiding_box_height);
    ctx.stroke();
  }
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
//* HUGE create own functions and such instead of using fulabl libraries. Functions to be made self include : drawFyltRektangel, drawfirkant, drawBrukXY, drawBrukBakgrunn, drawBrukSynsfelt, drawBrukCanvas
//* size_lower_changed and size_upper_changed turned into one function