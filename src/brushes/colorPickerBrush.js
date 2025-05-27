import { BrushTemplate } from './BrushTemplate.js';

class ColorPickerBrush extends BrushTemplate {
    
  constructor(brushManager){
    super(brushManager);
        
    this.cursorType = 'pointer'; // TODO: make an icon
  }
    
  // event listener functions
  brushStart(evt){
    evt.preventDefault();
    if(this.isStartBrush(evt)){
      // need to parse the currColor because right now it looks like "rgb(x,y,z)". 
      // I want it to look like [x, y, z]
      const currColor = this.brushManager.currColor;
      let currColorArray = currColor.substring(currColor.indexOf('(')+1, currColor.length-1).split(',');
      currColorArray = this.brushManager.currColorArray.map(function(a){ return parseInt(a); });
            
      const x = evt.offsetX;
      const y = evt.offsetY;

      // ruh roh: https://stackoverflow.com/questions/27961537/why-function-returns-wrong-color-in-canvas
      // so this data might not be accurate... :/
      const frame = this.brushManager.animationProject.getCurrFrame();    
      const currLayer = frame.getCurrCanvas();
      const colorData = document.getElementById(currLayer.id).getContext('2d').getImageData(x, y, 1, 1).data;
      const color = 'rgba(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ',' + colorData[3] + ')';

      // set the brush color to this color
      // yeah, this is pretty hacky - dunno of a better way though at the moment :)
      const colorPickedText = document.getElementById('colorPicked');
      if(colorData[0] > 10 && colorData[1] > 200){
        colorPickedText.style.color = '#000';
      }else{
        colorPickedText.style.color = '#fff';
      }
            
      colorPickedText.textContent = color;
      colorPickedText.style.backgroundColor = colorPickedText.textContent;
      this.brushManager.changeBrushColor(colorData);
    }
  }
    
  // equip the brush and set up the current canvas for using the brush
  attachBrush(){
    const frame = this.brushManager.animationProject.getCurrFrame();    
    const currLayer = frame.getCurrCanvas();
    currLayer.style.cursor = this.cursorType;

    // TODO: refactor this so that we can just call a method from brushManager to do this stuff?
    const start = this.brushStart.bind(this);
    currLayer.addEventListener('pointerdown', start);
    this.brushManager.currentEventListeners['pointerdown'] = start;
  }
}


export {
  ColorPickerBrush
};