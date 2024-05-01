/***
    a class representing a frame, containing a list of canvas elements which represent layers of the frame
***/
class Frame {
  constructor(container, number){
    this.currentIndex = 0; // index of currently showing layer
    this.canvasList = []; // keep a list of all canvas instances
    this.currentCanvas; // the current, active canvas being looked at (reference to html element)
    this.currentCanvasSnapshots = []; // keep track of what the current canvas looks like after each mouseup
    this.container = container; // this is the html element node to hold all the layers of this frame
    this.number = number; // this frame's number
    this.width = 0;
    this.height = 0;
  }
    
  getMetadata(){
    return {
      'width': this.width,
      'height': this.height,
      'currentIndex': this.currentIndex,
      'number': this.number
    };
  }
    
  getCurrCanvasIndex(){
    return this.currentIndex;
  }
    
  getCurrCanvas(){
    return this.canvasList[this.currentIndex];
  }
    
  getLayers(){
    return this.canvasList;
  }
    
  addSnapshot(snapshot){
    this.currentCanvasSnapshots.push(snapshot);
  }
    
  getSnapshots(){
    return this.currentCanvasSnapshots;
  }
    
  clearSnapshots(){
    this.currentCanvasSnapshots = [];
  }
    
  // canvasList: list of canvas elements
  setLayers(canvasList){
    this.canvasList = canvasList;
  }
    
  setCurrIndex(index){
    if(index <= this.canvasList.length - 1 && index >= 0){
      this.currentIndex = index;
      this.currentCanvas = this.canvasList[index];
    }
  }
    
  /***
        set up a new canvas element
        makes the new canvas the current canvas
        
        prefill should be false when importing a project
        this is so that we don't prefill the canvas with rgba(255,255,255,1)
        and mess up any alpha transparency the imported layers might have
    ***/
  setupNewLayer(prefill=true){
    // create the new canvas element 
    const newCanvas = document.createElement('canvas');
    newCanvas.id = `frame${this.number}canvas${this.canvasList.length}`;
    this.container.appendChild(newCanvas);
        
    // https://stackoverflow.com/questions/74101155/chrome-warning-willreadfrequently-attribute-set-to-true
    newCanvas.getContext("2d", {willReadFrequently: true});
        
    setCanvas(prefill, newCanvas);
        
    if(this.canvasList.length === 0){
      newCanvas.style.opacity = .97;
      newCanvas.style.zIndex = 1;
      this.width = newCanvas.width;
      this.height = newCanvas.height;
            
      // set new canvas to be the current canvas only initially
      this.currentCanvas = newCanvas;
    }
        
    this.canvasList.push(newCanvas);
  }
    
  _showLayer(canvas){
    canvas.style.opacity = .97;
    canvas.style.zIndex = 1;
  }

  _hideLayer(canvas){
    canvas.style.opacity = 0;
    canvas.style.zIndex = 0;
  }
    
  // make current canvas an onion skin
  _makeCurrLayerOnion(canvas){
    canvas.style.opacity = .92; // apply onion skin to current canvas 
    canvas.style.zIndex = 0;
  }
    
  nextLayer(){
    // this moves the current layer to the next one if exists
    if(this.currentIndex + 1 < this.canvasList.length){
      // move to next canvas and apply onion skin to current canvas
      const currLayer = this.currentCanvas;
      this._makeCurrLayerOnion(currLayer);
            
      // in the special case for when you want to go to the next canvas from the very first one, 
      // ignore the step where the opacity and z-index for the previous canvas get reset to 0.
      if(currLayer.currentIndex > 0){
        const prevLayer = this.canvasList[this.currentIndex - 1];
        // reset opacity and z-index for previous canvas (because of onionskin)
        this._hideLayer(prevLayer);
      }
      // show the next canvas 
      const nextLayer = this.canvasList[this.currentIndex + 1];
      this._showLayer(nextLayer);
            
      this.currentCanvas = nextLayer;
      this.currentIndex++;
      this.currentCanvasSnapshots = [];
            
      return true;
    }
    return false;
  }
    
