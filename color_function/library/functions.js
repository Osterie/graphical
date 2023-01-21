
//Returns angle between two vectors, unit can be "deg" or radians
function v2a(vector1, vector2, unit) {
    vector1_length = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
    vector2_length = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);
    vector_product = vector1[0] * vector2[0] + vector1[1] * vector2[1];
    
    //angle as degrees
    if (unit == "deg") {
      var angle =
      (Math.acos(vector_product / (vector1_length * vector2_length)) * 180) /
      Math.PI;
      return angle;
    }
    
    //angle as radians
    else {
      var angle = Math.acos(vector_product / (vector1_length * vector2_length));
      return angle;
    }
}



function largest_drawable_square(cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y){
  let height = 0; //Positive values down, negative values up.
  let width = 0; //positive values to the right, negative to the left.

  //checks which quadrant mouse is in relation to the initially clicked point (think unit circle quadrants or whatever)
  let quadrant = 'top_right'

  if (cursor_end_y - cursor_start_y > 0) {
    quadrant = "bottom_right"
  }

  if (cursor_end_x - cursor_start_x < 0) {
    quadrant = "bottom_left"
    if (cursor_end_y - cursor_start_y < 0){
      quadrant = "top_left"
    }
  }


  //finds the cursor x or y position which would give the greatest width or height (both?)
  //current mouse position is in top right or bottom left quadrant (quadrant 'top_right' and "bottom_left")
  if (quadrant == 'top_right' || quadrant == "bottom_left") {
    if (Math.abs(cursor_end_x - cursor_start_x) > Math.abs(cursor_end_y - cursor_start_y)) {
        width = cursor_end_x - cursor_start_x;
        height = -width
    } 
    
    else {
      height = (cursor_end_y - cursor_start_y)
      width = -height
    }
  }
  //quadrant "top_left" and bottom_right
  else if (quadrant == "top_left" || quadrant == "bottom_right") {

    if (Math.abs(cursor_end_x - cursor_start_x) > Math.abs(cursor_end_y - cursor_start_y)) {
      width  = cursor_end_x - cursor_start_x;
      height = width
    }
    else {
      width  = cursor_end_y - cursor_start_y;
      height = width
    }
  }
  return {cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y, width, height}
}
