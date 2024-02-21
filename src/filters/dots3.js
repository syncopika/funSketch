import { FilterTemplate } from './FilterTemplate.js';

// try halftone/halftone-like filter?
// https://stackoverflow.com/questions/1258047/algorithm-to-make-halftone-images

class Dots3 extends FilterTemplate {
    
    constructor(){
        const params = {
            "distThreshold": {
                "value": 150,
                "min": 50,
                "max": 300,
                "step": 1,
            },
        }
        super(params);
    }
    
    getDistance(r, g, b, r2, g2, b2){
        return Math.sqrt((r*r2) + (g*g2) + (b*b2));
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        
        const drawDot = (x, y, color, context) => {
            context.lineJoin = "round";
            context.strokeStyle = color;
            
            const dotWidth = 3;
            context.lineWidth = dotWidth;
            
            context.beginPath();
            context.moveTo(x, y + 1);
            context.lineTo(x, y);
            context.closePath();
            context.stroke();
        }
        
        // make a temp canvas and set it to white
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#fff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        for(let i = 0; i < width; i += 12){
            for(let j = 0; j < height; j += 12){                
                // check neighbor pixel color.
                // if significantly different from this color, take average and draw a dot here
                // otherwise don't do anything (assuming #fff here)
                if(i+1 < width){
                    const r = data[4 * i + 4 * j * width];
                    const g = data[4 * i + 4 * j * width + 1];
                    const b = data[4 * i + 4 * j * width + 2];
                    const a = data[4 * i + 4 * j * width + 3];
                    
                    const neighborR = data[(4 * (i + 1)) + 4 * j * width];
                    const neighborG = data[(4 * (i + 1)) + 4 * j * width + 1];
                    const neighborB = data[(4 * (i + 1)) + 4 * j * width + 2];
                    
                    const dist = this.getDistance(r, g, b, neighborR, neighborG, neighborB);
                    
                    if(dist <= this.params.distThreshold.value){
                        drawDot(i, j, `rgba(${(r+neighborR)/2},${(g+neighborG)/2},${(b+neighborB)/2},${a})`, tempCtx);
                    }
                }
            }
        }
        
        // copy temp canvas pixel data over to pixels
        const tempPixelData = tempCtx.getImageData(0, 0, width, height).data;
        for(let i = 0; i < pixels.data.length; i++){
            pixels.data[i] = tempPixelData[i];
        }
        
        return pixels;
    }
}

export {
    Dots3
}