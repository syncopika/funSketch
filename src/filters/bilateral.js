// fake bilateral filter
// combines Gaussian blur + edge detection, inspired by https://www.reddit.com/r/computervision/comments/p56ur/is_there_any_free_implementation_of_a_bilateral/
// TODO: try a real bilateral filter without relying on edge detection
// https://browncsci1290.github.io/webpage/labs/bilateral/
// https://stackoverflow.com/questions/1357403/how-to-cartoon-ify-an-image-programmatically
// https://dsp.stackexchange.com/questions/8316/the-difference-between-bilateral-filter-and-gaussian-filter

import { FilterTemplate } from './FilterTemplate.js';
import { Blur } from './blur.js';
import { EdgeDetection } from './edgedetection.js';

class BilateralFilter extends FilterTemplate {
    
  constructor(){
    const params = {
      "blurFactor": {
        "value": 3,
        "min": 1,
        "max": 15,
        "step": 1,
      }
    };
    super(params);
  }
  
  getPixelData(pixelData, row, col, width){
    const r = pixelData[(4 * width * row) + (4 * col)];
    const g = pixelData[(4 * width * row) + (4 * col) + 1];
    const b = pixelData[(4 * width * row) + (4 * col) + 2];
    return {r, g, b};
  }
  
  checkBlackPixel(pixelData, row, col, width){
    const rgb = this.getPixelData(pixelData, row, col, width);
    const threshold = 40;
    return rgb.r <= threshold && rgb.g <= threshold && rgb.b <= threshold;
  }
  
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
    const data = pixels.data;
    
    const blurredImageData = new ImageData(new Uint8ClampedArray(data), width, height);
    const edgeDetectionImageData = new ImageData(new Uint8ClampedArray(data), width, height);
    
    // do blur on source image copy
    const blurFilter = new Blur();
    blurFilter.params.blurFactor.value = this.params.blurFactor.value;
    blurFilter.filter(blurredImageData);
    
    // do edge detection on source image copy
    const edgeDetectionFilter = new EdgeDetection();
    edgeDetectionFilter.filter(edgeDetectionImageData);
    
    // for each pixel of edgeDetectionImageData, if the pixel is black (e.g. < 30 for rgb),
    // copy over the blurred result. otherwise, leave alone (this should preserve edges
    // as the edges should appear, in general(?), lighter than rgb(10,10,10) or whatever threshold we want
    for(let i = 0; i < height; i++){
      for(let j = 0; j < width; j++){
        if(this.checkBlackPixel(edgeDetectionImageData.data, i, j, width)){
          // set source image data pixel to blurred value
          const rgb = this.getPixelData(blurredImageData.data, i, j, width);
          data[(4 * width * i) + (4 * j)] = rgb.r; 
          data[(4 * width * i) + (4 * j) + 1] = rgb.g; 
          data[(4 * width * i) + (4 * j) + 2] = rgb.b; 
        }
      }
    }
    
    return pixels;
  }
}

export {
  BilateralFilter
};