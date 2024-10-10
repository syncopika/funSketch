// https://3dstereophoto.blogspot.com/2018/05/non-photorealistic-rendering-watercolor.html
// https://github.com/ugocapeto/thewatercolorist/blob/main/thewatercolorist_main.cpp

//import { quickNoise } from './noise.js';
import FastNoiseLite from './fastnoise.js';

export function applyPaperTexture(origImgData, paperTextureImgData, width, height, beta){
  //console.log(origImgData);
  //console.log(paperTextureImgData);
  return modifyColorHSL(origImgData, paperTextureImgData, width, height, beta);
}

// https://github.com/ugocapeto/thewatercolorist/blob/main/turbulent_flow.cpp
export function applyTurbulentFlow(colorImgData, width, height, octaves, persistence, frequency0, beta){
  const srgbTextureImgData = [];
  for(let i = 0; i < colorImgData.length; i++){
    srgbTextureImgData.push(0);
  }
  
  // use FastNoiseLite https://github.com/Auburn/FastNoiseLite/blob/master/JavaScript/FastNoiseLite.js
  const fastnoise = new FastNoiseLite();
  fastnoise.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
  
  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      let total = 0;
      let freq = frequency0;
      let amplitude = 1.2;
      let maxVal = 0; // used to normalize result between 0 and 1
      
      for(let i = 0; i < octaves; i++){
        fastnoise.SetFrequency(freq);
        
        let noise = fastnoise.GetNoise(col, row);
        
        if(row === 0 && col === 0){
          console.log(noise);
        }
        
        noise = (noise + 1) / 2; // noise is -1 to 1 so adjust to make it from 0 and 1
        
        // make sure noise is between 0 and 1
        if(noise < 0){
          noise = 0;
        }
        if(noise > 1){
          noise = 1;
        }
        
        noise = noise * amplitude;
        total += noise;
        maxVal += amplitude;
        amplitude *= persistence;
        freq *= 2;
      }
      
      const noiseVal = total / maxVal;
      
      setPixelColor(srgbTextureImgData, col, row, width, noiseVal, noiseVal, noiseVal);
    }
  }
  
  return modifyColorHSL(colorImgData, srgbTextureImgData, width, height, beta);
}

// https://github.com/ugocapeto/thewatercolorist/blob/main/edge_darkening_2.cpp
export function applyEdgeDarkening(originalImgData, colorImgData, width, height, n, beta){ 
  // compute kernel for gradient in y direction
  const kernel = [];
  for(let i = 0; i < (n*n); i++){
    kernel.push(0);
  }
  
  let k = -1;
  
  for(let i = 0; i < Math.floor(n/2); i++){
    let kk = k;
    for(let j = 0; j < Math.floor(n/2); j++){
      kernel[i * n + j] = kk;
      kernel[(n-1-i) * n + j] = -kk;
      kernel[i * n + (n-1-j)] = kk;
      kernel[(n-1-i) * n + (n-1-j)] = -kk;
      kk--;
    }
    const m = Math.floor(n/2);
    kernel[i*n+m] = kk;
    kernel[(n-1-m)*n+m] = -kk;
    k--;
  }
  
  const srgbTextureImgData = [];
  for(let i = 0; i < originalImgData.length; i++){
    srgbTextureImgData.push(0);
  }
  
  for(let j = 0; j < n; j++){
    kernel[Math.floor(n/2)*n+j] = 0;
  }
  
  let minGrad = 1e32;
  let maxGrad = -1e32;
  
  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      // compute gradient in x dir for rgb
      const gradx3 = [0, 0, 0];
      
      for(let i = 0; i < n; i++){
        const i2 = i - Math.floor(n/2);
        let y2 = row + i2;
        
        if(y2 < 0){
          y2 = 0;
        }
        
        if(y2 >= height){
          y2 = height - 1;
        }
        
        for(let j = 0; j < n; j++){
          const j2 = j - Math.floor(n/2);
          let x2 = col + j2;
          
          // kernel for the x-dir gradient is the transpose of the y-dir gradient kernel
          const val = kernel[j*n+i];
          
          if(x2 < 0){
            x2 = 0;
          }
          
          if(x2 >= width){
            x2 = width - 1;
          }
          
          // get pixel data @ (x2, y2)
          const color = getPixelColor(originalImgData, x2, y2, width);
          gradx3[0] += (val * color.r);
          gradx3[1] += (val * color.g);
          gradx3[2] += (val * color.b);
        }
      }
      
      // compute gradient in y dir for rgb
      const grady3 = [0, 0, 0];
      
      for(let i = 0; i < n; i++){
        const i2 = i - Math.floor(n/2);
        let y2 = row + i2;
        
        if(y2 < 0){
          y2 = 0;
        }
        
        if(y2 >= height){
          y2 = height - 1;
        }
        
        for(let j = 0; j < n; j++){
          const j2 = j - Math.floor(n/2);
          let x2 = col + j2;
          
          // kernel for the x-dir gradient is the transpose of the y-dir gradient kernel
          const val = kernel[i*n+j];
          
          if(x2 < 0){
            x2 = 0;
          }
          
          if(x2 > width){
            x2 = width - 1;
          }
          
          // get pixel data @ (x2, y2)
          const color = getPixelColor(originalImgData, x2, y2, width);
          grady3[0] += val * color.r;
          grady3[1] += val * color.g;
          grady3[2] += val * color.b;
        }
      }
      
      const grad = (
        Math.abs(gradx3[0]) + Math.abs(grady3[0]) +
        Math.abs(gradx3[1]) + Math.abs(grady3[1]) +
        Math.abs(gradx3[2]) + Math.abs(grady3[2])) / 3;
      
      setPixelColor(srgbTextureImgData, col, row, width, grad, grad, grad);
      
      if(grad < minGrad){
        minGrad = grad;
      }
      if(grad > maxGrad){
        maxGrad = grad;
      }
    }
  }
  
  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      const color = getPixelColor(srgbTextureImgData, col, row, width);
      const grad = color.r;
      let val = (grad - minGrad) / (maxGrad - minGrad);
      val = 1 - val;
      val = val / 2;
      setPixelColor(srgbTextureImgData, col, row, width, val, val, val);
    }
  }
  
  return modifyColorHSL(colorImgData, srgbTextureImgData, width, height, beta);
}

