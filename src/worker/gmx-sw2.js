import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import earcut from 'earcut';
import WebGL from 'WebGL.js';

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


 const appendVertex = (coords, currentColor) => {
    var pixels = [];
    // var currentColor = [Math.random(), Math.random(), Math.random()]; //[0.1, 0.6, 0.1];
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

const offscreen = new OffscreenCanvas(256, 256);
const wgl = new WebGL(offscreen);

//
// Helper to fetch and store in cache.
//
function fetchAndCache(request) {
	if (/\/tile\//.test(request.url)) {
		return fetch(request)
			.then(response => response.blob())
			.then(blob => blob.arrayBuffer())
			.then(buf => {
				let arr = request.url.split('/');
				let y = arr.pop();
				let x = arr.pop();
				let z = arr.pop();				
				const sc = 256 / 4096;
				const {layers} = new VectorTile(new Protobuf(buf));
				var verts1 = [];
				let len = 0;
				Object.keys(layers).forEach(k => {
					const layer = layers[k];
					console.log('features:',layer.length,', x:', x,', y:', y,', z:', z);
					for (let i = 0; i < layer.length; ++i) {
						const vf = layer.feature(i);						
						const coordinates = vf.loadGeometry();
						const coords = coordinates.map(d => {
							return d.map(d1 => {
								return [d1.x * sc, d1.y * sc];
							});
						
						});
						const currentColor = [Math.random(), Math.random(), Math.random()]; //[0.1, 0.6, 0.1];
						let v1 = appendVertex(coords, currentColor);
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
				wgl.render(z, null, verts);
				return offscreen.convertToBlob();
			})
			.then(blob => {				
				caches.open(CACHE_NAME).then(function(cache) {
					let resp = new Response(blob);
					cache.put(request, resp);
					return resp;
				});				
				return new Response(blob);
		});
	} else {
		return fetch(request)
			.then(function (response) {
				return caches.open(CACHE_NAME).then(function(cache) {
					cache.put(request, response.clone());
					return response;
				});
		});
	}
}

//	http://prgssr.ru/development/sozdaem-service-worker.html
//	http://almet.github.io/kinto-geophotos/
