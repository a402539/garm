function appendVertex (coords, currentColor) {
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

// vector - GeoJSON presentation of a VectorTile
function render(x, y, z, vector) {
    const sc = 256 / 4096;    
    const {layers} = vector;
    let verts1 = [];
    let len = 0;
    Object.keys(layers).forEach(k => {
        const layer = layers[k];        
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
    let verts = new Float32Array(len);
    let cnt = 0;
    verts1.forEach(it => {
        verts.set(it, cnt);
        cnt += it.length;
    });				
    wgl.render(z, null, verts);
    return offscreen.convertToBlob();
}

onmessage = e => {
    const {cmd, x, y, z, buf} = e.data;
    switch(cmd) {
        case 'render':
            break;
        default:
            break;
    }
};