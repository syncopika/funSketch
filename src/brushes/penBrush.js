/***
    brush for making shapes
    inspired by mrdoob's work: https://github.com/mrdoob/harmony/
***/

import { BrushTemplate } from './BrushTemplate.js';

class PenBrush extends BrushTemplate {
    
  constructor(brushManager){
    super(brushManager);
  }
    
  // event listener functions
  brushStart(evt){
    evt.preventDefault();
    if(this.isStartBrush(evt)){
      this.paint = true;
      this.addClick(evt, true);
      this.redraw(this.brushStroke.bind(this));
    }        
  }
    
  brushMove(evt){
    if(this.paint){
      evt.preventDefault();
      this.addClick(evt, true);
      this.redraw(this.brushStroke.bind(this));
    }
  }
    
  brushStop(evt){
    evt.preventDefault();
    this.brushManager.saveSnapshot();
    this.clearClick();
    this.paint = false;
  }
    
  // this is for determining what the brush stroke looks like
  brushStroke(context){
    const frame = this.brushManager.animationProject.getCurrFrame();
    const currColor = this.brushManager.getCurrColorArray();
        
    // connect the dots first
    for(let i = 0; i < this.clickX.length; i++){
      context.strokeStyle = this.clickColor[i];
      context.lineWidth = this.clickSize[i];
            
      context.beginPath();
            
      if(this.clickDrag[i] && i){
        context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
      }else{
        context.moveTo(this.clickX[i], this.clickY[i] + 1);
      }
            
      context.lineTo(this.clickX[i], this.clickY[i]);
      context.closePath();
      context.stroke();
    }
        
    // then add some extra strokes (and make them more faint than the main stroke line if pen pressure flag)
    if(this.brushManager.applyPressureColor()){
      const extraStrokeColor = 'rgba(' + currColor[0] + ',' + currColor[1] + ',' + currColor[2] + ',' + (this.clickPressure[this.clickPressure.length-1] * 0.3) + ')';
      context.strokeStyle = extraStrokeColor;
    }
        
    // TODO: I think the below stuff should go in the loop above (take the strokeStyle change above along with it).
    // pick a random point from some of the most recent points drawn so far. adjust that coord slightly based on some random numbers.
    // then draw a line from that coord to a new coord that is based off the latest drawn point (this point will also be slightly altered based on random nums).
    // this way we get some random, skewed lines to our strokes to give some texture.
    if(this.clickX.length > 7){
      const currIndex = this.clickX.length - 1;
      for(let i = this.clickX.length - 6; i < this.clickX.length; i++){
        // maybe we can do something neat like take into account the direction of the brush based on
        // the vector created by the current and previous coordinates?
        const prevIndex = Math.round((Math.random() * (currIndex - (currIndex - 5))) + (currIndex - 5)); // get rand index from currIndex - 5 to the last index
        context.beginPath();
        context.moveTo(this.clickX[prevIndex] + (Math.random() * 3), this.clickY[prevIndex] + (2 * Math.random()));
        context.lineTo(this.clickX[i], this.clickY[i]);
        context.closePath();
        context.stroke();
      }
    }
  }
    
  brushLeave(){
    this.clearClick();
    this.paint = false;
  }
    
  // equip the brush and set up the current canvas for using the brush
  attachBrush(){
    const start = this.brushStart.bind(this);
    const move = this.brushMove.bind(this);
    const stop = this.brushStop.bind(this);
    const leave = this.brushLeave.bind(this);
    this.brushManager.updateEventListeners(start, move, stop, leave, this.cursorType);
  }
}


export {
  PenBrush
};