import { BrushTemplate } from './BrushTemplate.js';

class FloodfillBrush extends BrushTemplate {
    
  constructor(brushManager){
    super(brushManager);
        
    this.cursorType = "url(" + "\"paintbucket.png\"" + "), auto";
  }
    
  floodfill(currentCanvas, newColor, pixelSelected){
    // create a stack 
    const stack = [];
    // create visited set 
    // the format of these entries will be like: {'xCoord,yCoord': 1}
    const visited = new Set();
    // the selectedPixel will have the color that needs to be targeted by floodfill 
    const targetColor = pixelSelected.color;
    // current canvas context 
    const ctx = document.getElementById(currentCanvas.id).getContext('2d');
    // get the image data of the entire canvas 
    // do the floodfill, then put the edited image data back 
    const imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
    const data = imageData.data;
    const originalData = new Uint8ClampedArray(imageData.data);
    stack.push(pixelSelected);
    while(stack.length !== 0){
      // get a pixel
      const currPixel = stack.pop();
      // add to visited set 
      visited.add(currPixel.x + ',' + currPixel.y);
      // get left, right, top and bottom neighbors 
      const leftNeighborX = currPixel.x - 1;
      const rightNeighborX = currPixel.x + 1;
      const topNeighborY = currPixel.y - 1;
      const bottomNeighborY = currPixel.y + 1;
      let r, g, b;
      // top neighbor
      if(topNeighborY >= 0 && !visited.has(currPixel.x + ',' + topNeighborY)){
        // index of r, g and b colors in imageData.data
        r = (topNeighborY * currentCanvas.width * 4) + ((currPixel.x + 1) * 4);
        g = r + 1;
        b = g + 1;
        if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')'){
          // if the neighbor's color is the same as the targetColor, add it to the stack
          stack.push({ 'x': currPixel.x, 'y': topNeighborY, 'color': currPixel.color });
        }
      }
      // right neighbor 
      if(rightNeighborX < currentCanvas.width && !visited.has(rightNeighborX + ',' + currPixel.y)){
        r = (currPixel.y * currentCanvas.width * 4) + ((rightNeighborX + 1) * 4);
        g = r + 1;
        b = g + 1;
        if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')'){
          // if the neighbor's color is the same as the targetColor, add it to the stack
          stack.push({ 'x': rightNeighborX, 'y': currPixel.y, 'color': currPixel.color });
        }
      }
      // bottom neighbor
      if(bottomNeighborY < currentCanvas.height && !visited.has(currPixel.x + ',' + bottomNeighborY)){
        r = (bottomNeighborY * currentCanvas.width * 4) + ((currPixel.x + 1) * 4);
        g = r + 1;
        b = g + 1;
        if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')') {
          // if the neighbor's color is the same as the targetColor, add it to the stack
          stack.push({ 'x': currPixel.x, 'y': bottomNeighborY, 'color': currPixel.color });
        }
      }
      // left neighbor
      if(leftNeighborX >= 0 && !visited.has(leftNeighborX + ',' + currPixel.y)){
        r = (currPixel.y * currentCanvas.width * 4) + ((leftNeighborX + 1) * 4);
        g = r + 1;
        b = g + 1;
        if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')') {
          // if the neighbor's color is the same as the targetColor, add it to the stack
          stack.push({ 'x': leftNeighborX, 'y': currPixel.y, 'color': currPixel.color });
        }
      }
      // finally, update the color of the current pixel 
      r = (currPixel.y * currentCanvas.width * 4) + ((currPixel.x + 1) * 4);
      g = r + 1;
      b = g + 1;
      data[r] = newColor[0];
      data[g] = newColor[1];
      data[b] = newColor[2];
    }
    // put new edited image back on canvas
    ctx.putImageData(imageData, 0, 0);
  }
    
  // event listener functions
  brushStart(evt){
    evt.preventDefault();
    const frame = this.brushManager.animationProject.getCurrFrame();    
    const currLayer = frame.getCurrCanvas();
        
    if((evt.which === 1 && evt.type === 'mousedown') || evt.type === 'touchstart'){ //when left click only
      if(evt.type === 'touchstart'){
        const newCoords = this._handleTouchEvent(evt);
        evt.offsetX = newCoords.x;
        evt.offsetY = newCoords.y;
        evt.preventDefault();
      }
            
      // do floodfill
      // need to parse the currColor because right now it looks like "rgb(x,y,z)". 
      // I want it to look like [x, y, z]
      const currColor = this.brushManager.currColor;
      let currColorArray = currColor.substring(currColor.indexOf('(')+1, currColor.length-1).split(',');
      currColorArray = this.brushManager.currColorArray.map(function(a){ return parseInt(a); });
            
      const x = evt.offsetX;
      const y = evt.offsetY;

      const colorData = document.getElementById(currLayer.id).getContext("2d").getImageData(x, y, 1, 1).data;
      const color = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';

      // create an object with the pixel data
      const pixel = {'x': Math.floor(x), 'y': Math.floor(y), 'color': color};

      this.floodfill(currLayer, currColorArray, pixel);
            
      const w = currLayer.width;
      const h = currLayer.height;
      frame.addSnapshot(currLayer.getContext("2d").getImageData(0, 0, w, h));
    }
  }
    
  // equip the brush and set up the current canvas for using the brush
  attachBrush(){
    const frame = this.brushManager.animationProject.getCurrFrame();    
    const currLayer = frame.getCurrCanvas();
    currLayer.style.cursor = this.cursorType;

    // TODO: refactor this so that we can just call a method from brushManager to do this stuff?
    const start = this.brushStart.bind(this);
    currLayer.addEventListener('mousedown', start);
    currLayer.addEventListener('touchstart', start);
    this.brushManager.currentEventListeners['mousedown'] = start;
    this.brushManager.currentEventListeners['touchstart'] = start;
  }
}


export {
  FloodfillBrush
};