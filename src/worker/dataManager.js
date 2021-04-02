import Renderer from './renderer.js';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import earcut from 'earcut';

let canvas;
let abortController;
let visibleLayers = {};
let cwidth, cheight;
let renderNum = 0;
let moveendNum = 0;

async function getBoxTiles(signal, bbox) {
	const [xmin, ymin, xmax, ymax] = bbox;
	const response = await fetch('/box', {
		signal,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			xmin, ymin,
			xmax, ymax,
			layers: Object.keys(visibleLayers),
		}),
	});
	return response.json();
}

function getTilePromise (layerId, z, x, y) {
	return fetch(`/tile/${layerId}/${z}/${x}/${y}`)
	.then(res => res.blob())
	.then(blob => blob.arrayBuffer())
	.then(buf => {				
		const layerData = visibleLayers[layerId];
		const t = {x, y, z, layers: {}, extent: 0};
		const pathRes = new Path2D();
		const {layers} = new VectorTile(new Protobuf(buf));								
		Object.keys(layers).forEach(k => {
			const layer = layers[k];
			const path = new Path2D();
			if (t.extent !== layer.extent) {
				// console.log('t.extent = layer.extent:', t.extent, layer.extent);
				t.extent = layer.extent;
			}
			t.layers[k] = { features: [], x, y, z, extent: layer.extent, layerId, path };
			for (let i = 0; i < layer.length; ++i) {
				const vf = layer.feature(i);							
				const properties = vf.properties;
				const coordinates = vf.loadGeometry();
				if (layerData.webGL) {
					const tw = 1 << (8 - z);
					let x0 = x * tw - 0;
					if (x0 + tw < 0) {
						x0 += Math.pow(2, z) * tw;
					}
					const y0 = y * tw - 0;
					const sc = tw / t.extent;

					const coords = coordinates.map(d => {
						return d.map(d1 => {
							return [x0 + d1.x * sc, y0 + d1.y * sc];
						});
					
					});
					appendVertex(layerData.glHash, coords);
					// const verts = layerData.glHash.verts;
					// const data = earcut.flatten(coords);
					// const triangles = earcut(data.vertices, data.holes, data.dimensions);
    // var currentColor = [Math.random(), Math.random(), Math.random()]; //[0.1, 0.6, 0.1];
					// verts.push(pixel.x, pixel.y, currentColor[0], currentColor[1], currentColor[2]);

	  // console.log('triangles', triangles, layerData.glHash);
					// t.layers[k].features.push({type: vf.type, properties, coordinates});
				} else {
				
    // for (var i = 0; i < data.length; i++) {
        // for (var j = 0; j < data[i].length; j++) {
            // for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        // }
// var triangles = earcut([10,0, 0,50, 60,60, 70,10]);

	  
					const path1 = new Path2D();
					coordinates[0].forEach((p, i) => {
						if (i) {
							path1.lineTo(p.x, p.y);
						}
						else {
							if (vf.type === 1) {
								path1.arc(p.x, p.y, 5, 0, 2 * Math.PI);
							} else {
								path1.moveTo(p.x, p.y);
							}
						}
					});
					// path1.closePath();
					path.addPath(path1);
					t.layers[k].features.push({type: vf.type, properties, coordinates, path: path1});
				}
			}					
		});				
		return t;
	});

}

