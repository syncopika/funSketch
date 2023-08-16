import { FilterTemplate } from './FilterTemplate.js';

class Watercolor extends FilterTemplate {
    // attempted to implement based on https://grail.cs.washington.edu/projects/watercolor/paper_small.pdf but found it a tad too challenging for me atm :)
    // https://www.reddit.com/r/proceduralgeneration/comments/6mta0f/watercolor_simple_noise_algorithm/ -> cool and maybe related?
    // maybe helpful for a new approach: https://stackoverflow.com/questions/62671209/how-to-spread-out-blur-filter-radius-in-html5-canvas 
    
    constructor(){
        const params = {};
        super(params);
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        //const copy = new Uint8ClampedArray(data);
        
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        
        const offscreenContext = offscreenCanvas.getContext("2d");
        offscreenContext.fillStyle = '#fff';
        offscreenContext.fillRect(0, 0, width, height);
        offscreenContext.lineCap = "round";
        offscreenContext.lineJoin = "round";
        offscreenContext.globalCompositeOperation = 'source-over';
        
        for(let row = 0; row < height; row += 10){
            for(let col = 0; col < width; col += 10){
                const r = data[(4 * row * width) + (4 * col)];
                const g = data[(4 * row * width) + (4 * col) + 1];
                const b = data[(4 * row * width) + (4 * col) + 2];
                const a = data[(4 * row * width) + (4 * col) + 3];
                
                offscreenContext.strokeStyle = `rgba(${r},${g},${b},${a})`;
                
                const blurAmount = Math.floor(Math.random() * (15 - 2) + 2);
                offscreenContext.filter = `blur(${blurAmount}px) opacity(95%)`;
                
                offscreenContext.lineWidth = Math.floor(Math.random() * (25 - 9) + 9);
                offscreenContext.beginPath();
                offscreenContext.moveTo(col, row+1);
                offscreenContext.lineTo(col-1, row);
                offscreenContext.closePath();
                offscreenContext.stroke();
            }
        }
        
        const offscreenPixelData = offscreenContext.getImageData(0, 0, width, height).data;
        for(let i = 0; i < pixels.data.length; i++){
            pixels.data[i] = offscreenPixelData[i];
        }
        
        return pixels;
    }
}

export {
    Watercolor
}