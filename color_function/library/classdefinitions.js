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

      this.size_lower = -10
      this.size_upper = -10
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
      // this.distance_left_x = this.size_lower
      // this.distance_top_y = this.size_lower
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


  zoom(ctx, event, cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y){
    c(this.distance_left_x, 'what')
    let zoom_area = largest_drawable_square(cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y)


    let parameter_x = cursor_start_x + ~~zoom_area.width;
    let parameter_y = cursor_start_y + ~~zoom_area.height;
    //Draws the guiding box if it fits the canvas
    if ( (parameter_x < canvas.width && parameter_x > 0) && (parameter_y < canvas.height && parameter_y > 0 )){
  
    //TODO FIXME! use width and height in conjunction with cursor_start to find end_x/y
  
    let start_x = Math.min(~~(cursor_start_x / this.absolute_width) + this.distance_left_x, ~~( (cursor_start_x + zoom_area.width) / this.absolute_width ) + this.distance_left_x )
    let end_x = Math.max(~~(cursor_start_x / this.absolute_width) + this.distance_left_x, ~~( (cursor_start_x + zoom_area.width) / this.absolute_width ) + this.distance_left_x )

    let start_y = Math.min(~~(cursor_start_y / this.absolute_width) + this.distance_top_y,  ~~( (cursor_start_y + zoom_area.height) / this.absolute_width ) + this.distance_top_y)
    let end_y = Math.max(~~(cursor_start_y / this.absolute_width) + this.distance_top_y,  ~~( (cursor_start_y + zoom_area.height) / this.absolute_width ) + this.distance_top_y)

      end_y += 1
    c(this.distance_top_y)
    
    this.distance_left_x = start_x
    this.distance_top_y = start_y

    c(this.distance_top_y)

    
    //new size when zoomed.
    let size = end_x - start_x + 1;
    this.absolute_width = canvas.width / size ;
    

    
    matrix_squares.draw_squares(start_x, end_x, start_y, end_y, this.absolute_width)


    //FIXME REMOVE ME
    resizing_img.src = canvas.toDataURL();
    }
  }
}