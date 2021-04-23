export default function (ctx, coordinates, style) {
    let a = [];
    let b = [];
    for (let i = 0; i < coordinates.length; ++i) {
        if (b.length == 2) {
            a.push(b);
            b = [];
            b.push(coordinates[i]);
        }
        else {
            b.push(coordinates[i]);
        }
    }
    if (a.length > 0) {        
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        
        ctx.beginPath();    
        const [x0, y0] = a[0];
        ctx.moveTo(x0, y0);
        for(let i = 1; i < a.length; ++i) {
            const [x,y] = a[i];
            ctx.lineTo(x, y);
        }
        ctx.closePath();        
        ctx.fillStyle = style;
        ctx.fill();                 
    } 
};