/***
    simple BLUR FILTER
    this function causes a blurring effect. it's pretty slow compared to the other blur.
    
    It takes the pixel itself and
    its left, right, above and below neighbors (if it has them)
    and calculates the average of their total R, G, B, and A channels respectively.
***/
import { FilterTemplate } from './FilterTemplate.js';

class SimpleBlur extends FilterTemplate {
    constructor(){
        super({});
    }
    
    getNeighborsAvg(row, col, width, height, data){
        const channels = ['r','g','b','a'];
        const result = {};
        channels.forEach(c => result[c] = []);
        
        for(let i = 0; i < channels.length; i++){
            // top
            const topIdx = 4*(row-1)*width + (4*col) + i;
            if(topIdx >= 0) result[channels[i]].push(data[topIdx]);
            
            // left
            const leftIdx = 4*row*width + 4*(col-1) + i;
            if(leftIdx >= 0) result[channels[i]].push(data[leftIdx]);
            
            // right
            const rightIdx = 4*row*width + 4*(col+1) + i;
            if(rightIdx < data.length) result[channels[i]].push(data[rightIdx]);
            
            // bottom
            const bottomIdx = 4*(row+1)*width + (4*col) + i;
            if(bottomIdx < data.length) result[channels[i]].push(data[bottomIdx]);
            
            // self
            const idx = 4*row*width + 4*col + i;
            result[channels[i]].push(data[idx]);
        }
        
        for(let channel in result){
            const chanSum = result[channel].reduce((prev, curr) => prev + curr, 0);
            const chanAvg = chanSum / result[channel].length;
            result[channel] = chanAvg;
        }
        
        return result;
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        const copy = new Uint8ClampedArray(data);
        
        for(let row = 0; row < height; row++){
            for(let col = 0; col < width; col++){
                const neighbors = this.getNeighborsAvg(row, col, width, height, copy);
                data[4*width*row + 4*col] = neighbors.r;     // r
                data[4*width*row + 4*col + 1] = neighbors.g; // g
                data[4*width*row + 4*col + 2] = neighbors.b; // b
                data[4*width*row + 4*col + 3] = neighbors.a; // a
            }
        }
        
        return pixels;
    }
}

export {
    SimpleBlur
};