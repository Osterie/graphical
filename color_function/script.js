//math.js library is recommended
//npm install mathjs

//Lemniscate
// ((X)**2 + (Y)**2)**2 - ((X)**2 - (Y)**2)
var ctx;
var canvas = elGetId("canvas");
var runspeed = 1;
var animId;
var old_size_upper = 0;
var old_size_lower = 0;
var size_lower = -10;
var size_upper = 10;
var size = (Math.abs(size_lower) + size_upper)/pixel_size;

var matrix_squares = [];

var redraw_background = true;

const get_color_expression = document.getElementById("color_expression");
const get_saturation_expression = document.getElementById("saturation_expression");
const get_hue_expression = document.getElementById("hue_expression");

const get_size_lower = document.getElementById("size_lower");
const get_size_upper = document.getElementById("size_upper");
const get_pixel_size = document.getElementById("pixel_size");

canvas.addEventListener("mousemove", zoom_guider);

canvas.addEventListener("mousedown", function (e) {
  get_cursor_position(canvas, e);
});

canvas.addEventListener("mouseup", function (e) {
  get_cursor_position(canvas, e);
});

class Square {
  constructor(xpos, ypos, color, saturation, hue, pixel_size) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.color = color;
    this.saturation = saturation;
    this.hue = hue;
    this.pixel_size = pixel_size;
  }

  tegn() {
    tegnFyltRektangel(
      this.xpos,
      this.ypos,
      pixel_size,
      pixel_size,
      "hsl(" + this.color + ", " + this.saturation + "%," + this.hue + "%)"
    );
  }
}

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


// Fn =
  // (((1 + Math.sqrt(5)) / 2) ** (X+Y) - ((1 - Math.sqrt(5)) / 2) ** (X+Y)) /
  // Math.sqrt(5);

// console.log(math.i.re, 'real')
// console.log(math.i.im, 'imaginary')
// console.log(math.multiply(math.i, 10).im, 'imaginary')

//TODO: Create option to make a variable that changes every second f.eks. goes from 1 to 10 then 10 to 1, call it n and then n can be
// used in the color chooser
//!TODO: create variable for width and height of squares(or just size of squares), must change array size to compensate

//TODO:! Add a button for the option to redraw the black background, creates very interesting patterns when the size of the pixels are < 1
//TODO: Is probably faster/more efficient to just change color of all squares when changing color, instead of creating new squares
//TODO: dont have functions in create new class objects, instead change colors with functions in the class
//TODO: Create vector to angle function and make it usable in hue, saturation and color variables.
//TODO: Add more color models, i.e rgb and such

//!TODO: Create a option to toggle between clicking a button to run script and running script when a variable is changed. 




function create_squares() {
  size = (Math.abs(size_lower) + size_upper)/pixel_size;
  
  tegnBrukBakgrunn("black");

  for (let x = 0; x < size; x++) {
    if (matrix_squares[x] == undefined) {
      matrix_squares[x] = [];
    }
  
    for (let y = 0; y < size; y++) {

      matrix_squares[x][y] = new Square(
        ((x*pixel_size) + size_lower),
        ((y*pixel_size) + size_lower),
        change_color((x*pixel_size) + size_lower, (y*pixel_size) + size_lower),
        change_saturation((x*pixel_size) + size_lower, (y*pixel_size) + size_lower),
        change_hue((x*pixel_size) + size_lower, (y*pixel_size) + size_lower),
        pixel_size
      );
    }
  }

  // for (let x = old_size_upper; x < size + old_size_lower; x++) {
  //   for (let y = 0; y < size; y++) {
  //     console.log('draw')

  //     matrix_squares[x][y] = new Square(
  //       ((x*pixel_size) + size_lower),
  //       ((y*pixel_size) + size_lower),
  //       change_color((x*pixel_size) + size_lower, (y*pixel_size) + size_lower),
  //       change_saturation((x*pixel_size) + size_lower, (y*pixel_size) + size_lower),
  //       change_hue((x*pixel_size) + size_lower, (y*pixel_size) + size_lower),
  //       pixel_size
  //     );
  //   }
  // }
}
var scalex1 = size_lower;
var scalex2 = size_upper;
var scaley1 = size_lower;
var scaley2 = size_upper;

var square_saturation = 100;
var square_hue = 50;

var scaled = false;
var max_size = 0;

function draw_squares() {
  if (redraw_background) {
    tegnBrukBakgrunn("black");
  }
  
  tegnBrukBakgrunn("black");
  size = (Math.abs(size_lower) + size_upper)/pixel_size; //TODO: Redundant?

  if (!scaled) {
    tegnBrukXY(size_lower, size_upper, size_lower, size_upper);
  }
  tegnBrukBakgrunn("black");

  for (let x = 0; x < matrix_squares.length; x++) {
    for (let y = 0; y < matrix_squares.length; y++) {
      matrix_squares[x][y].tegn();
    }
  }
}

