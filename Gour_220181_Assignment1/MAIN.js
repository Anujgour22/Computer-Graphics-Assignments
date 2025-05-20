////////////////////////////////////////////////////////////////////////
// A simple WebGL program to draw simple 2D shapes.
//

var gl;
var color;
var matrixStack = [];


var mMatrix = mat4.create();
var uMMatrixLocation;
var aPositionLocation;
var uColorLoc;
  // Rays rotation angle
var view = 1 ;

// Variables for animation
let moonRotation = 0.0; // Moon rotation angle
let rayRotation = 0.0;  // Rays rotation angle

const rotationSpeed = 0.01; // Speed of rotation

let boatPosition = 0;         
let boatDirection = 1;         
const boatSpeed = 0.01;        
const boatLeftLimit = -0.5;    
const boatRightLimit = 0.5;    


let boatPosition1 = 0;
let boatSpeed1 = 0.02; // Speed of movement
let boatDirection1 = 1; // Direction of movement: 1 for right, -1 for left
const maxBoatPosition1 = 0.9; // Maximum position offset
const minBoatPosition1 = -0.7; // Minimum position offset


let bladeRotationAngle1 = 0; // Initial rotation angle
const bladeRotationSpeed1 = 0.05; // Speed of rotation in radians

let bladeRotationAngle2 = 0; // Initial rotation angle
const bladeRotationSpeed2 = 0.02; // Speed of rotation in radians



let starScale = 1.0; // Current scale of the star
const minScale = 0.9; // Minimum scale value
const maxScale = 1.5; // Maximum scale value
const scaleSpeed = 0.02; // Speed of scaling up/down
let increasing = true; // Direction of scaling

var view = 1 ;

// change view to Point View
function pointVariable(){
  view = 2 ;
  drawScene();
}

// change view to Wireframe view
function wireVariable(){
  view = 3 ;
  drawScene();
}

// change view to Solid View
function solidVariable(){
  view = 1 ;
  drawScene();
}


function pointVariable(){
  view = 2 ;
  drawScene();
}

function wireVariable(){
  view = 3 ;
  drawScene();
}

function solidVariable(){
  view = 1 ;
  drawScene();
}

// GLSL Code
const vertexShaderCode = `#version 300 es
in vec2 aPosition;
uniform mat4 uMMatrix;

void main() {
  gl_Position = uMMatrix*vec4(aPosition,0.0,1.0);
  gl_PointSize = 3.0;
}`;
const fragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;

uniform vec4 color;