  prevLayer(){
    // this moves the current layer to the previous one if exists
    if(this.currentIndex - 1 >= 0){
      const currLayer = this.currentCanvas;
      this._hideLayer(currLayer);
            
      // make previous canvas visible 
      const prevLayer = this.canvasList[this.currentIndex - 1];
      this._showLayer(prevLayer);
            
      // if there is another canvas before the previous one, apply onion skin
      if(this.currentIndex - 2 >= 0){
        this.canvasList[this.currentIndex - 2].style.opacity = .92;
      }
      this.currentCanvas = prevLayer;
      this.currentIndex--;
      this.currentCanvasSnapshots = [];
            
      return true;
    }
    return false;
  }
    
  hide(){
    // makes all layers not visible
    this.canvasList.forEach((canvas) => {
      canvas.style.zIndex = -1;
      canvas.style.visibility = "hidden";
    });
  }
    
  show(){
    // shows active layer of frame
    const activeLayerOpacity = .97;
    this.canvasList.forEach((canvas) => {
      if(canvas === this.currentCanvas){
        canvas.style.zIndex = 1;
        canvas.style.opacity = activeLayerOpacity;
      }else{
        canvas.style.zIndex = 0;
        canvas.style.opacity = 0;
      }
      canvas.style.visibility = "";
    });
  }
    
  // TODO: why have this and setCurrIndex()??
  // layerIndex (int) = the index of the layer to make active (current layer)
  // onionSkin (bool) = whether onionskin should be visible 
  setToLayer(layerIndex, onionSkin){
    // note that this does not hide the previous layer + previous onion skin before switching to 
    // the new layer.
    const newLayer = this.canvasList[layerIndex];
    newLayer.style.opacity = 0.97;
    newLayer.style.zIndex = 1;
        
    this.currentCanvas = newLayer;
    this.currentIndex = layerIndex;
    this.currentCanvasSnapshots = [];
        
    if(onionSkin && (layerIndex-1 > 0)){
      // apply onionskin
      const prevLayer = this.canvasList[layerIndex-1];
      prevLayer.style.opacity = .92;
      prevLayer.style.zIndex = 0;
    }
  }
    
  deleteLayer(layerIndex){
    if(layerIndex + 1 < this.canvasList.length){
      // move current canvas to the next one if there is one
      this.nextLayer();
      // then remove the old canvas from the array and the DOM!
      this.canvasList.splice(layerIndex, 1);
      // adjust the current canvas index after the removal 
      this.currentIndex -= 1;
    }else if(layerIndex - 1 >= 0){
      // if there's a canvas behind the current one (and no more ahead)
      // move current canvas to the previous one 
      // note that currentIndex doesn't need to be adjusted because removing the 
      // next canvas doesn't affect the current canvas' index
      this.prevLayer();
      this.canvasList.splice(layerIndex, 1);
    }
  }
    
  /***
        clone the current canvas
        this creates a new layer whose image data is the same as the current canvas.
        
        not sure I'm using this?
    ***/
  copyCanvas(){
    const newCanvas = document.createElement('canvas');
    newCanvas.id = `frame${this.number}canvas${this.canvasList.length}`;
        
    const prefill = true;
    setCanvas(prefill, newCanvas, this.width, this.height);
        
    //newCanvas.style.opacity = 0.97;
    this.container.appendChild(newCanvas);
    newCanvas.getContext("2d").drawImage(this.currentCanvas, 0, 0);
    this.canvasList.push(newCanvas);
  }
    
  clearCurrentLayer(){
    const currLayer = this.getCurrCanvas();
    const context = currLayer.getContext("2d");
    context.clearRect(0, 0, currLayer.getAttribute('width'), currLayer.getAttribute('height'));
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, currLayer.getAttribute('width'), currLayer.getAttribute('height'));
  }
    
  resetFrame(){
    // TODO: remove all layers except first layer, then clear it
  }
}

