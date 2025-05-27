// resultsId = the id of the element to append the results 
function getResult(startTime, context, imageData, resultsId){
  context.putImageData(imageData, 0, 0);
            
  // get end time!
  const endTime = new Date();

  const res = (endTime.getTime() - startTime.getTime()) / 1000;
    
  const resultTable = document.getElementById(resultsId);
    
  const newResult = document.createElement('li');
  newResult.textContent = res + ' s';
  resultTable.appendChild(newResult);
    
  //console.log((endTime.getTime() - startTime.getTime()) / 1000)
  //console.log("time it took (floodfill w/ web workers: " + (endTime.getTime() - startTime.getTime()) / 1000);
}

function getIntensity(pixelData, width, height, row, col){
  const intensityCount = {};
  const avgR = {};
  const avgG = {};
  const avgB = {};
    
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

function oilpaintWithoutWorkers(canvasId, resultTableId){
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const resultTable = document.getElementById(resultTableId);
  const newResult = document.createElement('li');
      
  newResult.textContent = oilpaintHelper(imgData) + ' s';

  resultTable.appendChild(newResult);
}

// the actual oilpaint function for non-webworker test
function oilpaintHelper(imageData){
  // start the timer here!
  const startTime = new Date();
      
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  for(let row = 0; row < height; row++){
    for(let col = 0; col < width; col++){
      const color = getIntensity(copy, width, height, row, col);
      const pixelIdx = (4 * width * row) + (4 * col);
      data[pixelIdx] = color.r;
      data[pixelIdx + 1] = color.g;
      data[pixelIdx + 2] = color.b;
    }
  }
  
  // put new edited image back on canvas 
  ctx.putImageData(imageData, 0, 0);
  //console.log(imageData);
  
  // get end time!
  const endTime2 = new Date();
    
  // return time it took to complete 
  return (endTime2.getTime() - startTime.getTime()) / 1000;
  //console.log("time it took: " + (endTime.getTime() - startTime.getTime()) / 1000);
}

function oilpaintWithWorkers(canvasId, resultTableId){
  if(window.Worker){
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const workerTopRight = new Worker('worker.js');
    const workerTopLeft = new Worker('worker.js');
    const workerBottomRight = new Worker('worker.js');
    const workerBottomLeft = new Worker('worker.js');
        
    // start the timer here!
    const startTime2 = new Date();
        
    workerTopRight.postMessage([data, canvas.width, canvas.height, 'upRight']);
    workerBottomRight.postMessage([data, canvas.width, canvas.height, 'downRight']);
    workerTopLeft.postMessage([data, canvas.width, canvas.height, 'upLeft']);
    workerBottomLeft.postMessage([data, canvas.width, canvas.height, 'downLeft']);
        
    let counter = 0;
        
    workerTopRight.onmessage = function(e){
      repaint(data, e.data, 'upRight');
      counter++;
      if(counter === 4){
        getResult(startTime2, ctx, imageData, resultTableId);
      }
    };
        
    workerTopLeft.onmessage = function(e){
      repaint(data, e.data, 'downRight');
      counter++;
      if(counter === 4){
        getResult(startTime2, ctx, imageData, resultTableId);
      }
    };
        
    workerBottomRight.onmessage = function(e){
      repaint(data, e.data, 'upLeft');
      counter++;
      if(counter === 4){
        getResult(startTime2, ctx, imageData, resultTableId);
      }
    };
        
    workerBottomLeft.onmessage = function(e){
      repaint(data, e.data, 'downLeft');
      counter++;
      if(counter === 4){
        getResult(startTime2, ctx, imageData, resultTableId);
      }
    };
  }else{
    console.log('web workers not available!');
  }
}

// update canvas image data with new info from web worker
function repaint(ctxData, paintData, direction){
  for(pixel in paintData){
    const pixelIndex = parseInt(pixel); // pixel is supposed to be the index of the pixel in the image data
    const color = paintData[pixel];
    ctxData[pixelIndex] = color.r;
    ctxData[pixelIndex + 1] = color.g;
    ctxData[pixelIndex + 2] = color.b;
  }
}