void main() {
  fragColor = color;
}`;


// Some Tools
function pushMatrix(stack, m) {
  //necessary because javascript only does shallow push
  var copy = mat4.create(m);
  stack.push(copy);
}
function popMatrix(stack) {
  if (stack.length > 0) return stack.pop();
  else console.log("stack has no matrix to pop!");
}
function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}


// Shaders
function vertexShaderSetup(vertexShaderCode) {
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}
function fragmentShaderSetup(fragShaderCode) {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}


// Initialise Shaders
function initShaders() {
  shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragShaderCode);

  // attach the shaders
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  //link the shader program
  gl.linkProgram(shaderProgram);

  // check for compilation and linking status
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Could not initialize shaders");
    console.error(gl.getShaderInfoLog(vertexShader));
    console.error(gl.getShaderInfoLog(fragmentShader));
  }
  
  //finally use the program.
  gl.useProgram(shaderProgram);

  return shaderProgram;
}


// Initialise Canvas
function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2"); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}


// Creating Buffer for Square
function initSquareBuffer() {
  // buffer for point locations
  const sqVertices = new Float32Array([
    0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  ]);
  sqVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sqVertices, gl.STATIC_DRAW);
  sqVertexPositionBuffer.itemSize = 2;
  sqVertexPositionBuffer.numItems = 4;

  // buffer for point indices
  const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  sqVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
  sqVertexIndexBuffer.itemsize = 1;
  sqVertexIndexBuffer.numItems = 6;
}
// Drawing Square
function drawSquare(color, mMatrix) {
    // Set the transformation matrix for the vertex shader
    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);
  
    // Bind the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
    gl.vertexAttribPointer(
      aPositionLocation,
      sqVertexPositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
  
    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  
    // Set the color uniform
    gl.uniform4fv(uColorLoc, color);
  
    // Draw the rectangle (square)
    if ( view == 1 ){
      gl.drawElements(gl.TRIANGLES, sqVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    else if ( view == 2 ){
      gl.drawElements(gl.POINTS, sqVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    else{
      gl.drawElements(gl.LINE_LOOP, sqVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}





function drawMoon() {
    
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the moon (in the upper left corner)
    mat4.translate(mMatrix, mMatrix, [-0.8, 0.85, 0]); // Position
    mat4.rotateZ(mMatrix, mMatrix, moonRotation); // Apply rotation
    mat4.scale(mMatrix, mMatrix, [0.2, 0.2, 1.0]); // Scale
    
    // Set moon color
    const moonColor = [1.0, 1.0, 1.0, 1.0]; // White color for the moon
    drawCircle(moonColor, mMatrix);
    
   
    mMatrix = popMatrix(matrixStack);
  }
  
  function drawRays() {
    const rayColor = [1.0, 1.0, 0.8, 1.0]; // Light yellow color for the rays
    const rayLength = 0.05; // Length of each ray
    const rayWidth = 0.004;  // Width of each ray
  
    // Number of rays and angle between them
    const numRays = 8;
    const angleIncrement = (2 * Math.PI) / numRays; // 360 degrees divided by number of rays
  
    for (let i = 0; i < numRays; i++) {
      
      pushMatrix(matrixStack, mMatrix);
  
      // Translate to the moon's center
      mat4.translate(mMatrix, mMatrix, [-0.8, 0.85, 0]);
  
      // Rotate the ray by the current angle plus an additional rotating angle
      mat4.rotateZ(mMatrix, mMatrix, i * angleIncrement + rayRotation);
  
      // Translate the ray outwards from the moon's surface
      mat4.translate(mMatrix, mMatrix, [0, 0.11, 0]); // Adjust to position on the moon's surface
  
      // Scale to form a long thin rectangle (ray)
      mat4.scale(mMatrix, mMatrix, [rayWidth, rayLength, 1]);
  
      // Draw the ray as a square
      drawSquare(rayColor, mMatrix);
  
      // Restore previous matrix state
      mMatrix = popMatrix(matrixStack);
    }
  }
  
  function drawClouds() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the Cloud (in the upper left corner)
    mat4.translate(mMatrix, mMatrix, [-0.9, 0.65, 0]); // Adjust these values as needed for positioning
    mat4.scale(mMatrix, mMatrix, [0.4, 0.2, 1.0]);    // Scale down to create a Cloud shape
    
    // Set Cloud color
    const CloudColor = [0.5, 0.5, 0.5, 1.0]; // White color for the Cloud
    drawCircle(CloudColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  
  
    ////////////cloud2 
  
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the Cloud2 (in the upper left corner)
    mat4.translate(mMatrix, mMatrix, [-0.75, 0.65, 0]); // Adjust these values as needed for positioning
    mat4.scale(mMatrix, mMatrix, [0.27, 0.15, 1.0]);    // Scale down to create a Cloud shape
    
    // Set Cloud2 color
    const CloudColor2 = [1.0, 1.0, 1.0, 1.0]; // White color for the Cloud
    drawCircle(CloudColor2, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  
    ////////////cloud3
  
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the Cloud3 (in the upper left corner)
    mat4.translate(mMatrix, mMatrix, [-0.6, 0.65, 0]); // Adjust these values as needed for positioning
    mat4.scale(mMatrix, mMatrix, [0.21, 0.1, 1.0]);    // Scale down to create a Cloud shape
    
    // Set Cloud3 color
    const CloudColor3 = [0.5, 0.5, 0.5, 1.0]; // White color for the Cloud
    drawCircle(CloudColor3, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  
  }

  /////////////////////////////////////////////////////////////////
  function drawGreenary() {
    // Create a matrix stack for managing transformations
    const matrixStack = [];
  
    // Function to push matrix onto stack
    function pushMatrix(stack, matrix) {
      const copy = mat4.clone(matrix);
      stack.push(copy);
    }
  
    // Function to pop matrix from stack
    function popMatrix(stack) {
      if (stack.length === 0) {
        throw "Invalid popMatrix!";
      }
      return stack.pop();
    }
  
    // Function to draw a single circle for the grass
    function drawGrass(position, size, color) {
      // Create a model matrix for transformations
      let mMatrix = mat4.create();
      pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack
  
      // Apply transformations for the grass circle
      mat4.translate(mMatrix, mMatrix, position); // Position of the grass circle
      mat4.scale(mMatrix, mMatrix, size); // Scale to create the grass circle shape
  
      // Draw the grass circle with the given color
      drawCircle(color, mMatrix);
  
      // Restore previous matrix state
      mMatrix = popMatrix(matrixStack);
    }
  
    // Define the position, sizes, and colors for each grass part
   
  
    const grassPosition4 = [-0.45, -0.98, 0]; // LOWER Grass 1
    const grassSize4 = [0.2, 0.13, 1.0]; 
    const grassColor4 = [0.004, 0.49, 0.004, 1.0]; 
  
    const grassPosition7 = [-0.25, -0.98, 0]; // Lower Grass 2
    const grassSize7 = [0.36, 0.17, 1.0]; 
    const grassColor7 = [0.14, 0.7, 0.14, 0.95]; 
  
    const grassPosition6 = [0.80, -0.37, 0]; // Side Grass 1
    const grassSize6 = [0.26, 0.17, 1.0]; 
    const grassColor6 = [0.12, 0.5, 0.004, 1.0]; 
  
    const grassPosition5 = [0.94, -0.35, 0]; // Side Grass 2
    const grassSize5 = [0.2, 0.13, 1.0]; 
    const grassColor5 = [0.137, 0.714, 0.137, 1.0]; 
  
    
  
   
    const grassPosition1 = [-0.9, -0.5, 0]; // House Grass 1
    const grassSize1 = [0.31, 0.17, 1.0]; 
    const grassColor1 = [0.14, 0.7, 0.14, 0.95]; 
  
    const grassPosition2 = [-0.8, -0.5, 0]; // House Grass 2
    const grassSize2 = [0.25, 0.17, 1.0]; 
    const grassColor2 = [0.12, 0.49, 0.004, 1.0]; 
  
    const grassPosition3 = [-0.4, -0.5, 0]; // House Grass 3 
    const grassSize3 = [0.2, 0.1, 1.0]; 
    const grassColor3 = [0.004, 0.49, 0.004, 1.0]; 
  
    const grassPosition8 = [-0.25, -0.5, 0]; // House Grass 4
    const grassSize8 = [0.2, 0.13, 1.0]; 
    const grassColor8 = [0.14, 0.7, 0.14, 0.95]; 
  
    //drawing grass
    drawGrass(grassPosition1, grassSize1, grassColor1);
    drawGrass(grassPosition2, grassSize2, grassColor2);
    drawGrass(grassPosition3, grassSize3, grassColor3);
    drawGrass(grassPosition4, grassSize4, grassColor4);
    drawGrass(grassPosition5, grassSize5, grassColor5);
    drawGrass(grassPosition6, grassSize6, grassColor6);
    drawGrass(grassPosition7, grassSize7, grassColor7);
    drawGrass(grassPosition8, grassSize8, grassColor8);
  }

///Draw Trunk///////////////////////////////////////////////////////


function DrawTrunk() {
    // Initialize the square buffer if not already done
    initSquareBuffer();
  
    // Loop to create multiple strips
    for (let i = 0; i < 3; i++) {
      // Create a model matrix for transformations
      const mMatrix = mat4.create(); // mat4 is from glMatrix library
      // Translate to the top-right corner
      mat4.translate(mMatrix, mMatrix, [0.2 + i * 0.3, 0.29, 0]);
      // // Rotate the strip slightly
      // mat4.rotateZ(mMatrix, mMatrix, i * 0.1); // Rotate around the Z-axis
      // Scale the strip to be more rectangular
      mat4.scale(mMatrix, mMatrix, [0.03, 0.3, 1]);
      // Set a color for the strip (alternating colors for visualization)
      const color = [0.655, 0.424, 0.196, 1.0];
      // Draw the transformed square as a strip
      drawSquare(color, mMatrix);
    }
  }
  
  
  
/////////////////////////////////////////////////////////////////////
   
  ////////Draw Treee/////////////////////////////////////////////////
  
  function drawTree() {
    // Initialize the triangle buffer if not already done
    initTriangleBuffer();
  
    // Color for the triangles (green)
    const color = [0.0, 1.0, 0.0, 1.0]; // Green color in RGBA
  
    // Loop to create four triangles on top of each strip
    for (let i = 0; i < 3; i++) {
      
      // Draw the first triangle on top of the first triangle
      const mMatrix2 = mat4.create();
      mat4.translate(mMatrix2, mMatrix2, [0.2 + i * 0.3, 0.34, 0]); // Stack the triangle above the first one
      mat4.scale(mMatrix2, mMatrix2, [0.19, 0.09, 1]); // Slightly smaller
      drawTriangle(color, mMatrix2);
  
      // Draw the second triangle on top of the second triangle
      const mMatrix3 = mat4.create();
      mat4.translate(mMatrix3, mMatrix3, [0.2 + i * 0.3, 0.38, 0]); // Stack the triangle above the second one
      mat4.scale(mMatrix3, mMatrix3, [0.17, 0.07, 1]); // Slightly smaller
      drawTriangle(color, mMatrix3);
  
      // Draw the third triangle on top of the third triangle
      const mMatrix4 = mat4.create();
      mat4.translate(mMatrix4, mMatrix4, [0.2 + i * 0.3, 0.42, 0]); // Stack the triangle above the third one
      mat4.scale(mMatrix4, mMatrix4, [0.16, 0.07, 1]); // Slightly smaller
      drawTriangle(color, mMatrix4);
    }
  }
  //////////////////////////////////////////////////////////////////
  


//////River Shine/////////////////////////////////////////////////////

function DrawriverShine() {
    // Initialize the square buffer if not already done
    initSquareBuffer();
  
    // Color for the strips (white)
    const color = [1.0, 1.0, 1.0, 1.0]; // White color in RGBA
  
    // Create a model matrix for transformations
    const mMatrix1 = mat4.create(); // mat4 is from glMatrix library
    // Translate to a specific position (adjust for the river location)
    mat4.translate(mMatrix1, mMatrix1, [-0.7,0.06,1]); // Adjust x and y for positioning
    // Scale the square to be a very thin rectangular strip
    mat4.scale(mMatrix1, mMatrix1, [0.4,0.0025,1]); // Very thin width (0.01) and tall height (0.5)
    // Draw the transformed square as a thin strip
    drawSquare(color, mMatrix1);
  
    const mMatrix2 = mat4.create(); // mat4 is from glMatrix library
    // Translate to a specific position (adjust for the river location)
    mat4.translate(mMatrix2, mMatrix2, [0.0,-0.06,1]); // Adjust x and y for positioning
    // Scale the square to be a very thin rectangular strip
    mat4.scale(mMatrix2, mMatrix2, [0.4,0.0025,1]); // Very thin width (0.01) and tall height (0.5)
    // Draw the transformed square as a thin strip
    drawSquare(color, mMatrix2);
  
    const mMatrix3 = mat4.create(); // mat4 is from glMatrix library
    // Translate to a specific position (adjust for the river location)
    mat4.translate(mMatrix3, mMatrix3, [0.7,0.06,1]); // Adjust x and y for positioning
    // Scale the square to be a very thin rectangular strip
    mat4.scale(mMatrix3, mMatrix3, [0.4,0.0025,1]); // Very thin width (0.01) and tall height (0.5)
    // Draw the transformed square as a thin strip
    drawSquare(color, mMatrix3);
  }
  
  //////////////////////////////////////////////////////////////////

  
// Draw Mountains///////////////////////////////////////////////
// function drawMountain() {
//   // Color for the mountains (lighter brown)
//   const color = [0.6, 0.4, 0.2, 1.0]; // Lighter brown color in RGBA

//   // Function to push matrix onto stack
//   function pushMatrix(stack, matrix) {
//     const copy = mat4.clone(matrix);
//     stack.push(copy);
//   }

//   // Function to pop matrix from stack
//   function popMatrix(stack) {
//     if (stack.length === 0) {
//       throw "Invalid popMatrix!";
//     }
//     return stack.pop();
//   }

//   // Create a model matrix for the first mountain
//   let mMatrix = mat4.create();
//   pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

//   // Translate and scale for the first mountain
//   mat4.translate(mMatrix, mMatrix, [-0.7, 0.30, 0]); // Adjust x and y for positioning
//   mat4.scale(mMatrix, mMatrix, [1, 0.30, 1]); // Scale to create the first mountain
//   drawTriangle(color, mMatrix); // Draw the first mountain

//   mMatrix = popMatrix(matrixStack); // Restore the matrix

//   // Create a model matrix for the second mountain
//   pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

//   // Translate and scale for the second mountain
//   mat4.translate(mMatrix, mMatrix, [0, 0.39, 0]); // Adjust x and y for positioning
//   mat4.scale(mMatrix, mMatrix, [1, 0.49, 1]); // Scale to create the second mountain
//   drawTriangle(color, mMatrix); // Draw the second mountain

//   mMatrix = popMatrix(matrixStack); // Restore the matrix

//   // Create a model matrix for the third mountain
//   pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

//   // Translate and scale for the third mountain
//   mat4.translate(mMatrix, mMatrix, [0.6, 0.39, 0]); // Adjust x and y for positioning
//   mat4.scale(mMatrix, mMatrix, [1, 0.49, 1]); // Scale to create the third mountain
//   drawTriangle(color, mMatrix); // Draw the third mountain

//   mMatrix = popMatrix(matrixStack); // Restore the matrix

// }
function drawMountain1() {
  // Color for the mountains (lighter brown)
  const color = [0.4196, 0.2588, 0.0157, 1.0]; // Lighter brown color in RGBA
  // 0.4196, 0.2588, 0.0157, 1.0

  pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

  // Translate and scale for the first mountain
  mat4.translate(mMatrix, mMatrix, [-0.7, 0.30, 0]); // Adjust x and y for positioning
  mat4.scale(mMatrix, mMatrix, [1, 0.30, 1]); // Scale to create the first mountain
  drawTriangle(color, mMatrix); // Draw the first mountain

  mMatrix = popMatrix(matrixStack); // Restore the matrix

  const color1 = [0.6, 0.4, 0.2, 1.0];

  // Create a model matrix for the third mountain
  pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

  // Translate and scale for the third mountain
  mat4.translate(mMatrix, mMatrix, [0.6, 0.39, 0]); // Adjust x and y for positioning
  mat4.scale(mMatrix, mMatrix, [1, 0.49, 1]); // Scale to create the third mountain
  drawTriangle(color1, mMatrix); // Draw the third mountain

  mMatrix = popMatrix(matrixStack); // Restore the matrix

}

function drawMountain2(){

  const color = [0.4196, 0.2588, 0.0157, 1.0];
  // Create a model matrix for the second mountain
  pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

  // Translate and scale for the second mountain
  mat4.translate(mMatrix, mMatrix, [0, 0.39, 0]); // Adjust x and y for positioning
  mat4.scale(mMatrix, mMatrix, [1, 0.49, 1]); // Scale to create the second mountain
  drawTriangle(color, mMatrix); // Draw the second mountain

  mMatrix = popMatrix(matrixStack); // Restore the matrix
}

function mountainShadow1(){
  const color1 = [0.6, 0.4, 0.2, 1.0];

  // Create a model matrix for the third mountain
  pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

  // Translate and scale for the third mountain
  mat4.translate(mMatrix, mMatrix, [-0.7, 0.30, 0]); // Adjust x and y for positioning
  mat4.scale(mMatrix, mMatrix, [1, 0.30, 1]); // Scale to create the third mountain
  drawSTriangle(color1, mMatrix); // Draw the third mountain

  mMatrix = popMatrix(matrixStack); // Restore the matrix

}

function mountainShadow2(){
  const color = [0.6, 0.4, 0.2, 1.0];
  // Create a model matrix for the second mountain
  pushMatrix(matrixStack, mMatrix); // Push current matrix onto stack

  // Translate and scale for the second mountain
  mat4.translate(mMatrix, mMatrix, [0, 0.39, 0]); // Adjust x and y for positioning
  mat4.scale(mMatrix, mMatrix, [1, 0.49, 1]); // Scale to create the second mountain
  drawSTriangle(color, mMatrix); // Draw the second mountain

  mMatrix = popMatrix(matrixStack); // Restore the matrix
}

// Draw Green Ground
function drawGround() {
  // Preserve current matrix state
  pushMatrix(matrixStack, mMatrix);
  
  // Apply transformations for the Ground (centered horizontally and vertically)
  mat4.translate(mMatrix, mMatrix, [0.0, -0.5, 0]); // Adjust as needed to center the Ground horizontally
  mat4.scale(mMatrix, mMatrix, [2.0, 1.3, 1.0]);    // Scale down to create  Ground shape

  // Set the color to green for the Ground
  const GroundColor = [0, 0.5, 0, 0.5]; // green color for the Grund
  drawSquare(GroundColor, mMatrix);
  
  // Restore previous matrix state
  mMatrix = popMatrix(matrixStack);
}

// Draw Green Path
function DrawGreenPath(){
    // Drawing Road with Triangle
    pushMatrix(matrixStack, mMatrix);
    mat4.translate(mMatrix, mMatrix, [0.15, -0.68, 0]); // Local translation
    mat4.rotate(mMatrix, mMatrix, degToRad(30), [0, 0, 1]); // Local rotation
    mat4.scale(mMatrix, mMatrix, [1.8, 1.8, 1.0]); // Scaling to make it a rectangl
    color = [0.514, 0.710, 0.239, 1.0]; // Color for Road
    drawTriangle(color, mMatrix);
    mMatrix = popMatrix(matrixStack);
}



// Draw Car
function drawCar() {
  
  // Car Upper Part (ellipse)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.548, -0.67, 0]); // Positioning 
  mat4.scale(mMatrix, mMatrix, [0.34, 0.22, 1.0]); 
  const topColor = [0.13, 0.29, 0.72, 1.0]; //  color for the car top
  drawCircle(topColor, mMatrix); 
  mMatrix = popMatrix(matrixStack);

  // Car Windows (Rectangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.55, -0.67, 0]); // Position
  mat4.scale(mMatrix, mMatrix, [0.24, 0.08, 1.0]);  // size
  const windowColor = [0.6, 0.6, 0.6, 0.8]; // Light grey colour for the windows
  drawSquare(windowColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Left Wheel's Bigger circle  (behind the wheel)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.7, -0.82, 0]); // Positionl
  mat4.scale(mMatrix, mMatrix, [0.12, 0.12, 1.0]); 
  const blackColor = [0.0, 0.0, 0.0, 1.0]; // Black color 
  drawCircle(blackColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Left smaller Wheel
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.7, -0.82, 0]); // Position\
  mat4.scale(mMatrix, mMatrix, [0.1, 0.1, 1.0]); //   size
  const wheelColor = [0.3, 0.3, 0.3, 1.0]; //  grey colour for the wheels
  drawCircle(wheelColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Right bigger Circle (black circle behind the wheel)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.4, -0.82, 0]); // Positioning the right wheel
  mat4.scale(mMatrix, mMatrix, [0.12, 0.12, 1.0]); // Slightly larger than the wheel
  drawCircle(blackColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Right smaller  Wheel
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.4, -0.82, 0]); // Position
  mat4.scale(mMatrix, mMatrix, [0.1, 0.1, 1.0]); // Adjust size
  drawCircle(wheelColor, mMatrix);
  mMatrix = popMatrix(matrixStack);
  
  // Car Body (bottom rectangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.55, -0.75, 0]); // Position
  mat4.scale(mMatrix, mMatrix, [0.4, 0.125, 1.0]);  // Adjust size
  const bodyColor = [0.3, 0.6, 0.9, 1.0]; // Blue color 
  drawSquare(bodyColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Left Triangle 
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.75, -0.75, 0]); // Position
  mat4.scale(mMatrix, mMatrix, [0.2, 0.125, 1.0]);  //size
  const triangleColor = [0.3, 0.6, 0.9, 1.0]; // Same color as car body
  drawTriangle(triangleColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Right Triangle 
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.35, -0.75, 0]); // Position
  mat4.scale(mMatrix, mMatrix, [-0.2, 0.125, 1.0]);  //  scale 
  drawTriangle(triangleColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

}




////////Draw Windmill/////////////////////////////////////////////

//#1

function drawWindmill1() {

  
    // Draw the Base (Vertical Rectangle)
    drawBase();
    // Draw the Blades (4 Triangles originating from the hub)
    drawBlades();
    // Draw the Hub (Circle on top of the base)
    drawHub();
  }
  
  function drawBase() {
    // translating it to correct position
    const translation = [0.66, 0.5, 0];
  
    pushMatrix(matrixStack, mMatrix);
    
    
    mat4.translate(mMatrix, mMatrix, translation);   
  
  // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the base
    mat4.translate(mMatrix, mMatrix, [0.0, -0.5, 0]); // Center at the bottom
    mat4.scale(mMatrix, mMatrix, [0.04, 0.6, 1.0]);    // Scale to create a vertical rectangle (stem)
  
    // Set color for the base
    const baseColor = [0.0980, 0.0863, 0.0863,0.9]; // Brown color for the base
    drawSquare(baseColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  }
  
  function drawHub() {
  
    const translation = [0.66, 0.5, 0];
  
    pushMatrix(matrixStack, mMatrix);
    
    
    mat4.translate(mMatrix, mMatrix, translation);  
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the hub
    // Translate the hub to the top of the base (0.6/2 for base height + 0.1/2 for hub radius)
    mat4.translate(mMatrix, mMatrix, [0.0, -0.2, 0]); // Base height/2 is 0.3, hub radius/2 is 0.05, so 0.3 - 0.05
    
    // Scale the hub
    mat4.scale(mMatrix, mMatrix, [0.07, 0.07, 1.0]);    // Adjust size of the hub
    
    // Set color for the hub
    const hubColor = [0, 0, 0, 1.0]; // White color for the hub
    drawCircle(hubColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  }
  
  function drawBlades() {
    const bladeColor = [0.8, 0.8, 0.8, 1.0]; // Light grey color for the blades
    const bladeLength = 0.35; // Length of the long sides of the blade (3.5 times the base)
    const bladeBase = 0.1;   // Length of the short base of the isosceles triangle
  
    // Convert 40 degrees to radians
    const rotationAngle = (40 * Math.PI) / 180; // 40 degrees in radians
  
    for (let i = 0; i < 4; i++) {
        const translation = [0.66, 0.5, 0];
    
        pushMatrix(matrixStack, mMatrix);
        
        mat4.translate(mMatrix, mMatrix, translation);

        // Preserve current matrix state
        pushMatrix(matrixStack, mMatrix);
    
        // Translate to the hub's center (top of the base rectangle)
        mat4.translate(mMatrix, mMatrix, [0.0, -0.2, 0]); 
  
        // Rotate each blade by the current rotation angle
        mat4.rotateZ(mMatrix, mMatrix, bladeRotationAngle1 + (i * Math.PI) / 2); 
  
        // Adjust the position so the vertex of the isosceles triangle (formed by two equal sides) is at the hub's center
        mat4.translate(mMatrix, mMatrix, [0.0, -bladeLength / 2, 0]);
  
        // Scale to form an isosceles triangle with the correct proportions
        mat4.scale(mMatrix, mMatrix, [bladeBase, bladeLength, 1.0]);
  
        // Draw the blade as a triangle
        drawTriangle(bladeColor, mMatrix);
    
        // Restore previous matrix state
        mMatrix = popMatrix(matrixStack);
    }
}


  function updateBladeRotation1() {
    bladeRotationAngle1 += bladeRotationSpeed1; // Increment the rotation angle

    // Reset the angle to avoid overflow
    if (bladeRotationAngle1 > 2 * Math.PI) {
        bladeRotationAngle1 -= 2 * Math.PI;
    }
}

  
  //#2
  
  function drawWindmill2() {
  
    
    // Draw the Base (Vertical Rectangle)
    drawBase2();
    // Draw the Blades (4 Triangles originating from the hub)
    drawBlades2();
    // Draw the Hub (Circle on top of the base)
    drawHub2();
  }
  
  function drawBase2() {
    // translating it to correct position
    const translation = [0.35, 0.45, 0];
  
  
    pushMatrix(matrixStack, mMatrix);
    
    
    mat4.translate(mMatrix, mMatrix, translation);   
  
  // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the base
    mat4.translate(mMatrix, mMatrix, [0.0, -0.5, 0]); // Center at the bottom
    mat4.scale(mMatrix, mMatrix, [0.025, 0.6, 1.0]);    // Scale to create a vertical rectangle (stem)
  
    // Set color for the base
    const baseColor = [0.0980, 0.0863, 0.0863,0.9]; // Brown color for the base
    drawSquare(baseColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  }
  
  function drawHub2() {
  
    const translation = [0.35, 0.45, 0];
  
  
    pushMatrix(matrixStack, mMatrix);
    
    
    mat4.translate(mMatrix, mMatrix, translation);  
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the hub
    // Translate the hub to the top of the base (0.6/2 for base height + 0.1/2 for hub radius)
    mat4.translate(mMatrix, mMatrix, [0.0, -0.2, 0]); // Base height/2 is 0.3, hub radius/2 is 0.05, so 0.3 - 0.05
    
    // Scale the hub
    mat4.scale(mMatrix, mMatrix, [0.035, 0.035, 1.0]);    // Adjust size of the hub
    
    // Set color for the hub
    const hubColor = [0, 0, 0, 1.0]; // White color for the hub
    drawCircle(hubColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  }
  
  function drawBlades2() {
    const bladeColor2 = [0.8, 0.8, 0.8, 1.0]; // Light grey color for the blades
    const bladeLength2 = 0.3; // Length of the long sides of the blade
    const bladeBase2 = 0.1;   // Length of the short base of the isosceles triangle

    for (let i = 0; i < 4; i++) {
        const translation = [0.35, 0.45, 0];

        pushMatrix(matrixStack, mMatrix);

        mat4.translate(mMatrix, mMatrix, translation);

        // Preserve current matrix state
        pushMatrix(matrixStack, mMatrix);

        // Translate to the hub's center (top of the base rectangle)
        mat4.translate(mMatrix, mMatrix, [0.0, -0.2, 0]);

        // Rotate each blade by the updated rotation angle
        mat4.rotateZ(mMatrix, mMatrix, bladeRotationAngle2 + (i * Math.PI) / 2);

        // Adjust the position so the vertex of the isosceles triangle is at the hub's center
        mat4.translate(mMatrix, mMatrix, [0.0, -bladeLength2 / 2, 0]);

        // Scale to form an isosceles triangle with the correct proportions
        mat4.scale(mMatrix, mMatrix, [bladeBase2, bladeLength2, 1.0]);

        // Draw the blade as a triangle
        drawTriangle(bladeColor2, mMatrix);

        // Restore previous matrix state
        mMatrix = popMatrix(matrixStack);
    }
}

  
  
  
  
  
  function updateBladeRotation2() {
    bladeRotationAngle2 += bladeRotationSpeed2; // Increment the rotation angle

    // Reset the angle to avoid overflow
    if (bladeRotationAngle2 > 2 * Math.PI) {
        bladeRotationAngle2 -= 2 * Math.PI;
    }
}
  
  
  //////////////////////////////////////////////////////////////////

// Draw House
function drawHouse() {

  // Walls (rectangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.65, -0.38, 0]); // Positioning the walls
  mat4.scale(mMatrix, mMatrix, [0.5, 0.35, 1.0]);  // Adjust size
  const wallColor = [1.0, 1.0, 1.0, 1.0]; // White color for the walls
  drawSquare(wallColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Roof Right(triangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.4, -0.2, 0]); // Positioning the roof
  mat4.scale(mMatrix, mMatrix, [0.15, 0.2, 1.0]); // Adjust size
  const roofColor = [1.0, 0.3, 0.0, 1.0]; // Red/orange color for the roof
  drawTriangle(roofColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Roof Left(triangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.9, -0.2, 0]); // Positioning the roof
  mat4.scale(mMatrix, mMatrix, [0.15, 0.2, 1.0]); // Adjust size
  const roofColor2 = [1.0, 0.3, 0.0, 1.0]; // Red/orange color for the roof
  drawTriangle(roofColor2, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // House Top (Top rectangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.65, -0.2, 0]); // Positioning 
  mat4.scale(mMatrix, mMatrix, [0.5, 0.2, 1.0]);  // Adjust size
  const bodyColor = [1.0, 0.3, 0.0, 1.0]; // Red color 
  drawSquare(bodyColor, mMatrix);
  mMatrix = popMatrix(matrixStack);


  // Door (rectangle)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.65, -0.458, 0]); // Positioning the door
  mat4.scale(mMatrix, mMatrix, [0.08, 0.2, 1.0]);  // Adjust size
  const doorColor = [1.0, 0.8, 0.2, 1.0]; // Yellow color for the door
  drawSquare(doorColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Left Window (square)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.8, -0.38, 0]); // Positioning the left window
  mat4.scale(mMatrix, mMatrix, [0.06, 0.06, 1.0]);  // Adjust size
  const windowColor = [1.0, 0.8, 0.2, 1.0]; // Yellow color for the window
  drawSquare(windowColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

  // Right Window (square)
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [-0.5, -0.38, 0]); // Positioning the right window
  mat4.scale(mMatrix, mMatrix, [0.06, 0.06, 1.0]);  // Adjust size
  drawSquare(windowColor, mMatrix);
  mMatrix = popMatrix(matrixStack);

}


  
// Draw Night




function drawSKY(){
   // Preserve current matrix state
   pushMatrix(matrixStack, mMatrix);
  
   // Apply transformations for the sky (centered horizontally and vertically)
   mat4.translate(mMatrix, mMatrix, [0.0, 0.5, 0]); 
   mat4.scale(mMatrix, mMatrix, [2.0, 1.0, 1.0]);    
 
   // Set the color to black for the Ground
   const Color = [0.0, 0.0, 0.0, 1]; 
   drawSquare(Color, mMatrix);
   
   // Restore previous matrix state
   mMatrix = popMatrix(matrixStack);
   
}

// Define global variables for stars' scales and animation
let star1Scale = 1.0;
const star1MinScale = 0.9;
const star1MaxScale = 1.5;
const star1ScaleSpeed = 0.02;
let star1Increasing = true;

let star2Scale = 1.0;
const star2MinScale = 0.8;
const star2MaxScale = 1.4;
const star2ScaleSpeed = 0.03;
let star2Increasing = true;

let star3Scale = 1.0;
const star3MinScale = 0.85;
const star3MaxScale = 1.25;
const star3ScaleSpeed = 0.02;
let star3Increasing = true;

let star4Scale = 1.0;
const star4MinScale = 0.6;
const star4MaxScale = 1.4;
const star4ScaleSpeed = 0.05;
let star4Increasing = true;

let star5Scale = 1.0;
const star5MinScale = 0.75;
const star5MaxScale = 1.35;
const star5ScaleSpeed = 0.03;
let star5Increasing = true;

// Update the scale for each star
function updateStarScale() {
  // Update Star 1
  if (star1Increasing) {
    star1Scale += star1ScaleSpeed;
    if (star1Scale >= star1MaxScale) {
      star1Scale = star1MaxScale;
      star1Increasing = false;
    }
  } else {
    star1Scale -= star1ScaleSpeed;
    if (star1Scale <= star1MinScale) {
      star1Scale = star1MinScale;
      star1Increasing = true;
    }
  }

  // Update Star 2
  if (star2Increasing) {
    star2Scale += star2ScaleSpeed;
    if (star2Scale >= star2MaxScale) {
      star2Scale = star2MaxScale;
      star2Increasing = false;
    }
  } else {
    star2Scale -= star2ScaleSpeed;
    if (star2Scale <= star2MinScale) {
      star2Scale = star2MinScale;
      star2Increasing = true;
    }
  }

  // Update Star 3
  if (star3Increasing) {
    star3Scale += star3ScaleSpeed;
    if (star3Scale >= star3MaxScale) {
      star3Scale = star3MaxScale;
      star3Increasing = false;
    }
  } else {
    star3Scale -= star3ScaleSpeed;
    if (star3Scale <= star3MinScale) {
      star3Scale = star3MinScale;
      star3Increasing = true;
    }
  }

  // Update Star 4
  if (star4Increasing) {
    star4Scale += star4ScaleSpeed;
    if (star4Scale >= star4MaxScale) {
      star4Scale = star4MaxScale;
      star4Increasing = false;
    }
  } else {
    star4Scale -= star4ScaleSpeed;
    if (star4Scale <= star4MinScale) {
      star4Scale = star4MinScale;
      star4Increasing = true;
    }
  }

  // Update Star 5
  if (star5Increasing) {
    star5Scale += star5ScaleSpeed;
    if (star5Scale >= star5MaxScale) {
      star5Scale = star5MaxScale;
      star5Increasing = false;
    }
  } else {
    star5Scale -= star5ScaleSpeed;
    if (star5Scale <= star5MinScale) {
      star5Scale = star5MinScale;
      star5Increasing = true;
    }
  }
}

function drawSky() {
  // Preserve current matrix state
  pushMatrix(matrixStack, mMatrix);
  
  // Apply transformations for the sky (centered horizontally and vertically)
  mat4.translate(mMatrix, mMatrix, [0.0, 0.5, 0]); 
  mat4.scale(mMatrix, mMatrix, [2.0, 1.0, 1.0]);    
 
  // Set the color to black for the Ground
  const Color = [0.0, 0.0, 0.0, 1]; 
  drawSquare(Color, mMatrix);
   
  // Restore previous matrix state
  mMatrix = popMatrix(matrixStack);
}

function drawStar1() {
  const starColor = [1.0, 1.0, 1.0, 1.0];
  const baseMatrix = mat4.create();
  mat4.translate(baseMatrix, baseMatrix, [0.0, 0.8, 0.0]);
  mat4.scale(baseMatrix, baseMatrix, [0.01, 0.01, 1.0]);
  drawSquare(starColor, baseMatrix);

  // Draw triangles
  drawStarTriangles(baseMatrix, star1Scale, starColor);
}

function drawStar2() {
  const starColor = [1.0, 1.0, 1.0, 1.0];
  const baseMatrix = mat4.create();
  mat4.translate(baseMatrix, baseMatrix, [0.3, 0.9, 0.0]);
  mat4.scale(baseMatrix, baseMatrix, [0.02, 0.02, 1.0]);
  drawSquare(starColor, baseMatrix);

  // Draw triangles
  drawStarTriangles(baseMatrix, star2Scale, starColor);
}

function drawStar3() {
  const starColor = [1.0, 1.0, 1.0, 1.0];
  const baseMatrix = mat4.create();
  mat4.translate(baseMatrix, baseMatrix, [-0.4, 0.7, 0.0]);
  mat4.scale(baseMatrix, baseMatrix, [0.014, 0.014, 1.0]);
  drawSquare(starColor, baseMatrix);

  // Draw triangles
  drawStarTriangles(baseMatrix, star3Scale, starColor);
}

function drawStar4() {
  const starColor = [1.0, 1.0, 1.0, 1.0];
  const baseMatrix = mat4.create();
  mat4.translate(baseMatrix, baseMatrix, [-0.3, 0.6, 0.0]);
  mat4.scale(baseMatrix, baseMatrix, [0.01, 0.01, 1.0]);
  drawSquare(starColor, baseMatrix);

  // Draw triangles
  drawStarTriangles(baseMatrix, star4Scale, starColor);
}

function drawStar5() {
  const starColor = [1.0, 1.0, 1.0, 1.0];
  const baseMatrix = mat4.create();
  mat4.translate(baseMatrix, baseMatrix, [-0.4, 0.49, 0.0]);
  mat4.scale(baseMatrix, baseMatrix, [0.02, 0.02, 1.0]);
  drawSquare(starColor, baseMatrix);

  // Draw triangles
  drawStarTriangles(baseMatrix, star5Scale, starColor);
}

// Function to draw triangles on each face of the square
function drawStarTriangles(baseMatrix, starScale, starColor) {
  let triangleMatrix = mat4.clone(baseMatrix);
  mat4.translate(triangleMatrix, triangleMatrix, [0.0, -1.0, 0]);
  mat4.scale(triangleMatrix, triangleMatrix, [starScale, starScale, 1.0]);
  mat4.rotateZ(triangleMatrix, triangleMatrix, Math.PI);
  drawTriangle(starColor, triangleMatrix);

  triangleMatrix = mat4.clone(baseMatrix);
  mat4.translate(triangleMatrix, triangleMatrix, [0, 1.0, 0]);
  mat4.scale(triangleMatrix, triangleMatrix, [starScale, starScale, 1.0]);
  drawTriangle(starColor, triangleMatrix);

  triangleMatrix = mat4.clone(baseMatrix);
  mat4.translate(triangleMatrix, triangleMatrix, [-1.0, 0, 0]);
  mat4.scale(triangleMatrix, triangleMatrix, [starScale, starScale, 1.0]);
  mat4.rotateZ(triangleMatrix, triangleMatrix, Math.PI / 2);
  drawTriangle(starColor, triangleMatrix);

  triangleMatrix = mat4.clone(baseMatrix);
  mat4.translate(triangleMatrix, triangleMatrix, [1.0, 0, 0]);
  mat4.scale(triangleMatrix, triangleMatrix, [starScale, starScale, 1.0]);
  mat4.rotateZ(triangleMatrix, triangleMatrix, -Math.PI / 2);
  drawTriangle(starColor, triangleMatrix);
}

// Main animation loop


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
// Initialise Buffer for Circle
function initCircleBuffer() {
  const numSegments = 100; // Number of segments to approximate the circle
  const radius = 0.5; // Radius of the circle
  const circleVertices = [];
  const circleIndices = [];

  // Generate circle vertices
  circleVertices.push(0.0, 0.0); // Center of the circle
  for (let i = 0; i <= numSegments; i++) {
    const angle = (2 * Math.PI * i) / numSegments;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    circleVertices.push(x, y);
  }

  // Generate circle indices
  for (let i = 1; i <= numSegments; i++) {
    circleIndices.push(0, i, i + 1);
  }
  // Close the circle
  circleIndices.push(0, numSegments, 1);

  // Create buffer for circle vertices
  circleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);
  circleVertexBuffer.itemSize = 2;
  circleVertexBuffer.numItems = circleVertices.length / 2;

  // Create buffer for circle indices
  circleIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(circleIndices), gl.STATIC_DRAW);
  circleIndexBuffer.itemSize = 1;
  circleIndexBuffer.numItems = circleIndices.length;
}
// Draw Circle
function drawCircle(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // Bind the circle vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    circleVertexBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Bind the circle index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuffer);

  // Set the color uniform
  gl.uniform4fv(uColorLoc, color);

  // Draw the circle
  if ( view == 1 ){
    gl.drawElements(gl.TRIANGLES, circleIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }
  else if ( view == 2 ){
    gl.drawElements(gl.POINTS, circleIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }
  else{
    gl.drawElements(gl.LINE_LOOP, circleIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }
}

// Initialise Triangle Buffer
function initTriangleBuffer() {
  // buffer for point locations
  const triangleVertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  triangleBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
  triangleBuf.itemSize = 2;
  triangleBuf.numItems = 3;

  // buffer for point indices
  const triangleIndices = new Uint16Array([0, 1, 2]);
  triangleIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
  triangleIndexBuf.itemsize = 1;
  triangleIndexBuf.numItems = 3;
}

function initSTriangleBuffer() {
  // buffer for point locations
  const triangleVertices = new Float32Array([0.0, 0.5, -0.35, -0.5, 0.5, -0.5]);
  triangleBuff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuff);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
  triangleBuff.itemSize = 2;
  triangleBuff.numItems = 3;

  // buffer for point indices
  const triangleIndices = new Uint16Array([0, 1, 2]);
  triangleIndexBuff = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuff);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
  triangleIndexBuff.itemsize = 1;
  triangleIndexBuff.numItems = 3;
}

// Draw Triangle
function drawTriangle(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
  gl.vertexAttribPointer(
    aPositionLocation,
    triangleBuf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);

  gl.uniform4fv(uColorLoc, color);

  // now draw the square
  if ( view == 1 ){
    gl.drawElements(gl.TRIANGLES, triangleIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);
  }
  else if ( view == 2 ){
    gl.drawElements(gl.POINTS, triangleIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);
  }
  else{
    gl.drawElements(gl.LINE_LOOP, triangleIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);
  }
}

function drawSTriangle(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuff);
  gl.vertexAttribPointer(
    aPositionLocation,
    triangleBuff.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuff);

  gl.uniform4fv(uColorLoc, color);

  // now draw the square
  if ( view == 1 ){
    gl.drawElements(gl.TRIANGLES, triangleIndexBuff.numItems, gl.UNSIGNED_SHORT, 0);
  }
  else if ( view == 2 ){
    gl.drawElements(gl.POINTS, triangleIndexBuff.numItems, gl.UNSIGNED_SHORT, 0);
  }
  else{
    gl.drawElements(gl.LINE_LOOP, triangleIndexBuff.numItems, gl.UNSIGNED_SHORT, 0);
  }
}


// Draw River
function drawRiver() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the river (centered horizontally and vertically)
    mat4.translate(mMatrix, mMatrix, [0.0, 0.0, 0]); // Adjust as needed to center the river horizontally
    mat4.scale(mMatrix, mMatrix, [3.0, 0.2, 1.0]);    // Scale down to create a river shape
  
    // Set the color to blue for the river
    const riverColor = [0, 0, 1, 0.67]; // Blue color for the river
    drawSquare(riverColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  }




///////////////////////////////////////////////////////////

  function drawBoat2() {
  // Draw the boat's base 
  drawBoatBase2();

  // Draw the left triangle (sail)
  drawLeftSail2();

  // Draw the right triangle (sail)
  drawRightSail2();

  // Draw the flag
  drawFlag2();
//
  drawFlagSupportString2();
}

function drawFlagSupportString2() {

  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [boatPosition, 0, 0]); 

   // adjusting boat and size location 
   const translation = [-0.0, 0.38, 0];
   const scale = [0.6,0.6,0.5 ] ;

  pushMatrix(matrixStack, mMatrix);
  
  
  mat4.translate(mMatrix, mMatrix, translation);
  mat4.scale(mMatrix, mMatrix, scale);
  
  /////////////////
  // Preserve current matrix state
  pushMatrix(matrixStack, mMatrix);
  
  // Translate to the position of the flag's base
  mat4.translate(mMatrix, mMatrix, [-0.064, -0.443, 0.0]); // Adjust to start from the boat's base
  mat4.rotateZ(mMatrix, mMatrix, (mMatrix, mMatrix, -Math.PI/7)); // Rotate to match the angle of the flag's string
  mat4.scale(mMatrix, mMatrix, [0.005, 0.23, 1.0]); // Scale to make the string thin and long

  // Set color for the flag's support string
  const stringColor = [0.0980, 0.0863, 0.0863,0.9]; // Black color for the string
  drawSquare(stringColor, mMatrix);
  
  // Restore previous matrix state
  mMatrix = popMatrix(matrixStack);
}
function drawBoatBase2() {
  
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [boatPosition, 0.6, 0]); // Apply boatPosition
  mat4.translate(mMatrix, mMatrix, [0.0, -0.6, 0.0]);
  mat4.scale(mMatrix, mMatrix, [0.2, 0.1, 1.0]);

  const baseColor = [0.7, 0.7, 0.7, 1.0];
  drawSquare(baseColor, mMatrix);

  mMatrix = popMatrix(matrixStack);
}


function drawLeftSail2() {
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [boatPosition, 0.6, 0]); // Apply boatPosition
  mat4.translate(mMatrix, mMatrix, [-0.1, -0.6, 0.0]);
  mat4.scale(mMatrix, mMatrix, [0.1, 0.1, 1.0]);
  mat4.rotateZ(mMatrix, mMatrix, Math.PI);

  const sailColor = [0.7, 0.7, 0.7, 1.0];
  drawTriangle(sailColor, mMatrix);

  mMatrix = popMatrix(matrixStack);
}

function drawRightSail2() {
    pushMatrix(matrixStack, mMatrix);
    mat4.translate(mMatrix, mMatrix, [boatPosition, 0.6, 0]); // Apply boatPosition
    mat4.translate(mMatrix, mMatrix, [0.1, -0.6, 0.0]);
    mat4.scale(mMatrix, mMatrix, [0.1, 0.1, 1.0]);
    mat4.rotateZ(mMatrix, mMatrix, Math.PI);

    const sailColor = [0.7, 0.7, 0.7, 1.0];
    drawTriangle(sailColor, mMatrix);

    mMatrix = popMatrix(matrixStack);
}

function drawFlag2() {
  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [boatPosition, 0, 0]); 
   // adjusting boat and size location 
   const translation = [-0.0, 0.38, 0];
   const scale = [0.6,0.6,0.5 ] ;

  pushMatrix(matrixStack, mMatrix);
  
  
  mat4.translate(mMatrix, mMatrix, translation);
  mat4.scale(mMatrix, mMatrix, scale);
  
  /////////////////

  // Preserve current matrix state
  pushMatrix(matrixStack, mMatrix);
  
  // Translate to the top of the boat's mast
  mat4.translate(mMatrix, mMatrix, [0.027, -0.37, 0.0]); // Position flag at the top
  mat4.scale(mMatrix, mMatrix, [0.14, 0.15, 1.0]); // Scale to a small triangle
  mat4.rotateZ(mMatrix, mMatrix, Math.PI/6.7 ); // Rotate the flag 90 degrees
  
  // Set color for the flag
  const flagColor = [1.0, 0.0, 0.0, 1.0]; // Red color for the flag
  drawTriangle(flagColor, mMatrix);
  
  // Restore previous matrix state
  mMatrix = popMatrix(matrixStack);

  //FLAG SUPPORT

  pushMatrix(matrixStack, mMatrix);
  mat4.translate(mMatrix, mMatrix, [boatPosition, 0, 0]); 
   // adjusting boat and size location 
   const Translation = [-0.6, 0.39, 0];
   const Scale = [0.6,0.6,0.5 ] ;

  pushMatrix(matrixStack, mMatrix);
  
  
  mat4.translate(mMatrix, mMatrix, translation);
  mat4.scale(mMatrix, mMatrix, scale);
  
  /////////////////


  //Preserve current matrix state
  pushMatrix(matrixStack, mMatrix);
  
  // Apply transformations for the base
  mat4.translate(mMatrix, mMatrix, [-0.01, -0.425, 0]); // Center at the bottom
  mat4.scale(mMatrix, mMatrix, [0.01, 0.25, 1.0]);    // Scale to create a vertical rectangle (stem)

  // Set color for the base
  const baseColor = [0.0980, 0.0863, 0.0863,0.9]; // Brown color for the base
  drawSquare(baseColor, mMatrix);
  
  // Restore previous matrix state
  mMatrix = popMatrix(matrixStack);

}

function updateBoatAnimation() {
  // Update position based on direction
  boatPosition += boatSpeed * boatDirection;
  
  // Reverse direction if boundaries are hit
  if (boatPosition > boatRightLimit || boatPosition < boatLeftLimit) {
      boatDirection *= -1;
  }
}


///////////////////////////////////////////////////////////////////


function drawBoat1() {
    // Draw the boat's base 
    drawBoatBase1();
  
    // Draw the left triangle (sail)
    drawLeftSail1();
  
    // Draw the right triangle (sail)
    drawRightSail1();
  
    // Draw the flag
    drawFlag1();
  
    // Draw the flag support string
    drawFlagSupportString1();
}

function drawFlagSupportString1() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Translate to the position of the flag's base
    mat4.translate(mMatrix, mMatrix, [boatPosition1 - 0.13, 0.15, 0.0]); // Adjust position
    mat4.rotateZ(mMatrix, mMatrix, -Math.PI/7); // Rotate to match the angle
    mat4.scale(mMatrix, mMatrix, [0.005, 0.23, 1.0]); // Scale to make the string thin and long
  
    // Set color for the flag's support string
    const stringColor = [0.0980, 0.0863, 0.0863, 0.9]; // Black color
    drawSquare(stringColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
}

function drawBoatBase1() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Translate and scale for the boat's base position
    mat4.translate(mMatrix, mMatrix, [boatPosition1 - 0.1, 0.0, 0.0]); // Position the boat's base
    mat4.scale(mMatrix, mMatrix, [0.3, 0.09, 1.0]); // Scale to a wide, short rectangle
    
    // Set color for the boat's base
    const baseColor = [0.7, 0.7, 0.7, 1.0]; // Gray color
    drawSquare(baseColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
}

function drawLeftSail1() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Translate to the left side of the boat's base
    mat4.translate(mMatrix, mMatrix, [boatPosition1 + 0.05, 0.0, 0.0]); // Adjust position
    mat4.scale(mMatrix, mMatrix, [0.1, 0.09, 1.0]); // Scale to create the left sail
    mat4.rotateZ(mMatrix, mMatrix, Math.PI); 
    
    // Set color for the left sail
    const sailColor = [0.7, 0.7, 0.7, 1.0]; // Gray color
    drawTriangle(sailColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
}

function drawRightSail1() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Translate to the right side of the boat's base
    mat4.translate(mMatrix, mMatrix, [boatPosition1 - 0.25, 0.0, 0.0]); // Adjust position
    mat4.scale(mMatrix, mMatrix, [0.1, 0.09, 1.0]); // Scale to create the right sail
    mat4.rotateZ(mMatrix, mMatrix, Math.PI); // Rotate the triangle to mirror it
  
    // Set color for the right sail
    const sailColor = [0.7, 0.7, 0.7, 1.0]; // Gray color
    drawTriangle(sailColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
}

function drawFlag1() {
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Translate to the top of the boat's mast
    mat4.translate(mMatrix, mMatrix, [boatPosition1 - 0.05, 0.23, 0]); // Position flag at the top
    mat4.scale(mMatrix, mMatrix, [0.14, 0.15, 1.0]); // Scale to a small triangle
    mat4.rotateZ(mMatrix, mMatrix, Math.PI/6.7); // Rotate the flag
    
    // Set color for the flag
    const flagColor = [0.0, 0.0, 1.0, 1.0]; // Blue color
    drawTriangle(flagColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
  
    // Preserve current matrix state
    pushMatrix(matrixStack, mMatrix);
    
    // Apply transformations for the base
    mat4.translate(mMatrix, mMatrix, [boatPosition1 - 0.08, 0.17, 0]); // Center at the bottom
    mat4.scale(mMatrix, mMatrix, [0.01, 0.25, 1.0]);    // Scale to create a vertical rectangle (stem)
  
    // Set color for the base
    const baseColor = [0.0980, 0.0863, 0.0863, 0.9]; // Brown color
    drawSquare(baseColor, mMatrix);
    
    // Restore previous matrix state
    mMatrix = popMatrix(matrixStack);
}


function updateBoatAnimation() {
  // Update position based on direction
  boatPosition += boatSpeed * boatDirection;
  
  // Reverse direction if boundaries are hit
  if (boatPosition > boatRightLimit || boatPosition < boatLeftLimit) {
      boatDirection *= -1;
  }
}

function updateBoatPosition1() {
  boatPosition1 += boatSpeed1 * boatDirection1;

  if (boatPosition1 > maxBoatPosition1 || boatPosition1 < minBoatPosition1) {
      boatDirection1 *= -1; // Reverse direction
  }
}



////////////////////////////////////////////////////////////////////////
function drawScene() {
    // Set the viewport and clear the screen
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(1, 1, 1, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Initialize the model matrix to the identity matrix
    mat4.identity(mMatrix);
    
     animate();
   
}
  
function animate() {
    // Update rotation angles
    moonRotation += rotationSpeed; // Update moon rotation
    rayRotation += rotationSpeed;  // Update rays rotation
   
    updateBoatAnimation();
    updateBoatPosition1();
    updateBladeRotation1(); // Update the blade rotation angle
    updateBladeRotation2(); // Update the blade rotation angle
    

    // Clear the canvas and draw the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Draw the scene with updated transformations
    drawSKY();
    updateStarScale();
    drawStar1();
    drawStar2();
    drawStar3();
    drawStar4();
    drawStar5();

 
    // drawMountain();
    drawMountain1();
    mountainShadow1();
    drawMountain2();
    mountainShadow2();
    drawGround();
    DrawGreenPath();
    drawRiver();
   
    
    drawMoon();
    drawRays();
    drawClouds();
    DrawTrunk();
    drawTree();
    drawGreenary();
    DrawriverShine();
    drawHouse();
    drawCar();
    
    
   
   
    drawBoat1();
  
   
    
    drawBoat2();
    drawWindmill1();
    drawWindmill2();
    requestAnimationFrame(animate);
  }
  
  


// This is the entry point from the html
function webGLStart() {
  var canvas = document.getElementById("webgl-canvas");

    initGL(canvas);
    shaderProgram = initShaders();
  
    // Get locations of attributes declared in the vertex shader
    aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
    uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  
    // Enable the attribute arrays
    gl.enableVertexAttribArray(aPositionLocation);
    uColorLoc = gl.getUniformLocation(shaderProgram, "color");
  
    // Initialize buffers
    // Initialize buffers
initSquareBuffer();   // For rectangle
initTriangleBuffer(); // For triangle
initCircleBuffer();   // For circle
initSTriangleBuffer();

    drawScene(); // Draw the scene
   
  }
