

var gl;
var canvas;
var animation;

var center = [
[ -0.65, 0.2, -1.0 ],
[ 0, 1.2, 1 ],
[ 0.6, 0.8, 1.5 ],
[ 1.07, -0.8, 0 ],
[ 0.09, -1.1, 1 ],
[0.6,0.15,2],
[-0.8,1,0.1],
];
var radius = [
    0.8,
0.44,
0.35,
0.7,
0.45,
0.25,
0.6,
];
var color = [
  
  [1,0.2,0.9],//1
    [0,0,1], //3
    [0.28, 0.45, 0.83]
    ,  // 4
    [0.41, 0.84, 0.43], // 6
    [0,1,0], //7
    [1, 1, 0] , // 5
   
[0.451, 0.176, 0.722], // 2
]
var spec = [
    30,
    30,
    30,
    30,
    30,
    30,
    30,
]

// specify camera/eye coordinate system parameters
var eyePos = [-0.2, -0.2, .0];
var COI = [0.0, 0.0, 0.0];
var viewUp = [0, 0, 1];

var lightpos = [0.5,4,5];

var bounces = 1;
var shd = 0;

var lslider = document.getElementById("lightpos");
// var bslider = document.getElementById("bounce");



lslider.oninput = function() {
  lightpos[0] = -this.value;
}
// bslider.oninput = function() {
//     bounces = this.value;
// }

function phong(){
    shd = 0;
    bounces = 1;
}
function phRef(){
    shd = 0;
    bounces = 2;
}
function phShd(){
    shd = 1;
    bounces = 1;
}
function ssall(){
    shd = 1;
    bounces = 2;
}

// Vertex shader code, per fragment shading
const vscfrag = `#version 300 es
in vec2 aPosition;

void main() {

  gl_Position = vec4(aPosition,0.0,1.0);
  gl_PointSize=5.0;
}`;

// Fragment shader code, per fragment shading
const fscfrag = `#version 300 es
precision mediump float;

struct Ray {
	vec3 origin;
	vec3 direction;
};

struct Sphere {
	vec3     center;
	float    radius;
	float spec;
  vec3 color;
};

struct HitInfo {
	float    t;
	vec3     normal;
  vec3 pos;
  float spec;
  vec3 color;
};
uniform vec4 objColor;
uniform vec3 lightpos;
uniform Sphere spheres[7];

uniform int bounceLimit;
uniform int shd;

out vec4 fragColor;

vec3 phongColor(float spec, vec3 color,
            vec3 posi, vec3 normal,
            vec3 viewDir)
{

  vec3 amb = 0.7*vec3(color);

  vec3 lightdr = normalize(lightpos-posi);
//   vec3 color = vec3(color);

  vec3 diff = 1.5*max(0.0,dot(lightdr,normal))*color;

  vec3 R = normalize(-reflect(lightdr,normal));
  vec3 V = normalize(viewDir);

  vec3 speC = 2.0*vec3(1.0,1.0,1.0)*pow(max(0.0,dot(R,V)),spec);

  vec3 col = amb + diff + speC;
  return col;
}
HitInfo IntersectRay(Ray ray, Sphere sphere) {
  HitInfo hit;
  vec3 oc = ray.origin - sphere.center;
  float a = dot(ray.direction, ray.direction);
  float b = 2.0 * dot(oc, ray.direction);
  float c = dot(oc, oc) - (sphere.radius * sphere.radius);
  float discriminant = b * b - 4.0 * a * c;
  
  if (discriminant > 0.0) {
    float sqrtDiscriminant = sqrt(discriminant);
    float t1 = (-b - sqrtDiscriminant) / (2.0 * a);
    float t2 = (-b + sqrtDiscriminant) / (2.0 * a);
    float t = (t1 < t2) ? t1 : t2;

    if (t > 0.0) {
      hit.t = t;
      hit.pos = ray.origin + t * ray.direction;
      hit.normal = normalize(hit.pos - sphere.center);
      hit.spec = sphere.spec;
      hit.color = sphere.color;
      return hit;
    }
  }
  
  hit.t = 0.0;
  return hit;
}



bool shadow_pres(vec3 pos){
  Ray temp_ray;
  temp_ray.direction = normalize(pos-lightpos);
  temp_ray.origin = lightpos;

  float t_initial = length(pos-lightpos);
  for ( int i=0; i<7; ++i ) {
    HitInfo temp = IntersectRay(temp_ray, spheres[i]);
    if(temp.t != 0.0 && t_initial - temp.t > 0.1 ){
      return true;
    }
  }
  return false;
}

vec3 bounce_now(Ray input_ray){

  vec3 finalColor = vec3(0.0,0.0,0.0);

  for ( int i=0; i<bounceLimit; ++i ) {
    HitInfo hit;
    hit.t = 0.0;

    for ( int i=0; i<7; ++i ) {
      HitInfo temp = IntersectRay(input_ray, spheres[i]);
      if(hit.t == 0.0 || (temp.t >0.0 && temp.t < hit.t)){
        hit = temp;
      }
    }

    if (hit.t == 0.0){
      break;
    }

    finalColor += 0.4*phongColor(hit.spec,hit.color, hit.pos, hit.normal, -input_ray.direction);
    finalColor/=1.4;

    if(i==0 && shd!=0 && shadow_pres(hit.pos)){
      finalColor *= 0.7;
    }

    input_ray.direction = normalize(reflect(input_ray.direction, hit.normal));
    input_ray.origin = hit.pos;
	}

  return finalColor;

}

void main() {
  Ray ray;
  // create the ray for current frag
  ray.origin = vec3(0.0,0.0,3.2);

  // direction is through each screen fragment in negative z direction
  vec2 screenPos = gl_FragCoord.xy/vec2(500, 500);
  ray.direction = normalize(vec3(screenPos * 2.0 - 1.0, -1.0));

  vec3 fCol = bounce_now(ray);

  fragColor = vec4(fCol, 1.0);

}
`;


