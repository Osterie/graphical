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
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  matrix_squares.class_method_loop("hue", hue_expression);
  update_images(canvas)
});

get_saturation_expression.addEventListener("change", function () {
  saturation_expression = get_saturation_expression.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  matrix_squares.class_method_loop("saturation", saturation_expression);
  update_images(canvas)
});

get_lightness_expression.addEventListener("change", function () {
  lightness_expression = get_lightness_expression.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  matrix_squares.class_method_loop("lightness", lightness_expression);
  update_images(canvas)
});

get_pixel_ratio.addEventListener("change", function () {
  pixel_ratio = +get_pixel_ratio.value;
  size_upper = ~~(+get_size_upper.value / pixel_ratio);
  size_lower = ~~(+get_size_lower.value / pixel_ratio);
  size = size_upper - size_lower + index_zero;
  absolute_width = canvas.width / size;
  distance_left_x_zooming = size_lower
  distance_top_y_zooming = size_lower
  matrix_squares.create_squares(size_lower, size_lower, size_upper, size_upper, absolute_width, pixel_ratio)
  update_images(canvas)
});

get_size_lower.addEventListener("change", function () {
  let old_size = size_lower
  size_lower = ~~(+get_size_lower.value / pixel_ratio);
  
  //TODO FIXME: give size lower and absolute_width as an argument?
  

  absolute_width = canvas.width / (size_upper - size_lower + index_zero);

  var distance_from_top_left = ~~(absolute_width) * (old_size- size_lower)
  var image_size = ~~((absolute_width) * (size_upper - old_size + index_zero ))
  ctx.drawImage(resizing_img, distance_from_top_left, distance_from_top_left, image_size, image_size);



  matrix_squares.change_size(size_lower, size_upper, old_size, 'lower');
  update_images(canvas)
});

get_size_upper.addEventListener("change", function () {
  let old_size = size_upper
  size_upper = ~~(+get_size_upper.value / pixel_ratio);

  absolute_width = canvas.width / (size_upper - size_lower + index_zero);

  var image_size = ~~((absolute_width) * (old_size+1 - size_lower))
  ctx.drawImage(resizing_img, 0, 0, image_size, image_size);
  
  
  
  matrix_squares.change_size(size_lower, size_upper, old_size, 'higher');
  update_images(canvas)
});

get_upscale_button.addEventListener("click", function () {
  matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper, absolute_width)
  update_images(canvas)
});

//-----------------------Canvas-----------------------------

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

//Check class for these settings!
// ctx.imageSmoothingEnabled = false;
// ctx.imageSmoothingQuality = "high"

//----------------Creation of pixels--------------------------------

const index_zero = 1
let matrix_pixels = [];
let size_lower = +get_size_lower.value;
let size_upper = +get_size_upper.value;
let size = size_upper - size_lower + index_zero;
let absolute_width;
var pixel_ratio = parseFloat(get_pixel_ratio.value);

let hue_expression = get_hue_expression.value;
let saturation_expression = get_saturation_expression.value;
let lightness_expression = get_lightness_expression.value;

//-------------------------------ZOOMING--------------------

let initial_cursor_position = []
let current_cursor_position = []
let mouse_is_down = false


// Event listener for all cursor on canvas events
function handle_canvas_event_zoom(event) {
  switch (event.type) {

    case 'mousedown':
        initial_cursor_position = get_cursor_position(canvas, event)
        mouse_is_down = true
        break;

    case 'mousemove':
      if (mouse_is_down) {
        current_cursor_position = get_cursor_position(canvas, event);
        draw_square(canvas, resizing_img, initial_cursor_position[0], current_cursor_position[0], initial_cursor_position[1], current_cursor_position[1])
      }
      break;

    case 'mouseup':
    case 'mouseout':
      mouse_is_down = false;
      if (event.ctrlKey){
        matrix_squares.absolute_width = absolute_width
        matrix_squares.distance_left_x = size_lower
        matrix_squares.distance_top_y = size_lower
        ctx.drawImage(original_img, 0, 0, canvas.width, canvas.height);
        resizing_img.src = canvas.toDataURL();
        return
      }
      else if (initial_cursor_position.length && current_cursor_position.length){
        matrix_squares.zoom(initial_cursor_position[0], current_cursor_position[0], initial_cursor_position[1], current_cursor_position[1])
        resizing_img.src = canvas.toDataURL();
    
      }
      initial_cursor_position = [];
      current_cursor_position = [];
      break;
      
    default:
      break;
  }
}

canvas.addEventListener("mousedown", handle_canvas_event_zoom);
canvas.addEventListener("mousemove", handle_canvas_event_zoom);
canvas.addEventListener("mouseup", handle_canvas_event_zoom);
canvas.addEventListener("mouseout", handle_canvas_event_zoom);

let dataURL;
let original_img = new Image(); //how the image looks when all pixels are drawn at once at their "intended" size
let resizing_img = new Image(); //image used for resizing

let clicked_released_xpos = [];
let clicked_released_ypos = [];

//when zooming, is used to tell how far from top left the squares that are going to be drawn are
var distance_left_x_zooming = size_lower
var distance_top_y_zooming = size_lower

//------------------------INITIALIZATION------------------------

window.onload = winInit;
function winInit() {

  // ctx.filter = "hue-rotate(200deg)" //INTERESTING!
  size = size_upper - size_lower + index_zero;
  absolute_width = (canvas.width / size ); //width in px of every "pixel" drawn on canvas
  matrix_squares = new Square_matrix(canvas, hue_expression, saturation_expression, lightness_expression)
  matrix_squares.create_squares(size_lower, size_lower, size_upper, size_upper, absolute_width, pixel_ratio)
  update_images(canvas)
}

//\\\\\\\\\\\\\\\\\\\\FUNCTIONS\\\\\\\\\\\\\\\\\\\\\\\

function update_images(canvas){
  dataURL = canvas.toDataURL();
  original_img.src = dataURL;
  resizing_img.src = dataURL;
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

//!HUGE? TODO: use webworkers, ask chat gpt-3 for help, not viable? passing information between webworker and main script removes class

//TODO: Research complex plotting or whatever, make an option to change to using complex numbers?

//TODO: Create a settings button where settings can be changed/toggled?
//TODO:! Add a button for the option to redraw the black background, creates very interesting patterns when the size of the pixels are < 1
//TODO: Make an option to turn on the sawtooth pattern for hue too? and create lower and upper limit, this.hue =  Math.abs(( (100 + Function("return " + hue_expression)()) % 200) - 100)
//!TODO: Create a option to toggle between clicking a button to run script and running script when a variable is changed.
//!TODO: Performance mode and fast mode, ise ctx.drawimage method for fast and redraw every pixel every time for fast mode.
//TODO: save settings in localstorage

//TODO: Create option to make a variable that changes every second f.eks. goes from 1 to 10 then 10 to 1, call it n and then n can be used in the color chooser

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
//* WONTFIX Minor fix in the new_pixels function, it creates the corner piece twice
//* make it possible to zoom in on inzoomed image.
//* made zooming more general
//* made functions into methods
