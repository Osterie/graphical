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
  
    constructor(hue, saturation, lightness){
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.imageSmoothingEnabled = false;
    //   ctx.imageSmoothingQuality = "high"

      this.square_matrix = []
      this.hue_expression = hue
      this.saturation_expression = saturation
      this.lightness_expression = lightness
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
  }