// template for brushes
class BrushTemplate {

  constructor(brushManager){
    this.brushManager = brushManager; // a brush will need to use some things the brush manager has
    this.paint = false; // boolean for knowing when brush is active or not
        
    // keep track of the pixels drawn on by the mouse.
    // the redraw function uses this data to connect the dots 
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickSize = [];
    this.clickPressure = [];
    this.cursorType = 'crosshair';
  }
    
  // assuming a PointerEvent, calculate the brush width based on stylus pressure
  calculateBrushWidth(pointerEvt){
    let brushWidth = this.brushManager.getCurrSize();
    if(pointerEvt.pressure){
      brushWidth = (pointerEvt.pressure*2) * brushWidth;
    }
    return brushWidth;
  }
    
  // collect info where each pixel is to be drawn on canvas
  addClick(pointerEvt, dragging){
    const canvas = pointerEvt.target.getBoundingClientRect();
    const x = pointerEvt.offsetX / (canvas.width / this.brushManager.initialCanvasWidth);
    const y = pointerEvt.offsetY / (canvas.height / this.brushManager.initialCanvasHeight);
        
    const pressure = pointerEvt.pressure;
    const currColorArr = this.brushManager.getCurrColorArray();
        
    let penPressure = 1;
    let currSize = this.brushManager.getCurrSize();
    let currColor = this.brushManager.getCurrColor();
        
    // take into account pen pressure for color if needed (as well as for brush size)
    // note that to find the darkest variant of the current color, we'll adjust only the non-dominant channels
    if(this.brushManager.applyPressureColor() && pressure){
      // pressure ranges from 0 to 1
      const dominantChannel = Math.max(currColorArr[2], Math.max(currColorArr[0], currColorArr[1]));
      let newR, newG, newB;
      if(currColorArr[0] === dominantChannel){
        // r
        newR = currColorArr[0];
        newG = currColorArr[1]*(1-pressure);
        newB = currColorArr[2]*(1-pressure);
      }else if(currColorArr[1] === dominantChannel){
        // g
        newR = currColorArr[0]*(1-pressure);
        newG = currColorArr[1];
        newB = currColorArr[2]*(1-pressure);
      }else{
        // b
        newR = currColorArr[0]*(1-pressure);
        newG = currColorArr[1]*(1-pressure);
        newB = currColorArr[2];
      }
      currColor = 'rgba(' + newR + ',' + newG + ',' + newB + ',' + currColorArr[3] + ')';
      currSize = this.calculateBrushWidth(pointerEvt);
      penPressure = pressure;
    }else{
      currColor = 'rgba(' + currColorArr.join(',') + ')';
    }
        
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
    this.clickColor.push(currColor);
    this.clickSize.push(currSize);
    this.clickPressure.push(penPressure);
  }
    
  redraw(strokeFunction){
    const frame = this.brushManager.animationProject.getCurrFrame();
    const context = frame.getCurrCanvas().getContext('2d');
    context.lineJoin = 'round'; //TODO: make this a brushmanager variable?
    strokeFunction(context);
  }
    
  clearClick(){
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickSize = [];
    this.clickPressure = [];
  }
    
  // not needed anymore since pointer events can handle all event types we're concerned with
  _handleTouchEvent(evt){
    const rect = evt.target.getBoundingClientRect();
    const x = evt.touches[0].pageX - rect.left;
    const y = evt.touches[0].pageY - rect.top - window.pageYOffset;
    return {'x': x, 'y': y};
  }
    
  isStartBrush(evt){
    return (evt.which === 1 || evt.pointerType === 'touch' || evt.pointerType === 'pen');
  }
    
  // event listener functions
  brushStart(evt){
    evt.preventDefault();
  }
    
  brushMove(evt){
    evt.preventDefault();
  }
    
  brushStop(evt){
    evt.preventDefault();
  }
    
  brushLeave(evt){
    evt.preventDefault();
  };
    
  // this is for determining what the brush stroke looks like
  brushStroke(context){
  }
    
  // equip the brush and set up the current canvas for using the brush
  attachBrush(){
  }

}

export {
  BrushTemplate
};