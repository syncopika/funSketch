/***

horizontal shift filter

it laterally shifts the pixels in each row of an image a random distance

inspired by: https://docs.gimp.org/2.10/en/gimp-filter-shift.html

***/

import { FilterTemplate } from './FilterTemplate.js';

class HorizontalShift extends FilterTemplate {
    constructor(){
        super({});
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        const copy = new Uint8ClampedArray(data);
        
        for(let row = 0; row < height; row++){
            const min = -10;
            const max = 10;
            const randDistance = Math.floor(Math.random() * (max - min)) + min;
            
            for(let col = 0; col < width; col++){
                const shiftTo = randDistance + col;
                if(shiftTo < width && shiftTo >= 0){
                    data[4*width*row + 4*col]     = copy[4*width*row + 4*shiftTo];     // r
                    data[4*width*row + 4*col + 1] = copy[4*width*row + 4*shiftTo + 1]; // g
                    data[4*width*row + 4*col + 2] = copy[4*width*row + 4*shiftTo + 2]; // b
                    data[4*width*row + 4*col + 3] = copy[4*width*row + 4*shiftTo + 3]; // a
                }
            }
        }
        
        return pixels;
    }
}

export {
    HorizontalShift
};