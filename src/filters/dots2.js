import { FilterTemplate } from './FilterTemplate.js';

// try halftone/halftone-like filter?
// https://stackoverflow.com/questions/1258047/algorithm-to-make-halftone-images

class Dots2 extends FilterTemplate {
    
    constructor(){
        const params = {
            "minDotWidth": {
                "value": 5,
                "min": 1,
                "max": 30,
                "step": 1,
            },
            "maxDotWidth": {
                "value": 20,
                "min": 1,
                "max": 30,
                "step": 1,
            }
        }
        super(params);
    }
    
    filter(pixels){
        const maxDotWidth = this.params.maxDotWidth.value;
        const minDotWidth = this.params.minDotWidth.value;
        
        // https://cse.usf.edu/~r1k/MachineVisionBook/MachineVision.files/MachineVision_Chapter10.pdf
        // interpolate intensity (r+g+b/3) between minDotWidth and maxDotWidth
        // intensity => between 0 and 255, with 0 being darkest and 255 being lightest
        // given intensity, 255 would be a dot width of 5, 0 would be 20. a = (255, minDotWidth), b = (0, maxDotWidth)
        // formula: dotWidth = 255 + (0 - 255)((intensity - minDotWidth) / (maxDotWidth - minDotWidth))
        // the color of the dot will be the color of the pixel selected
        
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        
        const drawDot = (x, y, intensity, color, context) => {
            context.lineJoin = "round";
            context.strokeStyle = color;
            
            const dotWidth = minDotWidth + (maxDotWidth - minDotWidth) * ((intensity - 255) / (0 - 255));
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
                const r = data[4 * i + 4 * j * width];
                const g = data[4 * i + 4 * j * width + 1];
                const b = data[4 * i + 4 * j * width + 2];
                const a = data[4 * i + 4 * j * width + 3];
                
                // calculate intensity
                const intensity = (r + g + b) / 3;
                
                drawDot(i, j, intensity, `rgba(${r},${g},${b},${a})`, tempCtx);
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
    Dots2
}