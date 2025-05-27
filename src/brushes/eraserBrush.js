import { BrushTemplate } from './BrushTemplate.js';

// basically the only difference between this and default brush is that #fff is mandatory lol
class EraserBrush extends BrushTemplate {
    
  constructor(brushManager){
    super(brushManager);
    this.cursorType = 'url(' + '"eraser_cursor1.png"' + ') 5 5, auto';
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
    for(let i = 0; i < this.clickX.length; i++){
      context.strokeStyle = '#ffffffff'; // #ffffffff because eraser
      context.lineWidth = this.clickSize[i];
            
      context.beginPath();
            
      if(this.clickDrag[i] && i){
        context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
      }else{
        //the adding of 1 allows you to make a dot on click
        context.moveTo(this.clickX[i], this.clickY[i] + 1);
      }
            
      context.lineTo(this.clickX[i], this.clickY[i]);
      context.closePath();
      context.stroke();
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
  EraserBrush
};