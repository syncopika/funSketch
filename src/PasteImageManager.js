export class PasteImageManager {    
  constructor(animationProject){
    this.isMovingPasteCanvas = false;
    this.lastOffsetHeight = 0;
    this.lastOffsetWidth = 0;
    this.initialOffsetX = 0;
    this.initialOffsetY = 0;
    this.initialCanvasHeight = 0;
    this.initialCanvasWidth = 0;
    this.resizingPasteCanvas = false;
    this.lastX = null;
    this.lastY = null;
    this.currPasteCanvasRotation = 0;
    this.rotatingPasteCanvas = false;
    this.originalPasteImage = null;
    this.animationProject = animationProject;
  }

  addPasteCanvas(imgData, width, height){
    const displayArea = this.animationProject.getCurrFrame().getCurrCanvas().parentNode;
    const canvasElement = document.createElement("canvas");
    displayArea.appendChild(canvasElement);
    canvasElement.className = "pasteCanvas";
    canvasElement.style.position = "absolute";
    canvasElement.style.border = "1px #000 dotted";
    canvasElement.style.zIndex = 10;
    canvasElement.style.top = 0;
    canvasElement.style.left = 0;
        
    // https://stackoverflow.com/questions/50315340/javascript-rotate-canvas-image-corners-are-clipped-off
    const diagLen = Math.sqrt((imgData.width*imgData.width) + (imgData.height*imgData.height));
    canvasElement.width = diagLen;
    canvasElement.height = diagLen;
        
    this.initialCanvasHeight = diagLen;
    this.initialCanvasWidth = diagLen;
        
    const ctx = canvasElement.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
    // draw image in center of canvas
    ctx.setTransform(1, 0, 0, 1, canvasElement.width/2, canvasElement.height/2);
    ctx.drawImage(imgData, -imgData.width/2, -imgData.height/2);
        
    return canvasElement;
  }

  allowScaleAndRotate(evt){
    const pasteCanvas = document.querySelector('.pasteCanvas');
    if(pasteCanvas){
      if(evt.code === "KeyS"){
        // s key
        this.resizingPasteCanvas = !this.resizingPasteCanvas;
      }else if(evt.code === "KeyR"){
        // r key
        this.rotatingPasteCanvas = !this.rotatingPasteCanvas;
      }else if(evt.code === "Escape"){
        // esc key to cancel
        pasteCanvas.parentNode.removeChild(pasteCanvas);
        this.resizingPasteCanvas = false;
        this.rotatingPasteCanvas = false;
        this.currPasteCanvasRotation = 0;
      }
    }
  }

  redrawImage(newRotation, sHeight, sWidth, dx, dy, dHeight, dWidth, pasteCanvas, ctx){
    // translate the (0,0) coord (where the top-left of the image will be in the canvas)
    if(newRotation === 0){
      ctx.translate(0, 0);
    }else if(newRotation === 90 || newRotation === -270){
      ctx.translate(pasteCanvas.width, 0);
    }else if(newRotation === 180 || newRotation === -180){
      ctx.translate(pasteCanvas.width, pasteCanvas.height);
    }else if(newRotation === 270 || newRotation === -90){
      ctx.translate(0, pasteCanvas.height);
    }
        
    ctx.setTransform(1, 0, 0, 1, pasteCanvas.width/2, pasteCanvas.height/2);
    ctx.rotate(newRotation * Math.PI / 180);
        
    ctx.drawImage(this.originalPasteImage, 0, 0, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  addPasteCanvasEventListeners(pasteCanvas, initialCanvasWidth, initialCanvasHeight){
    // apply some styling to indicate we're pasting an image
    pasteCanvas.parentNode.style.border = '#000 2px solid';
        
    // add click event for outside the canvas to finalize image paste
    function finalizeImagePaste(evt){
      if(evt.target.classList.contains("pasteCanvas")){
        // user has to click outside the canvas to finalize the image paste
        return;
      }
            
      this.isMovingPasteCanvas = false;
      const mainCanvas = this.animationProject.getCurrFrame().getCurrCanvas();   
      const mainCtx = mainCanvas.getContext('2d');
            
      document.body.removeEventListener("pointerup", finalizeImagePaste);
      mainCanvas.parentNode.style.border = 'none';
            
      if(pasteCanvas.parentNode === null){
        // if pasteCanvas no longer in the DOM
        return;
      }
            
      // place the image data from pasteCanvas onto the main canvas
      // figure out how much of the pasted image is visible and can be placed on the main canvas
      const pasteLeft = parseInt(pasteCanvas.style.left);
      const pasteTop = parseInt(pasteCanvas.style.top);
            
      let pasteImgRowStart = 0;
      let pasteImgRowEnd = pasteCanvas.height;
            
      let pasteImgColStart = 0;
      let pasteImgColEnd = pasteCanvas.width;
            
      let width;
      if(pasteLeft < 0){
        // image goes past the left side of the main canvas
        width = pasteCanvas.width + pasteLeft;
        pasteImgColStart = Math.abs(pasteLeft);
      }else if(pasteLeft + pasteCanvas.width <= mainCanvas.width){
        // if pasted image falls within the mainCanvas completely width-wise
        width = pasteCanvas.width;
      }else{
        // image goes past the right side of the main canvas
        width = mainCanvas.width - pasteLeft;
        pasteImgColEnd = width;
      }
            
      let height;
      if(pasteTop < 0){
        height = pasteCanvas.height + pasteTop;
        pasteImgRowStart = Math.abs(pasteTop);
      }else if(pasteTop + pasteCanvas.height <= mainCanvas.height){
        height = pasteCanvas.height;
      }else{
        height = mainCanvas.height - pasteTop;
        pasteImgRowEnd = height;
      }
            
      // isolate just the section of image data that should be pasted
      const pasteData = pasteCanvas.getContext('2d').getImageData(0,0,pasteCanvas.width,pasteCanvas.height).data;
      const pasteImgSectionData = [];
      for(let row = pasteImgRowStart*4*pasteCanvas.width; row < pasteImgRowEnd*4*pasteCanvas.width; row += (4*pasteCanvas.width)){
        for(let col = 4*pasteImgColStart; col < 4*pasteImgColEnd; col += 4){
          pasteImgSectionData.push(pasteData[row+col]);
          pasteImgSectionData.push(pasteData[row+col+1]);
          pasteImgSectionData.push(pasteData[row+col+2]);
          pasteImgSectionData.push(pasteData[row+col+3]);
        }
      }
            
      // the location on the main canvas where to start pasting the image
      const locX = (pasteLeft < 0) ? 0 : pasteLeft;
      const locY = (pasteTop < 0) ? 0 : pasteTop;
            
      const imgData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
      const rowStartMain = mainCanvas.width*4*locY;
      const rowEndMain = mainCanvas.width*4*(locY+height);
      const colStart = locX*4;
      const colEnd = 4*(locX+width);
      let pasteImgDataIdx = 0;
            
      for(let i = rowStartMain; i < rowEndMain; i+=(mainCanvas.width*4)){
        for(let j = colStart; j < colEnd; j+=4){
          const r = pasteImgSectionData[pasteImgDataIdx++];
          const g = pasteImgSectionData[pasteImgDataIdx++];
          const b = pasteImgSectionData[pasteImgDataIdx++];
          const a = pasteImgSectionData[pasteImgDataIdx++];
                    
          // avoid adding transparency as black
          if(r === 0 &&
             g === 0 &&
             b === 0 &&
             a === 0){
            continue;
          }
          imgData.data[i+j] = r;
          imgData.data[i+j+1] = g;
          imgData.data[i+j+2] = b;
          imgData.data[i+j+3] = a;
        }
      }
            
      mainCtx.putImageData(imgData, 0, 0);
            
      pasteCanvas.parentNode.removeChild(pasteCanvas);
    }
        
    pasteCanvas.addEventListener('wheel', (evt) => {
      if(!this.rotatingPasteCanvas) return;
            
      evt.preventDefault();
            
      let newRotation = this.currPasteCanvasRotation;
            
      if(evt.deltaY > 0){
        // rotate left
        newRotation -= 1;
      }else{
        newRotation += 1;
      }
            
      newRotation %= 360;
            
      // https://stackoverflow.com/questions/17040360/javascript-function-to-rotate-a-base-64-image-by-x-degrees-and-return-new-base64
      const ctx = pasteCanvas.getContext("2d");
            
      // https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, pasteCanvas.width, pasteCanvas.height);
            
      const dHeight = (pasteCanvas.height/initialCanvasHeight)*this.originalPasteImage.height;
      const dWidth = (pasteCanvas.width/initialCanvasWidth)*this.originalPasteImage.width;
      const dx = -dWidth/2;
      const dy = -dHeight/2;
            
      ctx.setTransform(1, 0, 0, 1, pasteCanvas.width/2, pasteCanvas.height/2);
      ctx.rotate(newRotation * Math.PI / 180);
            
      ctx.drawImage(this.originalPasteImage, 0, 0, this.originalPasteImage.width, this.originalPasteImage.height, dx, dy, dWidth, dHeight);
            
      this.currPasteCanvasRotation = newRotation;
    });

    pasteCanvas.addEventListener('pointerdown', (evt) => {
      this.isMovingPasteCanvas = true;
      this.initialOffsetX = evt.offsetX;
      this.initialOffsetY = evt.offsetY;
    });
        
    pasteCanvas.addEventListener('pointermove', (evt) => {
      if(this.isMovingPasteCanvas){
        const currX = evt.offsetX;
        const currY = evt.offsetY;
                
        const offsetY = Math.abs(currY - this.initialOffsetY);
        const offsetX = Math.abs(currX - this.initialOffsetX);
                
        if(currY < this.lastOffsetHeight){
          pasteCanvas.style.top = (parseInt(pasteCanvas.style.top) - offsetY) + "px";
        }else{
          pasteCanvas.style.top = (parseInt(pasteCanvas.style.top) + offsetY) + "px";
        }
        this.lastOffsetHeight = currY;
                
        if(currX < this.lastOffsetWidth){
          pasteCanvas.style.left = (parseInt(pasteCanvas.style.left) - offsetX) + "px";
        }else{
          pasteCanvas.style.left = (parseInt(pasteCanvas.style.left) + offsetX) + "px";
        }
        this.lastOffsetWidth = currX;
      }else if(this.resizingPasteCanvas){
        // https://stackoverflow.com/questions/24429830/html5-canvas-how-to-change-putimagedata-scale
        // https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
        const ctx = pasteCanvas.getContext('2d');
                
        const x = evt.pageX;
        const y = evt.pageY;
                
        let deltaX, deltaY;
        if(this.lastX === null || x === this.lastX){
          deltaX = 0;
        }else if(x < this.lastX){
          deltaX = -1;
        }else{
          deltaX = 1;
        }
                
        if(this.lastY === null || y === this.lastY){
          deltaY = 0;
        }else if(y < this.lastY){
          deltaY = -1;
        }else{
          deltaY = 1;
        }
                
        this.lastX = x;
        this.lastY = y;
                
        // adjust the canvas dimensions,
        // then draw back the original image
        pasteCanvas.width += deltaX*2;
        pasteCanvas.height += deltaY*2;
                
        const sHeight = this.originalPasteImage.height;
        const sWidth = this.originalPasteImage.width;
        const dHeight = (pasteCanvas.height/this.initialCanvasHeight)*this.originalPasteImage.height;
        const dWidth = (pasteCanvas.width/this.initialCanvasWidth)*this.originalPasteImage.width;
        const dx = -dWidth/2;
        const dy = -dHeight/2;
                
        this.redrawImage(this.currPasteCanvasRotation, sHeight, sWidth, dx, dy, dHeight, dWidth, pasteCanvas, ctx);
      }
    });
        
    pasteCanvas.addEventListener('pointerup', () => {
      this.isMovingPasteCanvas = false;
      if(this.resizingPasteCanvas) this.resizingPasteCanvas = false;
    });
    document.body.addEventListener("pointerup", finalizeImagePaste.bind(this));
    document.addEventListener('keydown', this.allowScaleAndRotate.bind(this));
  }
    
  handlePasteEvent(evt){
    const items = (evt.clipboardData || evt.originalEvent.clipboardData).items; // items is an object of type DataTransferItemList
        
    for(let i = 0; i < items.length; i++){
      if(items[i].type.indexOf("image") > -1){
        const file = items[i]; // items[i] is a DataTransferItem type object
        const blob = file.getAsFile();
        const url = URL.createObjectURL(blob);
                
        // place the image on a new canvas (so we can allow moving it around for placement)
        const img = new Image();
        img.onload = () => {
          const pasteCanvas = this.addPasteCanvas(img, img.width, img.height);
          this.addPasteCanvasEventListeners(pasteCanvas, pasteCanvas.width, pasteCanvas.height);
          this.originalPasteImage = img;
        };
        img.src = url;
                
        break;
      }
    }
  }
}