/***
    an AnimationProject represents a single project containing one or more frames.
    it also instantiates an onion skin frame.
***/
class AnimationProject {
  constructor(container){
    this.name = "";
    this.currentFrameIndex = 0; // index of current frame
    this.speed = 100; // 100 ms per frame 
    this.frameList = [];
    this.onionSkinFrame = null;
    this.container = container;
  }
    
  init(){
    this.addNewFrame(true);
    this.onionSkinFrame = createOnionSkinFrame(this.container);
    this.onionSkinFrame.style.display = 'none'; // hide it initially
  }
    
  getFrames(){
    return this.frameList;
  }
    
  getCurrFrameIndex(){
    return this.currentFrameIndex;
  }
    
  getCurrFrame(){
    return this.frameList[this.currentFrameIndex];
  }
    
  resetProject(){
    this.frameList.forEach((frame, frameIndex) => { 
      const parent = frame.container;
      // just keep the first frame
      frame.canvasList.forEach(function(layer, layerIndex){
        if(frameIndex > 0 || (frameIndex === 0 && layerIndex > 0)){
          parent.removeChild(layer);
        }
      });
      if(frameIndex === 0){
        frame.setLayers([frame.getLayers()[0]]);
        frame.setCurrIndex(0);
      }
    });
        
    this.frameList = [this.frameList[0]];
        
    // clear the first layer of the first frame!
    this.frameList[0].clearCurrentLayer();
    this.currentFrameIndex = 0;
    this.speed = 100;
        
    this.frameList[0].getCurrCanvas().style.visibility = "";
    this.clearOnionSkin();
  }
    
  addNewFrame(showFlag){
    const newFrame = new Frame(this.container, this.frameList.length);
    newFrame.setupNewLayer();
    this.frameList.push(newFrame);
    if(!showFlag){
      newFrame.hide();
    }
  }
    
  copyCurrFrame(){
    // get current frame and make a copy of it. append the copy to the end of the list of frames.
    this.addNewFrame(false);
    const newCopy = this.frameList[this.frameList.length-1];
    const currFrameLayersToCopy = this.getCurrFrame().getLayers();
        
    currFrameLayersToCopy.forEach(function(layer, layerIndex){  
      if((layerIndex + 1) > newCopy.getLayers().length){
        newCopy.setupNewLayer();
      }
            
      const currLayer = newCopy.getLayers()[layerIndex];
      currLayer.style.opacity = layer.opacity;
      currLayer.style.zIndex = layer.zIndex;

      // add the image data 
      const newCtx = currLayer.getContext("2d");
      const currImageData = layer.getContext("2d").getImageData(0, 0, layer.width, layer.height);
      newCtx.putImageData(currImageData, 0, 0);
    });
  }
    
  deleteFrame(index){
    // don't allow removal if only one frame exists
    if(this.frameList.length === 1 || index < 0 || index > this.frameList.length - 1){
      return false;
    }
        
    const frame = this.frameList[index];
        
    // remove frame from frameList
    this.frameList.splice(index, 1);
        
    // remove all layers
    const parentContainer = frame.container;
    frame.getLayers().forEach((layer) => {
      parentContainer.removeChild(layer);
    });
        
    return true;
  }
    
  nextFrame(){
    if(this.frameList.length <= this.currentFrameIndex + 1){
      return null; // no more frames to see
    }
    this.getCurrFrame().clearSnapshots();
    this.currentFrameIndex += 1;
    this.updateOnionSkin();
    return this.frameList[this.currentFrameIndex];
  }
    
  prevFrame(){
    if(this.currentFrameIndex - 1 < 0){
      return null; // no more frames to see
    }
    this.getCurrFrame().clearSnapshots();
    this.currentFrameIndex -= 1;
    this.updateOnionSkin();
    return this.frameList[this.currentFrameIndex];
  }
    
