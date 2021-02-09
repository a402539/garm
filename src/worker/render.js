self.onmessage = function(evt) {
    const {data: {coords, canvas}} = evt;        
    // const gl = canvas.getContext("webgl");
    const {x, y, z} = coords;
    const tileKey = [x,y,z].join(':');
    const ctx = canvas.getContext("2d");
    function render() {
        // ... some drawing using the gl context ...
        //requestAnimationFrame(render);
        ctx.beginPath();
        ctx.rect(0, 0, 255, 255);
        ctx.moveTo(0, 0);
        ctx.lineTo(255, 255);
        ctx.moveTo(255, 0);
        ctx.lineTo(0, 255);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.arc(128, 128, 128, 0, Math.PI * 2, false);
        // ctx.stroke();        
        ctx.font = '25px serif';
        let textMetrics = ctx.measureText(tileKey);

        ctx.fillText(tileKey, 128 - textMetrics.width / 2, 100);
        ctx.stroke();

        // console.log('render', tileKey);
            
        self.postMessage({
            tileKey,
            cmd: 'render',
            res: 'done'
        });
                
    }
    requestAnimationFrame(render);     
};