function change_color(x, y) {
  
  if (get_color_expression.value) {
    //This is SUPER slow.
    //for now i recommend just changing the returned expression to whatever you want, or dont
    //ie. x*y*10 or something.
    let returnme = get_color_expression.value.replace(/X/g, x).replace(/Y/g, y);
    return Function("return " + returnme)();
  } 
  else {
    return 34;
  }
}

function change_saturation(x, y) {
  if (get_saturation_expression.value) {
    //This is SUPER slow.
    //for now i recommend just changing the returned expression to whatever you want
    //ie. x*y*10 or something.
    let returnme = (get_saturation_expression.value
      .replace(/X/g, x)
      .replace(/Y/g, y));

      return Math.abs(( (100 + Function("return " + returnme)()) % 200) - 100);
    } 
  
  else {
    return 54;
  }
}
function change_hue(x, y) {
  if (get_saturation_expression.value) {
    let returnme = (get_hue_expression.value
      .replace(/X/g, x)
      .replace(/Y/g, y));

    return Math.abs(( (100 + Function("return " + returnme)()) % 200) - 100);
  } 
  else {
    return 50;
  }
}


// const get_runspeed = document.getElementById("runspeed");


get_size_upper.addEventListener("change", change_size_upper);
get_size_lower.addEventListener("change", change_size_lower);


get_color_expression.addEventListener("change", color_changed);
get_saturation_expression.addEventListener("change", color_changed);
get_hue_expression.addEventListener("change", color_changed);
get_pixel_size.addEventListener("change", change_pixel_size);
// get_runspeed.addEventListener("change", change_runspeed);

var pixel_size = parseFloat(get_pixel_size.value);

function color_changed() {
  old_size_upper = 0;
  old_size_lower = 0;

  create_squares();
  draw_squares();
}

function change_size_upper() {
  new_size = parseInt(get_size_upper.value);

  if (new_size > size_upper) {
    old_size_upper = size_upper;
    size_upper = new_size;

    if (new_size > max_size) {
      max_size = new_size;
      create_squares();
    }
  }
  size_upper = new_size;

  draw_squares();
}

function change_size_lower() {
  new_size = parseInt(get_size_lower.value);
  

  if (new_size < size_lower) {
    old_size_lower = size_lower;
    size_lower = new_size;

    if (new_size < max_size) {
      max_size = new_size;
      create_squares();
    }
  }
  size_lower = new_size;

  draw_squares();
}