async function getTiles (zoom, bbox, bounds) {	
	moveendNum++;
	if (abortController) {
		abortController.abort();
	}
	abortController = new AbortController();	
	const layersArr = await getBoxTiles(abortController.signal, bbox);
	layersArr.forEach(layerItem => {
// layerItem.tiles.length = 1;
		const {layerId, tiles} = layerItem;
		if (!layerId) {
			return;
		}
		const layerData = visibleLayers[layerId];
		const canvas = layerData.canvas;
		if (layerData.webGL && !layerData.glHash) {
			layerData.glHash = initWebGL(canvas);
		}

		const promises = layerData.promises || {};
		tiles.forEach(({z, x, y}) => {		
			const tKey = `${x}:${y}:${z}`;
			if (!promises[tKey]) {
				promises[tKey] = getTilePromise(layerId, z, x, y);
			}
		});
		layerData.promises = promises;
		let tm = Date.now();
		let cnt = 0;
		let ctx;
		if (!layerData.webGL) {
			ctx = canvas.getContext("2d");
			ctx.resetTransform();
			ctx.clearRect(0, 0, cwidth, cheight);
			ctx.strokeStyle = 'blue';
			ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
		}

		// Promise.all(Object.values(promises))
			// promise.then(tiles => {		
				// tiles.forEach(tile => {
		Object.values(promises).forEach(promise => {
			promise.then(tile => {		
				// if (renderNum === moveendNum) {
					const {layers, x, y, z, extent, path1} = tile;
					const tw = 1 << (8 + zoom - z);
					let x0 = x * tw - bounds.min.x;
					if (x0 + tw < 0) {
						x0 += Math.pow(2, z) * tw;
					}
					const y0 = y * tw - bounds.min.y;
					const sc = tw / extent;				
					if (layerData.webGL) {
						Object.keys(layers).forEach(k => {
							const {features} = layers[k];
							features.forEach(feature => {
								// Renderer.renderPath(ctx, feature);
					// console.log('feature:', feature);
								cnt++;
							});
						});
redraw(layerData.glHash, zoom, bounds);
					} else {
						ctx.resetTransform();
						ctx.transform(sc, 0, 0, sc, x0, y0);
						ctx.lineWidth = 1 / sc;
						Object.keys(layers).forEach(k => {
							const {features} = layers[k];
							features.forEach(feature => {
								Renderer.renderPath(ctx, feature);
								cnt++;
							});
						});
					}
					// });		
					// console.log('tile tm:', x, y, z, Date.now() - tm);
					// bitmapToMain(layerId, canvas);
					// console.log('tm:', Date.now() - tm);
				// } else {
					// console.log('----- отмена rendering:', renderNum, moveendNum, layerId, x, y, z);
				// }
				
			})
			.catch(() => {});
		});
		renderNum++;
		// console.log('layer tm:', renderNum, cnt, Date.now() - tm);
		bitmapToMain(layerId, canvas);
	});
}

const getItemsByPoint = (layerData, p, zoom) => {
	if (!canvas || canvas.width !== cwidth || canvas.height !== cheight) {
		canvas = new OffscreenCanvas(cwidth, cheight);
	}
	const ctx = canvas.getContext("2d");
	const promises = Object.values(layerData.promises) || [];
	return Promise.all(promises)
	.then(tiles => {		
		let items = [];
		let tm = Date.now();
		tiles.forEach(it => {
			const {layers, x, y, z, extent} = it;
			const tw = 1 << (8 + zoom - z);
			const y0 = y * tw;
			if (p.y < y0 || p.y > y0 + tw) {
				return;
			}
			let x0 = x * tw;
			if (p.x < x0 || p.x > x0 + tw) {
				return;
			}

			const sc = tw / extent;
			const xx = (p.x - x0) / sc;
			const yy = (p.y - y0) / sc;
			Object.keys(layers).forEach(k => {
				const {features} = layers[k];
				features.forEach(feature => {
					if (feature.path) {
						if (feature.type === 3 || feature.type === 2) {
							if (ctx.isPointInPath(feature.path, xx, yy)) {
								items.push(feature.properties);
							}
						}
					}
				});
			});
		});
		return items.length ? items : null;
	});
}

