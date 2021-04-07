/*
  WebGL
  ** Requires **
*/

export default {
  canvas: null,
  gl: null,
  program: null,
  u_matLoc: null,
  pixelsToWebGLMatrix: null,
  mapMatrix: null,

  init: function (canvas) {
	this.canvas = canvas;
	var gl = this.gl = canvas.getContext('webgl', { antialias: true });

	var pixelsToWebGLMatrix = this.pixelsToWebGLMatrix = new Float32Array(16);
	var mapMatrix = this.mapMatrix = new Float32Array(16);

	// -- WebGl setup
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	const vshader = `
        uniform mat4 u_matrix;
        attribute vec4 a_vertex;
        attribute float a_pointSize;
        attribute vec4 a_color;
        varying vec4 v_color;

        void main() {
        // Set the size of the point
        gl_PointSize =  a_pointSize;

        // multiply each vertex by a matrix.
        gl_Position = u_matrix * a_vertex;


        // pass the color to the fragment shader
        v_color = a_color;
        }
	`;

	gl.shaderSource(vertexShader, vshader);
	gl.compileShader(vertexShader);

	const fshader = `
        precision mediump float;
        varying vec4 v_color;

        void main() {

        // -- squares
        // gl_FragColor = v_color;
        gl_FragColor = v_color;
        gl_FragColor.a = 0.8;
       // gl_FragColor = vec4(0.8, 0.1,0.1, 0.9); // v_color;

       
        }
	`;

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fshader);
	gl.compileShader(fragmentShader);

	// link shaders to create our program
	const program = this.program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);

	// ----------------------------
	// look up the locations for the inputs to our shaders.
	const u_matLoc = this.u_matLoc = gl.getUniformLocation(program, "u_matrix");
	gl.aPointSize = gl.getAttribLocation(program, "a_pointSize");
	// Set the matrix to some that makes 1 unit 1 pixel.

	pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.uniformMatrix4fv(u_matLoc, false, pixelsToWebGLMatrix);
	// var verts = new Float32Array([]);
	// return {
		// canvas,
		// gl,
		// u_matLoc,
		// mapMatrix,
		// pixelsToWebGLMatrix,
		// program,
		// verts
	// }
	return this;
  },
  redraw: function (zoom, bounds, rt, verts) {
	const gl = this.gl;
  // var verts = glHash.verts;
	const program = this.program;
	const vertBuffer = gl.createBuffer();

	const fsize = verts.BYTES_PER_ELEMENT;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	// setVert(glHash);
	const vertLoc = gl.getAttribLocation(program, "a_vertex");
	gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, fsize * 5, 0);
	gl.enableVertexAttribArray(vertLoc);
  // -- offset for color buffer
	const colorLoc = gl.getAttribLocation(program, "a_color");
	gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, fsize * 5, fsize * 2);
	gl.enableVertexAttribArray(colorLoc);

	// glLayer.redraw();
	this.drawingOnCanvas(zoom, bounds, verts.length / 5, rt);
  },
 
  drawingOnCanvas: function (zoom, bounds, numPoints, rt) {
	const canvas = this.canvas;
	const gl = this.gl;
    if (gl == null) {
		console.log('________');
		return;
	}

    if (rt === 0) {
		gl.clear(gl.COLOR_BUFFER_BIT);
		// console.log('__clear___', rt);
	}
	// gl.clearColor(1, 0, 0, 1);
	// gl.clear(gl.COLOR_BUFFER_BIT);

	const pixelsToWebGLMatrix = new Float32Array(16);
    pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    // gl.viewport(0, 0, canvas.width, canvas.height);

    const pointSize = Math.max(zoom - 4.0, 1.0);
    // var pointSize = Math.max(leafletMap.getZoom() - 4.0, 1.0);
    gl.vertexAttrib1f(gl.aPointSize, pointSize);

    // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
	const mapMatrix = new Float32Array(16);
    mapMatrix.set(pixelsToWebGLMatrix);

    // -- Scale to current zoom
    // var scale = Math.pow(2, leafletMap.getZoom());
    var scale = Math.pow(2, zoom);
    this.scaleMatrix(mapMatrix, scale, scale);

    this.translateMatrix(mapMatrix, -bounds.min.x / scale, -bounds.min.y / scale);

	var u_matLoc = gl.getUniformLocation(this.program, "u_matrix");
	// gl.uniformMatrix4fv(u_matLoc, false, pixelsToWebGLMatrix);
    // -- attach matrix value to 'mapMatrix' uniform in shader
    gl.uniformMatrix4fv(u_matLoc, false, mapMatrix);
  // var numPoints = verts.length / 5;
    gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  },

  drawTriangles: function (verts) {
	const program = this.program;
	const gl = this.gl;
	// gl.clearColor(1, 0, 0, 1);
	// gl.clear(gl.COLOR_BUFFER_BIT);
	var numPoints = verts.length / 5;
    var buf = this.createStreamArrayBuffer(gl, verts);
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var fsize = verts.BYTES_PER_ELEMENT;
	var colorLoc = gl.getAttribLocation(program, "a_color");
	gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, fsize * 5, fsize * 2);
	gl.enableVertexAttribArray(colorLoc);


	// gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    // gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW);
    // gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW);

	var vertLoc = gl.getAttribLocation(program, "a_vertex");
	gl.enableVertexAttribArray(vertLoc);
	gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, fsize * 5, 0);

    // triangleProgram.aVertexPosition = gl.getAttribLocation(triangleProgram, 'a_vertex');
    // gl.enableVertexAttribArray(triangleProgram.aVertexPosition);
    // gl.vertexAttribPointer(triangleProgram.aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);

    // this is the problem, every triangle drawn requires a draw call, is there a way to only call this once per frame instead of once per triangle? Is there a way to send a big array of all the triangle vertices and the unique colors to the triangleProgram?
    gl.drawArrays(gl.TRIANGLES, 0, numPoints);
    // gl.drawArrays(gl.LINE_STRIP, 0, numPoints);
	
	gl.disableVertexAttribArray(vertLoc);
	gl.disableVertexAttribArray(colorLoc);

  },
  createStreamArrayBuffer: function (verts) {
	const gl = this.gl;
	var vertBuffer = gl.createBuffer();
	var vertArray = verts;
	// var fsize = vertArray.BYTES_PER_ELEMENT;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vertBuffer;
  },

  translateMatrix: function (matrix, tx, ty) {
    // translation is in last column of matrix
    matrix[12] += matrix[0] * tx + matrix[4] * ty;
    matrix[13] += matrix[1] * tx + matrix[5] * ty;
    matrix[14] += matrix[2] * tx + matrix[6] * ty;
    matrix[15] += matrix[3] * tx + matrix[7] * ty;
  },
  scaleMatrix: function (matrix, scaleX, scaleY) {
    // scaling x and y, which is just scaling first two columns of matrix
    matrix[0] *= scaleX;
    matrix[1] *= scaleX;
    matrix[2] *= scaleX;
    matrix[3] *= scaleX;

    matrix[4] *= scaleY;
    matrix[5] *= scaleY;
    matrix[6] *= scaleY;
    matrix[7] *= scaleY;
  },
};
