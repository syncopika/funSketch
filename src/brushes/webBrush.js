/***
    web brush 
    thanks to mrdoob: https://github.com/mrdoob/harmony/blob/master/src/js/brushes/web.js
***/

import { BrushTemplate } from './BrushTemplate.js';

class WebBrush extends BrushTemplate {
    
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
    evt.preventDefault();
    if(this.paint){
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
        
    // connect the dots
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
      const currColor = this.brushManager.getCurrColorArray();
      const extraStrokeColor = 'rgba(' + currColor[0] + ',' + currColor[1] + ',' + currColor[2] + ',' + (this.clickPressure[this.clickPressure.length-1] * 0.1) + ')';
      context.strokeStyle = extraStrokeColor;
    }
        
    for(let i = 0; i < this.clickX.length; i++){
      const dx = this.clickX[i] - this.clickX[this.clickX.length - 1];
      const dy = this.clickY[i] - this.clickY[this.clickY.length - 1];
      const d = dx*dx + dy*dy;
            
      if(d < 2500 && Math.random() > 0.9){
        context.beginPath();
        context.moveTo(this.clickX[this.clickX.length-1], this.clickY[this.clickY.length-1]);
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
  WebBrush
};