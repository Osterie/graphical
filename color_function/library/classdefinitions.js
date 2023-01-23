class Square {
  constructor(ctx, xpos, ypos, hue, saturation, lightness, square_size) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.hue = hue;
    this.saturation = saturation;
    this.lightness = lightness;
    this.square_size = square_size;
    this.ctx = ctx;
    // this.draw();
  }

  draw() {
    switch (true) {
      case isFinite(this.hue):
        this.color = `hsl( ${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.xpos, this.ypos, this.square_size, this.square_size);
        break;

      default:
        this.color = `hsl(0, 0%, 0%)`;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.xpos, this.ypos, this.square_size, this.square_size);
        break;
    }
  }

  hue_changed(expression, x, y) {

    this.hue = math.evaluate(`${expression}`.replace(/X/g, x).replace(/Y/g, y));
    this.draw();
  }
  saturation_changed(expression, x, y) {
    this.saturation = Math.abs( ((100 +  math.evaluate(`${expression}`.replace(/X/g, x).replace(/Y/g, y))) % 200) - 100 );

    this.draw();
  }
  lightness_changed(expression, x, y) {
    this.lightness = Math.abs( ((100 + math.evaluate(`${expression}`.replace(/X/g, x).replace(/Y/g, y))) % 200) - 100 );
    this.draw();
  }
}

class Square_matrix {
  constructor(canvas, hue, saturation, lightness) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    //this.ctx.imageSmoothingQuality = "high"

    this.square_matrix = [];
    this.hue_expression = hue;
    this.saturation_expression = saturation;
    this.lightness_expression = lightness;

    this.pixel_ratio;
    this.size_lower;
    this.distance_left_x;
    this.distance_top_y;
    this.absolute_width;
  
    this.index_zero = 1
  }

  create_squares( start_x, start_y, width, length, pixel_ratio) {
    this.pixel_ratio = pixel_ratio;
    this.size_lower = start_x;
    this.size_upper = length;
    this.absolute_width = this.canvas.width / (this.size_upper - this.size_lower + this.index_zero);
    this.distance_left_x = this.size_lower;
    this.distance_top_y = this.size_lower;

    //column
    //width is locally declared as width for improved performance by reducing amount of property lookups
    for (let x = start_x, runs = width; x <= runs; x++) {
      if (this.square_matrix[x] == undefined) {
        this.square_matrix[x] = new Array();
      }

      for (let y = start_y, runs = length; y <= runs; y++) {
        let color_x = x * this.pixel_ratio;
        let color_y = y * this.pixel_ratio;

        const hue = math.evaluate(`${this.hue_expression}`.replace(/X/g, color_x).replace(/Y/g, color_y));
        const saturation = Math.abs( ((100 +  math.evaluate(`${this.saturation_expression}`.replace(/X/g, color_x).replace(/Y/g, color_y))) % 200) - 100 );
        const lightness = Math.abs( ((100 + math.evaluate(`${this.lightness_expression}`.replace(/X/g, color_x).replace(/Y/g, color_y))) % 200) - 100 );

        this.square_matrix[x][y] = new Square(
          this.ctx,
          (x - start_x) * this.absolute_width,
          (y - start_x) * this.absolute_width,
          hue,
          saturation,
          lightness,
          this.absolute_width
        );
        this.square_matrix[x][y].draw()
      }
    }

    if (start_x == start_y && width == length) {
      return;
    }

    // row
    for (let x = start_y, runs = length; x <= runs; x++) {
      for (let y = start_x, runs = width; y <= runs; y++) {
        let color_x = x * this.pixel_ratio;
        let color_y = y * this.pixel_ratio;

        const hue = math.evaluate(`${this.hue_expression}`.replace(/X/g, color_x).replace(/Y/g, color_y));
        const saturation = Math.abs( ((100 +  math.evaluate(`${this.saturation_expression}`.replace(/X/g, color_x).replace(/Y/g, color_y))) % 200) - 100 );
        const lightness = Math.abs( ((100 + math.evaluate(`${this.lightness_expression}`.replace(/X/g, color_x).replace(/Y/g, color_y))) % 200) - 100 );

        this.square_matrix[x][y] = new Square(
          this.ctx,
          (x - start_x) * this.absolute_width,
          (y - start_x) * this.absolute_width,
          hue,
          saturation,
          lightness,
          this.absolute_width
        );
        this.square_matrix[x][y].draw()
      }
    }
  }
  //TODO arguments should be same for new/draw_pixels
  draw_squares(start_x, end_x, start_y, end_y) {
    this.absolute_width = this.canvas.width / (end_x - start_x + this.index_zero);
    for (let x = start_x, runs = end_x; x <= runs; x++) {
      for (let y = start_y, runs = end_y; y <= runs; y++) {
        this.square_matrix[x][y].xpos = (x - start_x) * this.absolute_width;
        this.square_matrix[x][y].ypos = (y - start_y) * this.absolute_width;
        this.square_matrix[x][y].square_size = this.absolute_width;
        this.square_matrix[x][y].draw();
      }
    }
  }

  class_method_loop(method, component) {
    if (method === "hue") {
      this.hue_expression = component;
      var class_method = Square.prototype.hue_changed;
    } 

    else if (method === "saturation") {
      this.saturation_expression = component;
      var class_method = Square.prototype.saturation_changed;
    }

    else if (method === "lightness") {
      this.lightness = component;
      var class_method = Square.prototype.lightness_changed;
    }

    for (let x = this.size_lower; x <= this.size_upper; x++) {
      for (let y = this.size_lower; y <= this.size_upper; y++) {
        this.square_matrix[x][y].square_size = this.absolute_width;
        this.square_matrix[x][y].xpos = (x - this.size_lower) * this.absolute_width;
        this.square_matrix[x][y].ypos = (y - this.size_lower) * this.absolute_width;
        class_method.call( this.square_matrix[x][y], component, x * this.pixel_ratio, y * this.pixel_ratio );
      }
    }
  }

  change_size(size_lower, size_upper, old_size_bipartite, change) {
    this.absolute_width = this.canvas.width / (size_upper - size_lower + this.index_zero);
    this.size_lower = size_lower;
    this.size_upper = size_upper;

    //old_size_bipartite means its either the old size_lower or old size_upper
    switch (true) {

      //size_upper changed
      case change === "higher" && this.size_upper >= old_size_bipartite:
        this.create_squares( this.size_lower, old_size_bipartite + 1, this.size_upper, this.size_upper, this.pixel_ratio );
        break;

      //size_lower changed
      case change === "lower" && this.size_lower <= old_size_bipartite:
        this.create_squares( this.size_lower, this.size_lower, old_size_bipartite - this.index_zero, this.size_upper, this.pixel_ratio );
        break;

      //this.size_upper has decreased or this.size_lower has increased
      default:
        this.absolute_width = this.canvas.width / (this.size_upper - this.size_lower + this.index_zero);
        this.draw_squares( this.size_lower, this.size_upper, this.size_lower, this.size_upper);
        break;
    }
  }

  zoom(cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y) {
    const zoom_area = largest_drawable_square( cursor_start_x, cursor_end_x, cursor_start_y, cursor_end_y );

    const canvas_current_x = cursor_start_x + zoom_area.width;
    const canvas_current_y = cursor_start_y + zoom_area.height;

    const canvas_start_x = 0;
    const canvas_start_y = 0;

    //zooms if a perfect square is makeable, guiding box fits the canvas
    if ( canvas_start_x < canvas_current_x && canvas_current_x < this.canvas.width && canvas_start_y < canvas_current_y && canvas_current_y < this.canvas.height ) {
     
      //start is the smallest value, while end is the largest, opposite for y value because it is distance from top of canvas
      const start_x = Math.min( ~~(cursor_start_x / this.absolute_width) + this.distance_left_x, ~~((cursor_start_x + zoom_area.width) / this.absolute_width) + this.distance_left_x );
      const end_x = Math.max( ~~(cursor_start_x / this.absolute_width) + this.distance_left_x, ~~((cursor_start_x + zoom_area.width) / this.absolute_width) + this.distance_left_x );

      const start_y = Math.min( ~~(cursor_start_y / this.absolute_width) + this.distance_top_y, ~~((cursor_start_y + zoom_area.height) / this.absolute_width) + this.distance_top_y );
      let end_y = Math.max( ~~(cursor_start_y / this.absolute_width) + this.distance_top_y, ~~((cursor_start_y + zoom_area.height) / this.absolute_width) + this.distance_top_y );

      //results in better zooming...
      if (end_y + 1 <= this.size_upper){
        end_y += 1
      }

      this.distance_left_x = start_x;
      this.distance_top_y = start_y;

      this.absolute_width = this.canvas.width / (end_x - start_x + this.index_zero);
      this.draw_squares(start_x, end_x, start_y, end_y);
    }
  }
}
