//Returns angle between two vectors, unit can be "deg" or radians
function v2a(vector1, vector2, unit) {
  const vector1_length = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
  const vector2_length = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);

  if (vector1_length == 0 || vector2_length == 0) {
    return NaN;
  }
  const vector_product = vector1[0] * vector2[0] + vector1[1] * vector2[1];
  //angle as degrees
  if (unit == "deg") {
    const angle = (Math.acos(vector_product / (vector1_length * vector2_length)) * 180) / Math.PI;
    return angle;
  }

  //angle as radians
  else {
    const angle = Math.acos(vector_product / (vector1_length * vector2_length));
    return angle;
  }
}

function largest_drawable_square(cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y) {
  let height = 0; //Positive values down, negative values up.
  let width = 0; //positive values to the right, negative to the left.

  //checks which quadrant mouse is in relation to the initially clicked point (think unit circle quadrants or whatever)
  let quadrant = "top_right";

  if (cursor_end_y - cursor_start_y > 0) {
    quadrant = "bottom_right";
  }

  if (cursor_end_x - cursor_start_x < 0) {
    quadrant = "bottom_left";
    if (cursor_end_y - cursor_start_y < 0) {
      quadrant = "top_left";
    }
  }

  const square_width = cursor_end_x - cursor_start_x;
  const square_height = cursor_end_y - cursor_start_y;
  //finds the cursor x or y position which would give the greatest width or height (both?)
  //current mouse position is in top right or bottom left quadrant (quadrant top_right or bottom_left)
  if (quadrant == "top_right" || quadrant == "bottom_left") {
    if (Math.abs(square_width) > Math.abs(square_height)) {
      width = square_width;
      height = -width;
    } 
    else {
      height = square_height;
      width = -height;
    }
  }
  //quadrant top_left or bottom_right
  else if (quadrant == "top_left" || quadrant == "bottom_right") {
    if (Math.abs(square_width) > Math.abs(square_height)) {
      width = square_width;
      height = width;
    } 
    else {
      width = square_height;
      height = width;
    }
  }
  return { cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y, width, height, };
}

function draw_square(canvas_info, background_img, cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y) {
  const canvas = canvas_info;
  const ctx = canvas.getContext("2d", { alpha: false });
  const current_square = largest_drawable_square(cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y);

  const parameter_x = cursor_start_x + ~~current_square.width;
  const parameter_y = cursor_start_y + ~~current_square.height;
  
  //Draws the guiding box if it fits the canvas
  if ( (0 < parameter_x && parameter_x < canvas.width) && (0 < parameter_y && parameter_y < canvas.height ) ) {
    ctx.drawImage(background_img, 0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.rect( cursor_start_x, cursor_start_y, current_square.width, current_square.height );
    ctx.stroke();
  }
}

function get_cursor_position(canvas, event) {
  //finds the absolute coordinates clicked, given as distence from top left.
  return [event.offsetX, event.offsetY];
}

function update_image(canvas, img){
  dataURL = canvas.toDataURL();
  img.src = dataURL;
}