// convert img data from float (0 < 1) to int (0 < 255)
export function convertImgDataToInt(imgData){
  return imgData.map(x => Math.round(x * 255));
}

// convert img data from int (0 < 255) to float (0 < 1)
export function convertImgDataToFloat(imgData){
  return imgData.map(x => x / 255);
}

// https://github.com/ugocapeto/thewatercolorist/blob/main/modify_color_hsl.cpp
function modifyColorHSL(origImgData, paperTextureImgData, width, height, beta){
  // get image data in hsl
  convertRGBtoHSL(origImgData, width, height);
  
  const hslColorImgDataNew = [...origImgData];
  
  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      const color = getPixelColor(origImgData, col, row, width);
      const colorHSL = {h: color.r, s: color.g, l: color.b};
      
      const textureColor = getPixelColor(paperTextureImgData, col, row, width);
      const texture = textureColor.r;
      
      // compute density
      const d = 1.0 + beta * (texture - 0.5);
      const newHSL = [colorHSL.h, 0, 0];
      let c;
      
      // saturation (s in hsl)
      c = colorHSL.s;
      newHSL[1] = c;
      
      // compute new luminance (l in hsl)
      c = colorHSL.l;
      const cp = c * (1.0 - (1.0 - c) * (d - 1.0));
      newHSL[2] = cp;
      
      /*
      if(row === 0 && col === 0){
        console.log(hslColorImgDataNew);
        console.log(color);
        console.log(textureColor);
        console.log(colorHSL);
        console.log(newHSL);
      }*/
      
      setPixelColor(hslColorImgDataNew, col, row, width, ...newHSL);
    }
  }
  
  // convert hslColorImgDataNew to RGB
  //console.log('--- hslColorImgDataNew ----');
  //console.log(hslColorImgDataNew);
  //console.log('-------');
  convertHSLtoRGB(hslColorImgDataNew, width, height);
  
  return hslColorImgDataNew;
}

// set channel data for a pixel
function setPixelColor(imgData, x, y, width, r, g, b){
  const pixelIdx = (4 * width * y) + (4 * x);
  imgData[pixelIdx] = r;
  imgData[pixelIdx + 1] = g;
  imgData[pixelIdx + 2] = b;
}

function getPixelColor(imgData, x, y, width){
  const pixelIdx = (4 * width * y) + (4 * x);
  return {
    r: imgData[pixelIdx],
    g: imgData[pixelIdx + 1],
    b: imgData[pixelIdx + 2],
  };
}

// assumes channel data in imgData is 0 < 1
function convertRGBtoHSL(imgData, width, height){
  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      const color = getPixelColor(imgData, col, row, width);
      const hsl = rgbToHsl(color.r, color.g, color.b);
      setPixelColor(imgData, col, row, width, hsl.h, hsl.s, hsl.l);
    }
  }
}

// assumes channel data in imgData is 0 < 1
function convertHSLtoRGB(imgData, width, height){
  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      const color = getPixelColor(imgData, col, row, width);
      const rgb = hslToRgb(color.r, color.g, color.b);
      setPixelColor(imgData, col, row, width, rgb.r, rgb.g, rgb.b);
    }
  }
}

// https://github.com/ratkins/RGBConverter/blob/master/RGBConverter.cpp
function rgbToHsl(r, g, b){
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = (max + min) / 2;
  let s = (max + min) / 2;
  const l = (max + min) / 2;
  
  if(max === min){
    // achromatic
    h = 0;
    s = 0;
  }else{
    const d = max - min;
    
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    if(max === r){
      h = ((g - b) / d) + (g < b ? 6 : 0);
    }else if(max === g){
      h = (b - r) / d + 2;
    }else if(max === b){
      h = (r - g) / d + 4;
    }
    
    h /= 6;
  }
  
  return {h, s, l};
}

function hslToRgb(h, s, l){
  let r, g, b;
  
  if(s === 0){
    // achromatic
    r = l;
    g = l;
    b = l;
  }else{
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + (1/3));
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - (1/3));
  }
  
  return {r, g, b};
}

function hueToRgb(p, q, t){
  if(t < 0) t += 1;
  if(t > 1) t -= 1;
  if(t < 1/6) return p + (q - p) * 6 * t;
  if(t < 1/2) return q;
  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;  
}
