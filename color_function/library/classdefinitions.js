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
  
    constructor(hue, saturation, lightness, absolute_width){
      let canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.imageSmoothingEnabled = false;
    //   ctx.imageSmoothingQuality = "high"

      this.square_matrix = []
      this.hue_expression = hue
      this.saturation_expression = saturation
      this.lightness_expression = lightness

      this.size_lower = 0
      this.size_upper = 0
      this.distance_left_x = this.size_lower
      this.distance_top_y = this.size_lower
      this.absolute_width = absolute_width
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
          
          this.hue = Function( `return ${this.hue_expression.replace(/X/g, color_x).replace(/Y/g, color_y)}` )()
          this.saturation = Math.abs( ((100 + Function( `return + ${this.saturation_expression.replace(/X/g, color_x).replace(/Y/g, color_y)}` )()) % 200) - 100 )
          this.lightness = Math.abs( ((100 + Function( `return + ${this.lightness_expression.replace(/X/g, color_x).replace(/Y/g, color_y)}` )()) % 200) - 100)

          this.square_matrix[x][y] = new Square(
            ~~((x - start_x) * square_dimensions),
            ~~((y - start_x) * square_dimensions),
            this.hue,
            this.saturation,
            this.lightness,
            ~~square_dimensions
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
          
          this.hue = Function( `return ${this.hue_expression.replace(/X/g, color_x).replace(/Y/g, color_y)}` )()
          this.saturation = Math.abs( ((100 + Function( `return + ${this.saturation_expression.replace(/X/g, color_x).replace(/Y/g, color_y)}` )()) % 200) - 100 )
          this.lightness = Math.abs( ((100 + Function( `return + ${this.lightness_expression.replace(/X/g, color_x).replace(/Y/g, color_y)}` )()) % 200) - 100)
          
          this.square_matrix[x][y] = new Square(
            ~~((x - start_x) * square_dimensions),
            ~~((y - start_x) * square_dimensions),
            this.hue,
            this.saturation,
            this.lightness,
            ~~square_dimensions
          );
        }
      }
    }
  //TODO arguments should be same for new/draw_pixels
    draw_squares(start_x, end_x, start_y, end_y, absolute_width){
      this.size_lower = start_x
      this.size_upper = end_x
      this.distance_left_x = this.size_lower
      this.distance_top_y = this.size_lower
      this.absolute_width = absolute_width

      for (let x = start_x, runs = end_x; x <= runs; x++) {
        for (let y = start_y, runs = end_y; y <= runs; y++) {
          this.square_matrix[x][y].xpos = (x  - start_x) * this.absolute_width;
          this.square_matrix[x][y].ypos = (y - start_y) * this.absolute_width;
          this.square_matrix[x][y].square_size = this.absolute_width;
          this.square_matrix[x][y].draw();
        }
      }
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
        //   this.square_matrix[x][y].draw()
        }
      }
    }

    zoom_guide(cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y){

      let current_x = cursor_end_x;
      let current_y = cursor_end_y;

      //TODO: USE QUADRANT TERMINOLOGY
      let guiding_box_height; //Positive values down, negative values up.
      let guiding_box_width; //positive values to the right, negative to the left.
    
      //checks where current x and y pos are in relation to down_x and down_y
      let right = false;
      let above = false;
    
      let distance_from_down_x = Math.abs(current_x - cursor_start_x)
      let distance_from_down_y = Math.abs(current_y - cursor_start_y)
    
    
      //TODO use first, second, third, fourth quardant... in if statements soon to come
      if (current_x - cursor_start_x > 0) {
        right = true;
      }
    
      if (current_y - cursor_start_y < 0) {
        above = true;
      }
    
      //current mouse position is in top right or bottom left quadrant
      if ((right && above) || (!right && !above)) {
        if (distance_from_down_x > distance_from_down_y) {
          guiding_box_width  = current_x - cursor_start_x;
          guiding_box_height = cursor_start_x - current_x;
        }
    
        else {
          guiding_box_width = cursor_start_y - current_y;
          guiding_box_height = current_y - cursor_start_y;
        }
      }
    
      else if ((right && !above) || (!right && above)) {
    
        if (distance_from_down_x > distance_from_down_y) {
          guiding_box_width  = current_x - cursor_start_x;
          guiding_box_height = current_x - cursor_start_x;
        }
        else {
          guiding_box_width  = current_y - cursor_start_y;
          guiding_box_height = current_y - cursor_start_y;
        }
      }
    
    
      //Parameters, must be between 0 and canvas.width/heigth
      let param_x = cursor_start_x + ~~guiding_box_width;
      let param_y = cursor_start_y + ~~guiding_box_height;
    
      //Draws the guiding box
      if ( (param_x < canvas.width && param_x > 0) && (param_y < canvas.height && param_y > 0 )){
    
        clicked_released_xpos[1] = param_x;
        clicked_released_ypos[1] = param_y;
    
        ctx.drawImage(resizing_img, 0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.rect(cursor_start_x, cursor_start_y, guiding_box_width, guiding_box_height);
        ctx.stroke();
      }
  }

  zoom(event, cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y){

    if (event.ctrlKey) {
      // this.absolute_width = canvas.width / (size_upper - size_lower + 1);
      this.distance_left_x = this.size_lower
      this.distance_top_y = this.size_lower
      ctx.drawImage(original_img, 0, 0, 600, 600);
      resizing_img.src = canvas.toDataURL();
      original_img.src = canvas.toDataURL();
      return;
    }

    //zooms
    //FIXME when mouseuot it runs this shit
    else{

      //sorts array from lowest to highest
      let clicked_released_xpos = [cursor_start_x, cursor_end_x]
      let clicked_released_ypos = [cursor_start_y, cursor_end_y]

      clicked_released_xpos.sort(function (a, b) {return a - b;});
      clicked_released_ypos.sort(function (a, b) {return a - b;});

      console.log(this.distance_left_x)

      //drawn from start_x to end_x
      let start_x = ~~(clicked_released_xpos[0] / this.absolute_width) + this.distance_left_x;
      let end_x = ~~(clicked_released_xpos[1] / this.absolute_width) + this.distance_left_x;

      //drawn from start_y to end_y
      let start_y = (~~(clicked_released_ypos[0] / this.absolute_width) + this.distance_top_y);
      let end_y = (~~(clicked_released_ypos[1] / this.absolute_width) + this.distance_top_y);


      //These if else statements ensure better zooming
      if (end_x - start_x > end_y - start_y) {
        if (start_y-1 >= size_lower && start_y-1 <= size_upper){
          start_y -= 1;
        }
        else{
          end_y += 1
        }
      }
      else if (end_x - start_x < end_y - start_y) {
        if (start_x-1 >= size_lower && start_x-1 <= size_upper){
          start_x -= 1;
        }
        else{
          end_x += 1;
        }
      }

      //used for zooming multiple times, tells the distance from left wall and top wall on second, third... nth zoom
      //might be able to find solution not using these values? not worth it?
      this.distance_left_x = start_x
      this.distance_top_y = start_y

      //new size when zoomed.
      let size = end_x - start_x + 1;
      this.absolute_width = canvas.width / size ;

      console.log({start_x, end_x, start_y, end_y})
      
      matrix_squares.draw_squares(start_x, end_x, start_y, end_y, this.absolute_width)
      resizing_img.src = canvas.toDataURL();;
  }
  }
}