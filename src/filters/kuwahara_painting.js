// https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders/
// https://en.wikipedia.org/wiki/Kuwahara_filter

import { FilterTemplate } from './FilterTemplate.js';

class KuwaharaPainting extends FilterTemplate {
  constructor(){
    const params = {
      'windowSize': {
        'min': 1,
        'max': 10,
        'value': 2,
        'step': 1,
      },
    };
    super(params);
  }
  
  // https://github.com/ratkins/RGBConverter/blob/master/RGBConverter.cpp#L92
  rgbToHsv(r, g, b){
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;
    
    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    const delta = max - min;
    
    let h = max;
    let s = max;
    const v = max;
    
    s = (max === 0) ? 0 : (delta / max);
    
    if(max === min){
      h = 0;
    }else{
      if(max === rf){
        h = (gf - bf) / delta + (gf < bf ? 6 : 0);
      }else if(max === gf){
        h = (bf - rf) / delta + 2;
      }else if(max === bf){
        h = (rf - gf) / delta + 4;
      }
      h /= 6;
    }
    
    return {h, s, v};
  }
  
  isValidPixel(row, col, width, height){
    return row < height && row >= 0 && col < width && col >= 0;
  }
  
  // not sure we need this actually
  convertImgDataToHsv(imgData, width, height){
    for(let row = 0; row < height; row++){
      for(let col = 0; col < width; col++){
        const idx = (col * 4) + (row * 4 * width);
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        
        // TODO: since for the purposes of this filter we don't really care about h and s,
        // maybe we can just not calculate those values in rgbToHsv?
        const {h, s, v} = rgbToHsv(r, g, b);
        
        imgData[idx] = h;
        imgData[idx + 1] = s;
        imgData[idx + 2] = v;
      }
    }
  }
  
  getRgb(pixelData, row, col, width, height){
    const idx = (4 * width * row) + (4 * col);
    return {
      r: pixelData[idx],
      g: pixelData[idx + 1],
      b: pixelData[idx + 2],
    };
  }
  
  getStdDev(vValues){
    let sum = 0;
    const mean = vValues.reduce((x, acc) => acc + x, 0) / vValues.length;
    vValues.forEach(v => {
      sum += Math.pow(v - mean, 2);
    });
    return Math.sqrt(sum / vValues.length);
  }
  
  kuwahara(origData, pixelData, width, height, row, col){
    const pixelIdx = (4 * width * row) + (4 * col);
    
    // for each pixel:
    // get 4 quadrants
    // get std dev of each quad of the V value in HSV
    // get quad with smallest std dev
    // the curr pixel gets the avg of the quad
    
    const factor = this.params.windowSize.value; //2; // for determining window size
    
    // top left quadrant
    const topLeftV = [];
    const topLeftRgb = {r: 0, g: 0, b: 0};
    for(let i = row - factor; i < row; i++){
      for(let j = col - factor; j < col; j++){
        if(this.isValidPixel(i, j, width, height)){
          const rgb = this.getRgb(pixelData, i, j, width, height);
          const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
          topLeftV.push(hsv.v);
          topLeftRgb.r += rgb.r;
          topLeftRgb.g += rgb.g;
          topLeftRgb.b += rgb.b;
        }
      }
    }
    const topLeftStdDev = this.getStdDev(topLeftV);
    
    // top right quadrant
    const topRightV = [];
    const topRightRgb = {r: 0, g: 0, b: 0};
    for(let i = row - factor; i < row; i++){
      for(let j = col; j < (col + factor); j++){
        if(this.isValidPixel(i, j, width, height)){
          const rgb = this.getRgb(pixelData, i, j, width, height);
          const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
          topRightV.push(hsv.v);
          topRightRgb.r += rgb.r;
          topRightRgb.g += rgb.g;
          topRightRgb.b += rgb.b;
        }
      }
    }
    const topRightStdDev = this.getStdDev(topRightV);
    
    // lower left quadrant
    const lowerLeftV = [];
    const lowerLeftRgb = {r: 0, g: 0, b: 0};
    for(let i = row; i < row + factor; i++){
      for(let j = col - factor; j < col; j++){
        if(this.isValidPixel(i, j, width, height)){
          const rgb = this.getRgb(pixelData, i, j, width, height);
          const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
          lowerLeftV.push(hsv.v);
          lowerLeftRgb.r += rgb.r;
          lowerLeftRgb.g += rgb.g;
          lowerLeftRgb.b += rgb.b;
        }
      }
    }
    const lowerLeftStdDev = this.getStdDev(lowerLeftV);
    
    // lower right quadrant
    const lowerRightV = [];
    const lowerRightRgb = {r: 0, g: 0, b: 0};
    for(let i = row; i > 0 && i < height && i < row + factor; i++){
      for(let j = col; j > 0 && j < (col + factor); j++){
        if(this.isValidPixel(i, j, width, height)){
          const rgb = this.getRgb(pixelData, i, j, width, height);
          const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
          lowerRightV.push(hsv.v);
          lowerRightRgb.r += rgb.r;
          lowerRightRgb.g += rgb.g;
          lowerRightRgb.b += rgb.b;
        }
      }
    }
    const lowerRightStdDev = this.getStdDev(lowerRightV);
    
    // assign avg color of smallest std dev quadrant
    const minStdDev = Math.min(topLeftStdDev, topRightStdDev, lowerLeftStdDev, lowerRightStdDev);
    if(minStdDev === topLeftStdDev){
      origData[pixelIdx]     = (topLeftRgb.r / topLeftV.length);
      origData[pixelIdx + 1] = (topLeftRgb.g / topLeftV.length);
      origData[pixelIdx + 2] = (topLeftRgb.b / topLeftV.length);
    }else if(minStdDev === topRightStdDev){
      origData[pixelIdx]     = (topRightRgb.r / topRightV.length);
      origData[pixelIdx + 1] = (topRightRgb.g / topRightV.length);
      origData[pixelIdx + 2] = (topRightRgb.b / topRightV.length);
    }else if(minStdDev === lowerLeftStdDev){
      origData[pixelIdx]     = (lowerLeftRgb.r / lowerLeftV.length);
      origData[pixelIdx + 1] = (lowerLeftRgb.g / lowerLeftV.length);
      origData[pixelIdx + 2] = (lowerLeftRgb.b / lowerLeftV.length);
    }else{
      origData[pixelIdx]     = (lowerRightRgb.r / lowerRightV.length);
      origData[pixelIdx + 1] = (lowerRightRgb.g / lowerRightV.length);
      origData[pixelIdx + 2] = (lowerRightRgb.b / lowerRightV.length);
    }
  }
    
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
        
    const data = pixels.data;
    const copy = new Uint8ClampedArray(data);
    
    for(let row = 0; row < height; row++){
      for(let col = 0; col < width; col++){
        this.kuwahara(data, copy, width, height, row, col);
      }
    }
        
    return pixels;
  }
}

export {
  KuwaharaPainting
};