function change_pixel_size() {
  old_size_upper = 0;
  old_size_lower = 0;
  matrix_squares = [];
  

  if (get_pixel_size.value.includes('\'')){
    pixel_size = get_pixel_size.value.replace( /\'/g , '')
    size = (Math.abs(size_lower) + size_upper)/pixel_size
  }
  else{
    pixel_size = parseFloat(get_pixel_size.value);
    size = (Math.abs(size_lower) + size_upper)/pixel_size

  }
  create_squares();
  draw_squares();
}

function change_runspeed() {
  if (get_runspeed.value == 0) {
    clearInterval(animId);
  } else {
    if (animId) {
      clearInterval(animId);
    }
    runspeed = get_runspeed.value;
    animId = setInterval(draw_squares, 1000 / runspeed);
  }
}

var down_x;
var down_y;
var up_x;
var up_y;
var zooming;
var list1;
var list2;
var absolute_width_square;
var absolute_heigth_square;

absolute_width_square = canvas.width / size;
absolute_heigth_square = canvas.height / size;

function get_cursor_position(canvas, event) {
  const rect = canvas.getBoundingClientRect();

  if (event.type == "mousedown") {
    absolute_width_square = canvas.width / size;
    absolute_heigth_square = canvas.height / size;

    zooming = true;
    //finds the absolute coordinates clicked (f.eks 400) and
    down_x = (event.clientX - rect.left) / absolute_width_square + size_lower;
    down_y = -((event.clientY - rect.top) / absolute_width_square + size_lower);
    list1 = [down_x];
    list2 = [-down_y];
  } else if (event.type == "mouseup") {
    zooming = false;
    up_x = (event.clientX - rect.left) / absolute_width_square + size_lower;
    up_y = -((event.clientY - rect.top) / absolute_heigth_square + size_lower);

    scaled = true;
    if (event.ctrlKey) {
      scaled = false;
    }

    list1 = [down_x, up_x];
    list2 = [down_y, up_y];

    list1.sort(function (a, b) {
      return a - b;
    });
    list2.sort(function (a, b) {
      return a - b;
    });

    tegnBrukXY(list1[0], list1[1], list2[0], list2[1]);

    // create_squares();
    draw_squares();
  }
}

function zoom_guider() {
  if (zooming) {
    tegnBrukBakgrunn("black");
    const rect = canvas.getBoundingClientRect();
    
absolute_width_square = canvas.width / size;
absolute_heigth_square = canvas.height / size;


    current_x =
      (event.clientX - rect.left) / absolute_width_square + size_lower;
    current_y =
      (event.clientY - rect.top) / absolute_heigth_square + size_lower;

    var difference = Math.abs(size_lower) - Math.abs(size_upper);
    list1[1] = current_x;
    list2[1] = current_y;

    tegnFirkant(
      (list1[0]),
      (-list2[0] - difference),
      current_x,
      (-current_y - difference),
      "blue",
      false
    );
  }
}

window.onload = winInit;
function winInit() {
  ctx = canvas.getContext("2d");
  tegnBrukCanvas("canvas");

  //For refresh every second(no use for feature yet)
  // animId = setInterval(create_squares,1000/runspeed);
  tegnBrukBakgrunn("black");
  tegnBrukSynsfelt(0, 1, 0, 1);
  // ctx.filter = 'hue-rotate(200deg)' INTERESTING!

  create_squares();
  draw_squares();
}

//------------------------------------------------------------------------------\\
//! EXPLORE!
//------------------------------------------------------------------------------\\

// WITH SIZE 100 (and also try 1000?:)
// Change color with these:
//ALSO TRY TO USE Math.random() * expression. i.e => Math.random() * (X*Y)
//
// try X*Y
// try X*n/Y
// try X+Y
// try X-Y
// try -X+Y
// try -X-Y
// try X*3-Y*5
// try X*(X/Y)
// try X**X-Y**Y
// try Math.sin(X)*100 + Math.sin(Y)*100)
// try (X+Y)**2
// try X*Y**2 - (Y**3)
// try X*Y**2 - (Y**2)
// try X*Y**2
// try (X*3-Y)*(Y*10)
// try (X*3-Y)*(Y*120)
// try (sin(X*Y)*2)**6
//try Math.random()*1000
//try Math.min(X,Y)

//SUPER COOL
//try ln(abs(X*Y))*100
//try ln(X*Y)*100
//try (Y)**2 + (X)**2
//try (Y/10)**2 + (X/10)**2
//try X%Y * n or whatever
//try X<<Y
//try X/Y*1000
//try (Y)**2>>X*10000
//try Y&X
//try Y^X
//try Y|X
//try (X.Y)^100
//try (X.Y)**2
//try (X.Y)*X*Y
//try (X.Y)*X
//try (X.Y)*ln(X)
//try sqrt((X)**2 + (Y)**2)
//try sqrt((X)**3 + (Y)**3)
//try sqrt((X)**4 + (Y)**3)
//try sqrt((X)**4 + (Y)**4)
//try sqrt((X)**4 + (Y)**5)
//try Math.log(X*Y)*1000
//try Math.acosh(abs(X*Y))*1000
//try Math.atan(abs(X*Y))*100000
//try Math.cbrt(abs(X*Y))*10
//try !     Math.clz32(abs(X*Y))*100
//try Math.cos(X*Y)*100
//try Math.sin(X*Y)*100
//try Math.tan(X*Y)*100
//try abs(X.Y)*Y*X
//try XyXy
//try Xy*X
//try ((X+Y)**2) % ((X)**2)
//try Math.min(X,((X)**2)/Y)
//try !   Math.random() * (X - Y) + X
//try !   Math.random() * (X*Y)
//try ! Math.random() * (X+Y) and saturation Math.random() * ((abs(X)+abs(Y))) and hue Math.random() * ((abs(X)+abs(Y)))
//try v2a([X,Y], [Y+Y,X*2])
//try v2a([X,Y], [X,10])
//try ! v2a([  (((1 + Math.sqrt(5)) / 2) ** (X+Y) - ((1 - Math.sqrt(5)) / 2) ** (X+Y)) /   Math.sqrt(5), X*Y*10], [0,1], 'deg')
//try ! (((X)**2 + (Y)**2)**2 - ((X)**2 - (Y)**2) )/(X+Y)/100
//try ! ((X)**2 + (Y)**2)**2 /(X*Y)/1

//OTHER
//try (X*Y)**2 and saturation: X*Y -100
//try X+Y and saturation abs(X)*10 and hue abs(X)*10
//try X+Y and saturation abs(X*Y)*10
//try X+Y and saturation abs(X*Y)*abs((X)**2) and hue (X)**2*(Y)**2
