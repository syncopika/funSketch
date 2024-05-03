// this is the worker script
// give each worker a 'quadrant' to take care of 
onmessage = function(e){
  const data = e.data[0];    // the original image data
  const width = e.data[1];
  const height = e.data[2];
  const direction = e.data[3];    // upRight, upLeft, downRight, downLeft

  // just return the index of the pixels looked at and the color to change to
  const result = oilpaint(data, width, height, direction);
    
  return result;
};

function getIntensity(pixelData, width, height, row, col){
  const intensityCount = {};
  const avgR = {};
  const avgG = {};
  const avgB = {};
    
  const params = {
    "radius": {
      "min": 1,
      "max": 7,
      "value": 5,
      "step": 1,
    },
    "intensity": {
      "min": 10,
      "max": 30,
      "value": 20,
      "step": 1,
    },
  };
    
  const top = Math.max(row - params.radius.value, 0);
  const bottom = Math.min(row + params.radius.value, height-1);
    
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
            
      const currIntensity = (((currR + currG + currB)/3) * params.intensity.value) / 255;
            
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


// oilpainting function 
// width = width of canvas, height = height of canvas, newColor = color to change to, pixelSelected = start pixel, direction = upRight, downRight, upLeft, or upRight
// data = the original context data
function oilpaint(data, width, height, direction){
  const copy = new Uint8ClampedArray(data);
    
  // create visited set
  const visited = {};
    
  let rowStart = 0;
  let colStart = 0;
  let rowEnd = height;
  let colEnd = width;
    
  if(direction === 'upRight'){
    rowEnd = Math.floor(height/2);
    colStart = Math.floor(width/2);
  }else if(direction === 'upLeft'){
    rowEnd = Math.floor(height/2);
    colEnd = Math.floor(width/2);
  }else if(direction === 'downLeft'){
    rowStart = Math.floor(height/2);
    colEnd = Math.floor(width/2);
  }else if(direction === 'downRight'){
    rowStart = Math.floor(height/2);
    colStart = Math.floor(width/2);
  }
    
  for(let row = rowStart; row < rowEnd; row++){
    for(let col = colStart; col < colEnd; col++){
      const color = getIntensity(copy, width, height, row, col);
      const pixelIdx = (4 * width * row) + (4 * col);
      visited[pixelIdx] = {
        r: color.r,
        g: color.g,
        b: color.b,
      };
    }
  }
    
  // the visited associative array will only contain the pixel coordinates whose color should change!!
  // do the color changing in the main thread 
  postMessage(visited);
}
