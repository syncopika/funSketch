import { FilterTemplate } from './FilterTemplate.js';

class Painted extends FilterTemplate {
    // this was originally an attempt at watercolor creation but it turned out different lol :D
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
        offscreenContext.lineJoin = "round"; // try other line join options for interesting effects!
        offscreenContext.globalCompositeOperation = 'source-over';
        
        for(let row = 0; row < height; row += 8){
            for(let col = 0; col < width; col += 8){
                const r = data[(4 * row * width) + (4 * col)];
                const g = data[(4 * row * width) + (4 * col) + 1];
                const b = data[(4 * row * width) + (4 * col) + 2];
                const a = data[(4 * row * width) + (4 * col) + 3];
                
                const lineCap = Math.random() < 0.5 ? "square" : "round";
                offscreenContext.lineCap = lineCap;
                
                offscreenContext.strokeStyle = `rgba(${r},${g},${b},${a})`;
                
                for(let i = 0; i < 2; i++){
                    offscreenContext.beginPath();
                    offscreenContext.lineWidth = Math.floor(Math.random() * (28 - 10) + 10);
                    offscreenContext.globalAlpha = Math.random(); // 0.5
                    
                    //const blurAmount = Math.floor(Math.random() * (4 - 1) + 1);
                    //const opacityAmount = Math.floor(Math.random() * (98 - 70) + 70);
                    //offscreenContext.filter = `blur(${blurAmount}px)`; //opacity(${opacityAmount}%) 
                    
                    offscreenContext.moveTo(col, row + Math.floor(Math.random() * 7) - 5);
                    offscreenContext.lineTo(col, row + Math.floor(Math.random() * 10) - 5);
                    offscreenContext.closePath();
                    offscreenContext.stroke();
                }
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
    Painted
}