import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import earcut from 'earcut';

var CACHE_NAME = 'Geomixer';
var OFFLINE_TILE = './offline.png';
var offlineVersion = false;

console.log("SW startup");

self.addEventListener('install', function(event) {
	
  caches.delete(CACHE_NAME);
  
  // Store the «offline tile» on startup.
  return fetchAndCache(OFFLINE_TILE)
    .then(function () {
      console.log("SW installed");
    });
});

self.addEventListener('activate', function(event) {
	console.log("SW activated!");
    event.waitUntil(clients.claim());
});

self.addEventListener('message', function(event) {
  var data = event.data;
  if ('offlineVersion' in data) {
	offlineVersion = data.offlineVersion;
  }
  console.log("SW message", data);
});


//
// Intercept download of map tiles: read from cache or download.
//
self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (/\b\.png\b/.test(request.url) || /\/tile\//.test(request.url)) {
    var cached = caches.match(request)
      .then(function (r) {
        if (r) {
          // console.log('Cache hit', r);
          return r;
        }
        // console.log('Cache missed', request);
        // return fetchAndCache(request);
        return offlineVersion ? null : fetchAndCache(request);
      })
      // Fallback to offline tile if never cached.
      .catch(function(e) {
        console.log('Fetch failed', e);
        return fetch(OFFLINE_TILE);
      });
    event.respondWith(cached);
  }
});


 const appendVertex = (coords) => {
    var pixels = [];
    var currentColor = [Math.random(), Math.random(), Math.random()]; //[0.1, 0.6, 0.1];
    // var currentColor = [0, 0, 1]; //[0.1, 0.6, 0.1];
    var flattened = earcut.flatten(coords);
    var result = earcut(flattened.vertices, flattened.holes, flattened.dimensions);
    var triangles = [];
    var dim = 2;
    for (var i = 0; i < result.length; i++) {
      var index = result[i];
      triangles.push(flattened.vertices[index * dim], flattened.vertices[index * dim + 1]);
    }

	// var verts = new Float32Array(5 * triangles.length / 2);
	var verts = [];

    for (var i = 0, n = 0; i < triangles.length; n += 5) {
      if (triangles[i + 1]) {
        // verts.set([triangles[i++], triangles[i++], currentColor[0], currentColor[1], currentColor[2]], n);
        verts.push(triangles[i++], triangles[i++], currentColor[0], currentColor[1], currentColor[2]);
      }
    }
	return verts;
}

//
// Helper to fetch and store in cache.
//
function fetchAndCache(request) {
	/**/
	if (/\/tile\//.test(request.url)) {
		return fetch(request)
			.then(response => response.blob())
			.then(blob => blob.arrayBuffer())
			.then(buf => {
				let arr = request.url.split('/');
				let y = arr.pop(); let x = arr.pop(); let z = arr.pop();
				let tm = Date.now();
				const tw = 1 << (8 - z);
				let x0 = x * tw - 0;
				if (x0 + tw < 0) {
					x0 += Math.pow(2, z) * tw;
				}
				const y0 = y * tw - 0;
				let sc;
				const {layers} = new VectorTile(new Protobuf(buf));
				var verts1 = [];
				let len = 0;
				Object.keys(layers).forEach(k => {
					const layer = layers[k];
					if (!sc) {
						sc = tw / layer.extent
					}
					for (let i = 0; i < layer.length; ++i) {
						const vf = layer.feature(i);							
						const properties = vf.properties;
						const coordinates = vf.loadGeometry();
						const coords = coordinates.map(d => {
							return d.map(d1 => {
								return [x0 + d1.x * sc, y0 + d1.y * sc];
							});
						
						});
						let v1 = appendVertex(coords);
						len += v1.length;
						verts1.push(v1);
					}
				});
				var verts = new Float32Array(len);
				let cnt = 0;
				verts1.forEach(it => {
					verts.set(it, cnt);
					cnt += it.length;
				});
				// response._verts = verts;
				return verts;
			})
			.then(function (verts) {
				// var myArray = new ArrayBuffer(512);
				// var longInt8View = new Float32Array(myArray);

				let str = verts.buffer;
				// let str = JSON.stringify(verts);
				caches.open(CACHE_NAME).then(function(cache) {
					  // console.log('Store in cache', response);
					// client.postMessage(
						// JSON.stringify({
						  // type: response.url,
						  // data: jsonResponse.data
						// })
					// );
					let resp = new Response(str);
					cache.put(request, resp);
					// return cache.put(request, verts);
					// return cache.addAll(verts);
					// cache.put(request, response);
					return resp;
				});
				return new Response(str);
		});
	} else {
		return fetch(request)
			.then(function (response) {
				return caches.open(CACHE_NAME).then(function(cache) {
					  // console.log('Store in cache', response);
					  /*
					if (/\/tile\//.test(request.url)) {
						response.blob().then(blob => blob.arrayBuffer()).then(buf => {
							// let buf = blob.arrayBuffer();
							let arr = request.url.split('/');
							let y = arr.pop(); let x = arr.pop(); let z = arr.pop();
							let tm = Date.now();
							const tw = 1 << (8 - z);
							let x0 = x * tw - 0;
							if (x0 + tw < 0) {
								x0 += Math.pow(2, z) * tw;
							}
							const y0 = y * tw - 0;
							let sc;
							const {layers} = new VectorTile(new Protobuf(buf));
							var verts = [];
							Object.keys(layers).forEach(k => {
								const layer = layers[k];
								if (!sc) {
									sc = tw / layer.extent
								}
								for (let i = 0; i < layer.length; ++i) {
									const vf = layer.feature(i);							
									const properties = vf.properties;
									const coordinates = vf.loadGeometry();
									const coords = coordinates.map(d => {
										return d.map(d1 => {
											return [x0 + d1.x * sc, y0 + d1.y * sc];
										});
									
									});
									verts.push(appendVertex(coords));
								}
							});
							// response._verts = verts;
						});
					}*/
					cache.put(request, response.clone());
					return response;
				});
		});
	}
}

//	http://prgssr.ru/development/sozdaem-service-worker.html
//	http://almet.github.io/kinto-geophotos/