// Set up the projection matrix
const aspect = gl.viewportWidth / gl.viewportHeight;
const fieldOfView = degToRad(45);
const zNear = 0.1;
const zFar = 100.0;
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
gl.uniformMatrix4fv(gl.getUniformLocation(frag_shader, 'projectionMatrix'), false, projectionMatrix);

function fragmentShaderSetup(fragShaderCode) {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function vertexShaderSetup(vertexShaderCode) {
    shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, vertexShaderCode);
    gl.compileShader(shader);
    // Error check whether the shader is compiled correctly
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
}



function initShaders(vsc, fsc) {
    shaderProgram = gl.createProgram();

    var vertexShader = vertexShaderSetup(vsc);
    var fragmentShader = fragmentShaderSetup(fsc);

    // attach the shaders
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    //link the shader program
    gl.linkProgram(shaderProgram);

    // check for compilation and linking status
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log(gl.getShaderInfoLog(vertexShader));
      console.log(gl.getShaderInfoLog(fragmentShader));
    }

    //finally use the program.


    return shaderProgram;
}

function initGL(canvas) {
  

  
    try {
      gl = canvas.getContext("webgl2"); 
      gl.viewportWidth = canvas.width; 
      gl.viewportHeight = canvas.height; 
    } catch (e) {}
    if (!gl) {
      alert("WebGL initialization failed");
    }
    mode = gl.TRIANGLES;
}

function degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}

function initSquareBuffer() {
  // buffer for point locations
  const sqVertices = new Float32Array([1,1,-1,1,-1,-1,1,-1]);
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

function drawSquare(color) {

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    sqVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);

  gl.uniform3fv(uColorLocation, color);

  // now draw the square
  gl.drawElements(
    mode,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  );
}
//////////////////////////////////////////////////////////////////////

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  
  if (animation) {
    window.cancelAnimationFrame(animation);
  }

  var animate = function () {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setuniform(frag_shader);

    drawSquare([0.0, 0.0, 0.0]);

    animation = window.requestAnimationFrame(animate);
  }

  animate();
  }

function setuniform(shaderProgram){
    gl.useProgram(shaderProgram);
    // gl.enable(gl.DEPTH_TEST);
    //get locations of attributes and uniforms declared in the shader
    aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");

    uColorLocation = gl.getUniformLocation(shaderProgram, "objColor");
    uLightPosLoc = gl.getUniformLocation(shaderProgram,"lightpos");
    ubounceLoc = gl.getUniformLocation(shaderProgram,"bounceLimit");
    ushdLoc = gl.getUniformLocation(shaderProgram,"shd");


    //enable the attribute arrays
    gl.enableVertexAttribArray(aPositionLocation);


    gl.uniform3fv(uLightPosLoc, lightpos);
    gl.uniform1i(ubounceLoc, bounces);
    gl.uniform1i(ushdLoc, shd);

}

function init_sph(){

  for ( var i=0; i<7; i++ ) {
    gl.uniform3fv( gl.getUniformLocation( frag_shader, 'spheres['+i+'].center' ), center[i] );
    gl.uniform1f ( gl.getUniformLocation( frag_shader, 'spheres['+i+'].radius' ), radius[i] );
    gl.uniform1f ( gl.getUniformLocation( frag_shader, 'spheres['+i+'].spec' ), spec[i] );
    gl.uniform3fv( gl.getUniformLocation( frag_shader, 'spheres['+i+'].color' ), color[i] );
  }
}

 
  function webGLStart() {
    canvas = document.getElementById("assignment5");

    
    initGL(canvas);


    frag_shader = initShaders(vscfrag, fscfrag);
    gl.useProgram(frag_shader);

    init_sph();

    
    initSquareBuffer();
    drawScene();
  }
