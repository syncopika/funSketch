/***

CRT (cathode ray tube) filter

adapted from: https://github.com/libretro/glsl-shaders/blob/master/crt/shaders/crt-nes-mini.glsl

this looks helpful too but more complicated:
https://github.com/bisqwit/crt-filter

***/

import { FilterTemplate } from './FilterTemplate.js';

class CRT extends FilterTemplate {
    constructor(){
        super({});
    }
    
    filter(pixels){
        const width = pixels.width;
        const height = pixels.height;
        
        const data = pixels.data;
        const copy = new Uint8ClampedArray(data);
        
        const scanLineThickness = 4;
        const brightboost = 0.35;
        const intensity = 0.25;
        
        for(let row = 0; row < height; row++){
            for(let col = 0; col < width; col++){
                const selectHigh = row % scanLineThickness === 0 ? 1 : 0;
                const selectLow = 1 - selectHigh;
                    
                for(let i = 0; i < 3; i++){
                    const currChannel = copy[4*width*row + 4*col + i] / 255;
                    const channelHigh = ((1.0 + brightboost) - (0.2 * currChannel)) * currChannel;
                    const channelLow = ((1.0 - intensity) + (0.1 * currChannel)) * currChannel;
                    const newColorVal = (selectLow * channelLow) + (selectHigh * channelHigh);
                    data[4*width*row + 4*col + i] = 255 * newColorVal;
                }
            }
        }
        
        return pixels;
    }
}

export {
    CRT
};