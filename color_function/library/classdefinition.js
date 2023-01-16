class Pixel {
    constructor(xpos, ypos, hue, saturation, lightness, pixel_size) {
      this.xpos = xpos;
      this.ypos = ypos;
      this.hue = hue;
      this.saturation = saturation;
      this.lightness = lightness;
      this.absolute_width = pixel_size
      //FIXME: can probably get away with not changing this.absolute_width everytime
      // this.tegn();
    }
  
    tegn(){
      console.log('drawing')
      switch (true) {
        case isFinite(this.hue):
          this.color = `hsl( ${this.hue} , ${this.saturation}% , ${this.lightness}%)`;
          ctx.fillStyle = this.color;
          ctx.fillRect(this.xpos, this.ypos, this.absolute_width, this.absolute_width) ;
          break;
  
        default:
          this.color = `hsl(0, 0%, 0%)`;
          ctx.fillStyle = this.color;
          ctx.fillRect(this.xpos, this.ypos, this.absolute_width, this.absolute_width) ;
          break;
      }
    }
  
    hue_changed(expression, x, y) {
      this.hue = Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )();
      this.tegn();
    }
  
    saturation_changed(expression, x, y) {
      this.saturation = Math.abs( ((100 + Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
      this.tegn();
    }
    lightness_changed(expression, x, y) {
      this.lightness = Math.abs( ((100 + Function( `return ${expression.replace(/X/g, x).replace(/Y/g, y)}` )()) % 200) - 100 );
      this.tegn();
    }
  
  }