const chkEvent = ev => {
	switch(ev.type) {
		case 'mousemove':
			let items;
			const point = ev.containerPoint;
			for (let layerId in visibleLayers) {
				const layerData = visibleLayers[layerId];
				const canvas = layerData.canvas;

				const ctx = canvas.getContext('2d');
				const p = ctx.getImageData(point.x, point.y, 1, 1).data;
				if (p[3]) {
					getItemsByPoint(layerData, ev.mapMousePos, ev.zoom).then(items => {
						self.postMessage({
							cmd: 'mouseover',
							layerId,
							items
						});
					});
				} else {
					self.postMessage({
						cmd: 'mouseover',
						layerId
					});
				}
			}
			break;
		default:
			console.warn('Warning: Bad event ', ev);
			break;
	}
}

const bitmapToMain = (layerId, canvas) => {
	// var imageData = canvas.transferToImageBitmap();
	// self.postMessage({
		// cmd: 'rendered',
		// layerId,
		// bitmap: imageData
	// }, [ imageData ]);
	self.postMessage({
		cmd: 'rendered',
		layerId
	});
};

addEventListener('tilesLoaded', getTiles);

const initWebGL = (canvas) => {
	var gl = canvas.getContext('webgl', { antialias: true });

	var pixelsToWebGLMatrix = new Float32Array(16);
	var mapMatrix = new Float32Array(16);

	// -- WebGl setup
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var vshader = `
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
  var fshader = `
        precision mediump float;
        varying vec4 v_color;

        void main() {

        // -- squares
        gl_FragColor = v_color;
        gl_FragColor.a = 0.8;
     //   gl_FragColor =vec4(0.8, 0.1,0.1, 0.9); // v_color;

       
        }
	`;

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fshader);
	gl.compileShader(fragmentShader);

	// link shaders to create our program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);



	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	//  gl.disable(gl.DEPTH_TEST);
	// ----------------------------
	// look up the locations for the inputs to our shaders.
	var u_matLoc = gl.getUniformLocation(program, "u_matrix");
	gl.aPointSize = gl.getAttribLocation(program, "a_pointSize");
	// Set the matrix to some that makes 1 unit 1 pixel.

	pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.uniformMatrix4fv(u_matLoc, false, pixelsToWebGLMatrix);
	var verts = [];
	return {
		canvas,
		gl,
		u_matLoc,
		mapMatrix,
		pixelsToWebGLMatrix,
		program,
		verts
	}
}

 const appendVertex = (glHash, coords) => {
 // -- data

  var verts = glHash.verts || [];
  // var rawVerts = [];
  //-- verts only

  var start = new Date();

  // for (var f = 0; f < data.features.length ; f++) {
    // rawVerts = [];
    // var feature = data.features[f];
    var pixels = [];
    var currentColor = [Math.random(), Math.random(), Math.random()]; //[0.1, 0.6, 0.1];
    // var currentColor = [0, 0, 1]; //[0.1, 0.6, 0.1];
    var flattened = earcut.flatten(coords);
    var result = earcut(flattened.vertices, flattened.holes, flattened.dimensions);
    var triangles = [];
    // var dim = coords[0][0].length;
    var dim = 2;
    for (var i = 0; i < result.length; i++) {
      var index = result[i];
      triangles.push(flattened.vertices[index * dim], flattened.vertices[index * dim + 1]);
    }

    for (var i = 0; i < triangles.length;) {
      if (triangles[i + 1]) {
        // var pixel = LatLongToPixelXY(triangles[i++], triangles[i++]);
        // pixels.push(pixel);
        // verts.push(pixel.x, pixel.y, currentColor[0], currentColor[1], currentColor[2]);
        verts.push(triangles[i++], triangles[i++], currentColor[0], currentColor[1], currentColor[2]);
      }
    }

    // console.log(pixels);

  // }


  // console.log("updated at  " + new Date().setTime(new Date().getTime() - start.getTime()) + " ms ");
}

 const redraw = (glHash, zoom, bounds) => {
  // tirangles or point count
  var gl = glHash.gl;
  var verts = glHash.verts;
  var program = glHash.program;
  var numPoints = verts.length / 5;
  // console.log("num points:   " + numPoints);
  var vertBuffer = gl.createBuffer();
  var vertArray = new Float32Array(verts);
  var fsize = vertArray.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);
  var vertLoc = gl.getAttribLocation(program, "a_vertex");
  gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, fsize * 5, 0);
  gl.enableVertexAttribArray(vertLoc);
  // -- offset for color buffer
  var colorLoc = gl.getAttribLocation(program, "a_color");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, fsize * 5, fsize * 2);
  gl.enableVertexAttribArray(colorLoc);

  // glLayer.redraw();
  drawingOnCanvas(glHash, zoom, bounds);
}

 const drawingOnCanvas = (glHash, zoom, bounds) => {
  var canvas = glHash.canvas;
  var verts = glHash.verts;
  var u_matLoc = glHash.u_matLoc;
  var gl = glHash.gl;
  var pixelsToWebGLMatrix = glHash.pixelsToWebGLMatrix;
  var mapMatrix = glHash.mapMatrix;
    if (gl == null) return;

    gl.clear(gl.COLOR_BUFFER_BIT);


    pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    gl.viewport(0, 0, canvas.width, canvas.height);



    var pointSize = Math.max(zoom - 4.0, 1.0);
    // var pointSize = Math.max(leafletMap.getZoom() - 4.0, 1.0);
    gl.vertexAttrib1f(gl.aPointSize, pointSize);

    // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
    mapMatrix.set(pixelsToWebGLMatrix);

    // var bounds = leafletMap.getBounds();
    // var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());
    // var offset = LatLongToPixelXY(topLeft.lat, topLeft.lng);

    // -- Scale to current zoom
    // var scale = Math.pow(2, leafletMap.getZoom());
    var scale = Math.pow(2, zoom);
    scaleMatrix(mapMatrix, scale, scale);

    translateMatrix(mapMatrix, -bounds.min.x / scale, -bounds.min.y / scale);
    // translateMatrix(mapMatrix, -offset.x, -offset.y);

    // -- attach matrix value to 'mapMatrix' uniform in shader
    gl.uniformMatrix4fv(u_matLoc, false, mapMatrix);
  var numPoints = verts.length / 5;
    gl.drawArrays(gl.TRIANGLES, 0, numPoints);
}

 const translateMatrix = (matrix, tx, ty) => {
    // translation is in last column of matrix
    matrix[12] += matrix[0] * tx + matrix[4] * ty;
    matrix[13] += matrix[1] * tx + matrix[5] * ty;
    matrix[14] += matrix[2] * tx + matrix[6] * ty;
    matrix[15] += matrix[3] * tx + matrix[7] * ty;
  }

 const scaleMatrix = (matrix, scaleX, scaleY) => {
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

 const flattenData = (data) => {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        result.vertices.push(data[i][j][1]);
        result.vertices.push(data[i][j][0]);
        // for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
      }
      if (i > 0) {
        holeIndex += data[i - 1].length;
        result.holes.push(holeIndex);
      }
    }

    return result;
  }

onmessage = function(evt) {    
	const data = evt.data || {};
	const {cmd, layerId, zoom, bbox, bounds, width, height, canvas, webGL} = data;
			// console.warn(' command ', data);
	switch(cmd) {
		case 'addLayer':
			visibleLayers[layerId] = {
				canvas
			};
			visibleLayers[layerId].webGL = webGL;
			getTiles(zoom, bbox, bounds);
			break;
		case 'removeLayer':
			delete visibleLayers[layerId];
			if (Object.keys(visibleLayers).length) {
				getTiles(zoom, bbox, bounds);
			}
			break;
		case 'drawScreen':
			cwidth = width;
			cheight = height;
			getTiles(zoom, bbox, bounds);
			break;
		case 'moveend':
			// getTiles(zoom, bbox, bounds);
			break;
		case 'eventCheck':
			// chkEvent(data);
			break;
		default:
			console.warn('Warning: Bad command ', data);
			break;
	}
};
