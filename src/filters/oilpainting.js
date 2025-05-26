// http://supercomputingblog.com/graphics/oil-painting-algorithm/
// https://www.codeproject.com/Articles/471994/OilPaintEffect

import { FilterTemplate } from './FilterTemplate.js';

class OilPainting extends FilterTemplate {
  constructor(){
    const params = {
      'radius': {
        'min': 1,
        'max': 7,
        'value': 5,
        'step': 1,
      },
      'intensity': {
        'min': 10,
        'max': 30,
        'value': 20,
        'step': 1,
      },
    };
    super(params);
  }
    
  getIntensity(pixelData, width, height, row, col){
    const intensityCount = {};
    const avgR = {};
    const avgG = {};
    const avgB = {};
        
    const top = Math.max(row - this.params.radius.value, 0);
    const bottom = Math.min(row + this.params.radius.value, height-1);
        
    let counter = 0;
        
    // collect intensities of all the neighboring pixels of this current pixel (based on given radius)
    for(let r = top; r <= bottom; r++){
      const left = Math.max(0, col - counter);
      const right = Math.min(width - 1, col + counter);
            
      for(let c = left; c <= right; c++){
        const currPixelIndex = (4 * width * r) + (4 * c);
        const currR = pixelData[currPixelIndex];
        const currG = pixelData[currPixelIndex + 1];
        const currB = pixelData[currPixelIndex + 2];
                
        const currIntensity = (((currR + currG + currB)/3) * this.params.intensity.value) / 255;
                
        if(intensityCount[currIntensity]){
          intensityCount[currIntensity]++;
          avgR[currIntensity] += currR;
          avgG[currIntensity] += currG;
          avgB[currIntensity] += currB;
        }else{
          intensityCount[currIntensity] = 1;
          avgR[currIntensity] = currR;
          avgG[currIntensity] = currG;
          avgB[currIntensity] = currB;
        }
      }
            
      counter++;
    }
        
    // find which intensity is most common surrounding this current pixel and calculate the color that matches it
    let currMaxIntensity = Object.keys(intensityCount)[0];
    let currMaxCount = intensityCount[currMaxIntensity];
    for(const intensity in intensityCount){
      if(intensityCount[intensity] > currMaxCount){
        currMaxCount = intensityCount[intensity];
        currMaxIntensity = intensity;
      }
    }
        
    const finalR = avgR[currMaxIntensity] / currMaxCount;
    const finalG = avgG[currMaxIntensity] / currMaxCount;
    const finalB = avgB[currMaxIntensity] / currMaxCount;
        
    return {
      r: finalR,
      g: finalG, 
      b: finalB
    };
  }
    
  filter(pixels){
    console.log('starting oilpainting filter: ' + (new Date()));
    const width = pixels.width;
    const height = pixels.height;
        
    const data = pixels.data;
    const copy = new Uint8ClampedArray(data);
        
    for(let row = 0; row < height; row++){
      for(let col = 0; col < width; col++){
        const color = this.getIntensity(copy, width, height, row, col);
        const pixelIdx = (4 * width * row) + (4 * col);
        data[pixelIdx] = color.r;
        data[pixelIdx + 1] = color.g;
        data[pixelIdx + 2] = color.b;
      }
    }
        
    console.log('oilpainting filter done: ' + (new Date()));
        
    return pixels;
  }
}

export {
  OilPainting
};