// outline filter
import { FilterTemplate } from './FilterTemplate.js';

class Outline extends FilterTemplate {
    
  constructor(){
    super(null);
  }
    
  withinRange(r, g, b, or, og, ob, rangeVal){
    const red = Math.abs(r - or) <= rangeVal;
    const green = Math.abs(g - og) <= rangeVal;
    const blue = Math.abs(b - ob) <= rangeVal;
    if(red && green && blue){
      return true;
    }
    return false;
  }
    
  makePath(context, col, row) {
    context.lineJoin = 'round';
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(col, row);
    context.lineTo(col + 2, row + 1);
    context.closePath();
    context.strokeStyle = '#000';
    context.stroke();
  }
    
  /***
        OUTLINE FILTER
        gets the 'outline' of the main parts of the picture
        it finds the pixels whose above neighbor is a different color/
        then a line is drawn from the location of that pixel to the above pixel,
        forming a small, slightly angled line. all these lines then make up an outline.
    ***/
  filter(pixels){
    const width = pixels.width;
    const height = pixels.height;
        
    // make a temp canvas to draw the result on
    // then we'll return this temp canvas' image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.height = pixels.height;
    tempCanvas.width = pixels.width;
    const context = tempCanvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#FFF';
    context.fillRect(0, 0, width, height);
        
    const d = pixels.data;
    let colCounter = 0;
    let rowCounter = 0;
    const maximum = 4 * width;
        
    for(let i = 0; i < d.length; i += 4){
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      context.lineJoin = 'round';
      context.lineWidth = 2;
      const tnr = d[i - (maximum)];
      const tng = d[i - (maximum - 1)];
      const tnb = d[i - (maximum - 2)];
      if(d[i - (maximum)] !== undefined && !this.withinRange(r, g, b, tnr, tng, tnb, 5)){
        this.makePath(context, colCounter, rowCounter);
      }
      if(i % (maximum) == 0){
        rowCounter++;
      }
      if(colCounter >= width){
        colCounter = 0;
      }
      colCounter++;
    }
        
    // return image data of the temp canvas
    const imgData = context.getImageData(0, 0, width, height);
    return imgData;
  }

}

export {
  Outline
};