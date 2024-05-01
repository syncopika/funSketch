/***

channel shift distortion filter

it changes rgb channel values between pixels to give a slightly shifted/distorted effect


I also was thinking about filters similar to the ones referenced below:

have a look at this thread:
https://discourse.processing.org/t/vhs-lo-fi-glitch-effect/12746/10

and this blog post:
http://datamoshing.com/category/processing/

***/

import { FilterTemplate } from './FilterTemplate.js';

class ChannelShift extends FilterTemplate {
  constructor(){
    super({});
  }
    
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
        
    const data = pixels.data;
    const copy = new Uint8ClampedArray(data);
    const rand = Math.floor(Math.random()*3);
        
    for(let row = 0; row < height; row++){
      for(let col = 0; col < width; col++){
        const offset = 7;
        if((offset + col) < width){
          const newR = copy[4*width*row + 4*(col+offset)];
          const newG = copy[4*width*row + 4*(col+offset) + 1];
          const newB = copy[4*width*row + 4*(col+offset) + 2];
                    
          if(rand === 0){
            data[4*width*row + 4*col] = newR;
          }else if(rand === 1){
            data[4*width*row + 4*col + 1] = newG;
          }else{
            data[4*width*row + 4*col + 2] = newB;
          }
        }
      }
    }
        
    return pixels;
  }
}

export {
  ChannelShift
};