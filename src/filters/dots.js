import { FilterTemplate } from './FilterTemplate.js';

class Dots extends FilterTemplate {
    
    constructor(){
        const params = {
            "dotWidth": {
                "value": 5,
                "min": 1,
                "max": 10,
                "step": 1,
            }
        }
        super(params);
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        //const copy = new Uint8ClampedArray(data);
        
        const drawDot = (x, y, color, context) => {
            context.lineJoin = "round";
            context.strokeStyle = color;
            context.lineWidth = this.params.dotWidth.value;
            
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
        
        for(let i = 0; i < width; i += this.params.dotWidth.value){
            for(let j = 0; j < height; j += this.params.dotWidth.value){
                const r = data[4 * i + 4 * j * width];
                const g = data[4 * i + 4 * j * width + 1];
                const b = data[4 * i + 4 * j * width + 2];
                const a = data[4 * i + 4 * j * width + 3];
                
                drawDot(i, j, `rgba(${r},${g},${b},${a})`, tempCtx);
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
    Dots
}