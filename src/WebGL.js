/*
  WebGL
  ** Requires **
*/

export default class WebGLRenderer {
	constructor(canvas) {
		this._canvas = canvas;		
		this._gl = this._canvas.getContext('webgl', { antialias: true });

		this._pixelsToWebGLMatrix = new Float32Array(16);
		this._mapMatrix = new Float32Array(16);

		// -- WebGl setup
		const vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
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

		this._gl.shaderSource(vertexShader, vshader);
		this._gl.compileShader(vertexShader);

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

		const fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
		this._gl.shaderSource(fragmentShader, fshader);
		this._gl.compileShader(fragmentShader);

		// link shaders to create our program
		this._program = this._gl.createProgram();
		this._gl.attachShader(this._program, vertexShader);
		this._gl.attachShader(this._program, fragmentShader);
		this._gl.linkProgram(this._program);
		this._gl.useProgram(this._program);

		this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
		this._gl.enable(this._gl.BLEND);
		this._gl.enable(this._gl.DEPTH_TEST);

		// ----------------------------
		// look up the locations for the inputs to our shaders.
		this._u_matLoc = this._gl.getUniformLocation(this._program, "u_matrix");
		this._gl.aPointSize = this._gl.getAttribLocation(this._program, "a_pointSize");
		// Set the matrix to some that makes 1 unit 1 pixel.

		this._width = this._canvas.width;
		this._height = this._canvas.height;

		this._pixelsToWebGLMatrix.set([2 / this._width, 0, 0, 0, 0, -2 / this._height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
		this._gl.viewport(0, 0, this._width, this._height);

		this._gl.uniformMatrix4fv(this._u_matLoc, false, this._pixelsToWebGLMatrix);		
	}
	render (zoom, bounds, verts) {		
	  // var verts = glHash.verts;		
		const vertBuffer = this._gl.createBuffer();
	
		const fsize = verts.BYTES_PER_ELEMENT;
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, verts, this._gl.STATIC_DRAW);
		// setVert(glHash);
		const vertLoc = this._gl.getAttribLocation(this._program, "a_vertex");
		this._gl.vertexAttribPointer(vertLoc, 2, this._gl.FLOAT, false, fsize * 5, 0);
		this._gl.enableVertexAttribArray(vertLoc);
	  // -- offset for color buffer
		const colorLoc = this._gl.getAttribLocation(this._program, "a_color");
		this._gl.vertexAttribPointer(colorLoc, 3, this._gl.FLOAT, false, fsize * 5, fsize * 2);
		this._gl.enableVertexAttribArray(colorLoc);
	
		// glLayer.redraw();
		this.drawingOnCanvas(zoom, bounds, verts.length / 5);
	  }
	 
	  drawingOnCanvas (zoom, bounds, numPoints) {				
		if (this._gl == null) {
			console.log('________');
			return;
		}
	
		
		this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    // this._gl.clearColor(1, 0.0, 0, 0.5);

		const pixelsToWebGLMatrix = new Float32Array(16);
		pixelsToWebGLMatrix.set([2 / this._width, 0, 0, 0, 0, -2 / this._height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
		// gl.viewport(0, 0, this._width, this._height);
	
		const pointSize = Math.max(zoom - 4.0, 1.0);
		// var pointSize = Math.max(leafletMap.getZoom() - 4.0, 1.0);
		this._gl.vertexAttrib1f(this._gl.aPointSize, pointSize);
	
		// -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
		const mapMatrix = new Float32Array(16);
		mapMatrix.set(pixelsToWebGLMatrix);
	
		// -- Scale to current zoom
		// var scale = Math.pow(2, leafletMap.getZoom());
		// var scale = Math.pow(2, zoom);
		// this.scaleMatrix(mapMatrix, scale, scale);
	
		// this.translateMatrix(mapMatrix, -bounds.min.x / scale, -bounds.min.y / scale);
			
		// gl.uniformMatrix4fv(u_matLoc, false, pixelsToWebGLMatrix);
		// -- attach matrix value to 'mapMatrix' uniform in shader
		this._gl.uniformMatrix4fv(this._u_matLoc, false, mapMatrix);
	  // var numPoints = verts.length / 5;
	  	this._gl.drawArrays(this._gl.TRIANGLES, 0, numPoints);
	  }		 
	
	  translateMatrix (matrix, tx, ty) {
		// translation is in last column of matrix
		matrix[12] += matrix[0] * tx + matrix[4] * ty;
		matrix[13] += matrix[1] * tx + matrix[5] * ty;
		matrix[14] += matrix[2] * tx + matrix[6] * ty;
		matrix[15] += matrix[3] * tx + matrix[7] * ty;
	  }

	  scaleMatrix (matrix, scaleX, scaleY) {
		// scaling x and y, which is just scaling first two columns of matrix
		matrix[0] *= scaleX;
		matrix[1] *= scaleX;
		matrix[2] *= scaleX;
		matrix[3] *= scaleX;
	
		matrix[4] *= scaleY;
		matrix[5] *= scaleY;
		matrix[6] *= scaleY;
		matrix[7] *= scaleY;
	  }
};