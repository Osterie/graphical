//-----------------------Canvas-----------------------------

let canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { alpha: false });

//---------------------Accessing DOM elements------------------------

const get_hue_expression = document.querySelector("#hue_expression");
const get_saturation_expression = document.querySelector("#saturation_expression");
const get_lightness_expression = document.querySelector("#lightness_expression");
const get_size_lower = document.querySelector("#size_lower");
const get_size_upper = document.querySelector("#size_upper");
const get_pixel_ratio = document.querySelector("#pixel_ratio");
const get_upscale_button = document.querySelector("#upscale");
const custom_variable_activate = document.getElementById('custom_variable_activate')
const custom_variable_stop = document.getElementById('custom_variable_stop')
const custom_variable_error_handler = document.getElementById('custom_variable_error_handler')

canvas.addEventListener("mousedown", handle_canvas_event_zoom);
canvas.addEventListener("mousemove", handle_canvas_event_zoom);
canvas.addEventListener("mouseup", handle_canvas_event_zoom);
canvas.addEventListener("mouseout", handle_canvas_event_zoom);

get_hue_expression.addEventListener("change", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  matrix_squares.class_method_loop("hue", get_hue_expression.value);
  matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

get_saturation_expression.addEventListener("change", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  matrix_squares.class_method_loop("saturation", get_saturation_expression.value);
  matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

get_lightness_expression.addEventListener("change", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  matrix_squares.class_method_loop("lightness", get_lightness_expression.value);
  matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

get_pixel_ratio.addEventListener("change", function () {
  pixel_ratio = +get_pixel_ratio.value;
  size_upper = Math.floor(+get_size_upper.value / pixel_ratio);
  size_lower = Math.floor(+get_size_lower.value / pixel_ratio);
  
  matrix_squares.create_squares(size_lower, size_lower, size_upper, size_upper, pixel_ratio)
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

get_size_lower.addEventListener("change", function () {
  const old_size = size_lower
  size_lower = Math.floor(+get_size_lower.value / pixel_ratio);
  const absolute_width = canvas.width / (size_upper - size_lower + index_zero);
  const distance_from_top_left = (absolute_width) * (old_size - size_lower)
  const image_size = ((absolute_width) * (size_upper - old_size + index_zero ))
  ctx.drawImage(resizing_img, distance_from_top_left, distance_from_top_left, image_size, image_size);
  
  matrix_squares.change_size(size_lower, size_upper, old_size, 'lower');
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

get_size_upper.addEventListener("change", function () {
  const old_size = size_upper
  size_upper = Math.floor(+get_size_upper.value / pixel_ratio);

  const absolute_width = canvas.width / (size_upper - size_lower + index_zero);
  const image_size = ((absolute_width) * (old_size - size_lower + index_zero))
  ctx.drawImage(resizing_img, 0, 0, image_size, image_size);
  
  matrix_squares.change_size(size_lower, size_upper, old_size, 'higher');
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

get_upscale_button.addEventListener("click", function () {
  matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
});

custom_variable_activate.addEventListener('click', function() {
  custom_variable_handler(); 
  document.getElementById('custom_variable_name').innerHTML = 'Variable name: N';
})

custom_variable_stop.addEventListener('click', function () {clearInterval(custom_variable_interval_id)})


//----------------General----------------------------------

const index_zero = 1
let custom_variable_interval_id

//----------------Creation of pixels------------------------

let size_lower = +get_size_lower.value;
let size_upper = +get_size_upper.value;
let pixel_ratio= +(get_pixel_ratio.value);

//-------------------------------ZOOMING--------------------

let initial_cursor_position = []
let current_cursor_position = []
let mouse_is_down = false

let original_img = new Image(); //how the image looks when all pixels are drawn at once at their "intended" size
let resizing_img = new Image(); //image used for resizing

//------------------------INITIALIZATION------------------------

window.onload = winInit;
function winInit() {
  // ctx.filter = "hue-rotate(200deg)" //INTERESTING!
  matrix_squares = new Square_matrix(canvas, get_hue_expression.value, get_saturation_expression.value, get_lightness_expression.value)
  matrix_squares.create_squares(size_lower, size_lower, size_upper, size_upper, pixel_ratio)
  update_image(canvas, original_img)
  update_image(canvas, resizing_img)
}

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
        
        const absolute_width = canvas.width / (size_upper - size_lower + index_zero)
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







function custom_variable_handler(){

  const custom_variable_start = parseFloat(document.getElementById('custom_variable_from').value)
  const custom_variable_end = parseFloat(document.getElementById('custom_variable_to').value)
  const custom_variable_step = parseFloat(document.getElementById('custom_variable_step').value)
  const custom_variable_frequency = parseFloat(document.getElementById('custom_variable_frequency').value)
  clearInterval(custom_variable_interval_id)

  //1 means positive direction, -1 negative
  let direction = 1
  const custom_variable_value = custom_variable_start

  custom_variable_interval_id = window.setInterval(function(){

    custom_variable_value += custom_variable_step * direction

    if (custom_variable_value > custom_variable_end || custom_variable_value <= custom_variable_start){
      direction *= -1
    }

    matrix_squares.custom_variable = custom_variable_value 

    if (get_hue_expression.value.includes('N')){
      matrix_squares.class_method_loop("hue", get_hue_expression.value);
    }
    if (get_saturation_expression.value.includes('N')){
      matrix_squares.class_method_loop("saturation", get_saturation_expression.value);
    }
    if (get_lightness_expression.value.includes('N')){
      matrix_squares.class_method_loop("lightness", get_lightness_expression.value);
    }
    matrix_squares.draw_squares(size_lower, size_upper, size_lower, size_upper)
    update_image(canvas, original_img)
    update_image(canvas, resizing_img)
  }, 1000/custom_variable_frequency);
}

//!HUGE? TODO: use webworkers, not viable? passing information between webworker and main script removes class
//TODO: !check out complex plotting or whatever, make an option to change to using complex numbers?

//TODO: create a settings button where settings can be changed/toggled?
//TODO:! add a button for the option to redraw the black background, creates very interesting patterns when the size of the pixels are < 1
//TODO: make an option to turn on the sawtooth pattern for hue too? and create lower and upper limit, this.hue =  Math.abs(( (100 + Function("return " + hue_expression)()) % 200) - 100)
//!TODO: Create a option to toggle between clicking a button to run script and running script when a variable is changed.
//!TODO: quality mode and fast mode, ise ctx.drawimage method for fast and redraw every pixel every time for fast mode.
//TODO: save settings in localstorage


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
//* created option to make a variable that changes every second f.eks. goes from 1 to 10 then 10 to 1, call it n and then n can be used in the color chooser