  goToFrame(frameIndex){
    if(frameIndex > this.frameList.length - 1 || frameIndex < 0){
      return null;
    }
    this.currentFrameIndex = frameIndex;
    this.getCurrFrame().clearSnapshots();
    this.updateOnionSkin();
    return this.frameList[this.currentFrameIndex];
  }
    
  // this method takes all the layers of a frame, merges them, and places the resulting image
  // on a specific 'onionskin' canvas. when moving from one frame to another, the 'onionskin' of the
  // previous frame will be visible.
  updateOnionSkin(){
    if(this.currentFrameIndex - 1 < 0){
      // no onionskin for very first frame 
      this.onionSkinFrame.style.opacity = 0;
      return;
    }
        
    this.onionSkinFrame.style.display = ''; // show onion skin
    const onionSkinCtx = this.onionSkinFrame.getContext("2d");
    onionSkinCtx.clearRect(0, 0, this.onionSkinFrame.width, this.onionSkinFrame.height);
        
    // take the previous frame, merge all layers, put into onion skin frame
    const onionSkinImageData = onionSkinCtx.getImageData(0, 0, this.onionSkinFrame.width, this.onionSkinFrame.height);
        
    // build the merged image from the first to last
    const prevFrame = this.frameList[this.currentFrameIndex-1];
    prevFrame.getLayers().forEach(layer => {
      const imageData = layer.getContext("2d").getImageData(0, 0, layer.width, layer.height).data;
      for(let i = 0; i < imageData.length; i += 4) {
        if (imageData[i] === 255 && imageData[i+1] === 255 && imageData[i+2] === 255) {
          continue;
        }
        else {
          onionSkinImageData.data[i] = imageData[i];
          onionSkinImageData.data[i+1] = imageData[i+1];
          onionSkinImageData.data[i+2] = imageData[i+2];
          onionSkinImageData.data[i+3] = 255;
        }
      }
      // apply each layer to the onion skin
      onionSkinCtx.putImageData(onionSkinImageData, 0, 0);
    });
        
    this.onionSkinFrame.style.zIndex = 0;
    this.onionSkinFrame.style.opacity = 0.92;
  }
    
  clearOnionSkin(){
    const onionSkin = this.onionSkinFrame;
    const context = this.onionSkinFrame.getContext("2d");
    context.clearRect(0, 0, onionSkin.getAttribute('width'), onionSkin.getAttribute('height'));
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, onionSkin.getAttribute('width'), onionSkin.getAttribute('height'));
  }
    
}

function createOnionSkinFrame(container){
  const newCanvas = document.createElement('canvas');
  newCanvas.id = "onionSkinCanvas";
  container.appendChild(newCanvas);
    
  newCanvas.getContext("2d", {willReadFrequently: true});
    
  const prefill = true;
  setCanvas(prefill, newCanvas);
    
  newCanvas.style.opacity = .97;
  newCanvas.style.zIndex = -1; // TODO: come back to this later. make sure it's visible if current frame > 1!
  return newCanvas;
}

// assigns default canvas attributes and styling
// prefill should be false when importing a project
function setCanvas(prefill, canvasElement, width, height){
  canvasElement.style.position = "absolute";
  canvasElement.style.border = "1px #000 solid";
  canvasElement.style.zIndex = 0;
  canvasElement.style.opacity = 0;
  canvasElement.style.width = "100%";
  canvasElement.style.height = "100%";
  canvasElement.style.touchAction = "none"; // for handling pointer events properly
  canvasElement.width = width ? width : canvasElement.offsetWidth;
  canvasElement.height = height ? height : canvasElement.offsetHeight;
    
  if(prefill){
    canvasElement.getContext("2d").fillStyle = "rgba(255, 255, 255, 1)";
    canvasElement.getContext("2d").fillRect(0, 0, canvasElement.width, canvasElement.height);
  }
}

export{
  Frame,
  AnimationProject,
  createOnionSkinFrame,
  setCanvas
};
