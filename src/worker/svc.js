import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

const CACHE_NAME = 'garm-cache-v1';
const urlsToCache = [
  '/',
  '/main.css',
  '/main.js',
  '/offline.png',
];
const OFFLINE_TILE = './offline.png';
let offlineVersion = false;

const GEOMETRY_TYPES = ['Unknown', 'Point', 'LineString', 'Polygon'];

const rx = new RegExp('\/tile\/[a-z0-9\\-]+\/(?<z>\\d+)\/(?<x>\\d+)\/(?<y>\\d+)\\.pbf');

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME)
    .then(function (cache) {
      cache.addAll(urlsToCache);
    }));
});
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
self.addEventListener('fetch', event => {

    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(
                function(response) {
                    // Check if we received a valid response
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    

                    const responseToCache = response.clone();
                    const url = new URL(responseToCache.url);
                    if (rx.test(url.pathname)) {
                        return responseToCache.blob()
                        .then(blob => blob.arrayBuffer())
                        .then(buf => {
                            const m = rx.exec(url.pathname);
                            let x = parseInt (m.groups.x, 10);
                            let y = parseInt (m.groups.y, 10);
                            let z = parseInt (m.groups.z, 10);
                            
                            const pbf = new Protobuf(buf);
                            const {layers} = new VectorTile(pbf);
                            const fs = layers && Object.keys(layers).reduce((a, id) => {
                                const layer = layers[id];
                                let features = [];
                                for (let i = 0; i < layer.length; ++i) {
                                    const vf = layer.feature(i);
                                    features.push (vf.toGeoJSON(x, y, z));
                                }
                                a[id] = { type: 'FeatureCollection', features };
                                return a;
                            }, {});
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, new Response(JSON.stringify(fs), {headers: {'Content-Type': 'application/json'}}));
                            });
							return new Response(JSON.stringify(fs), {headers: {'Content-Type': 'application/json'}});
                        });
                    }
                    else {                        
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
							return response;
                       });
                    }
                }
            );
        })
    );
});