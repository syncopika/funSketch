/***
    TARGETED BLUR FILTER
    this function allows the user to select an area to blur.
    
    the general idea is currently this:
    - have a temp canvas overlay to draw the area to blur
    - take that selection, copy pixels over to new canvas, blur that and copy blurred pixels back to original image
    
    some functions here are taken from my selection tool experiment (selectTool.html)
***/
import { FilterTemplate } from './FilterTemplate.js';
import { Blur } from './blur.js';

class TargetedBlur extends FilterTemplate {
    constructor(animationProject){
        const params = {
            "blurFactor": {
                "value": 3,
                "min": 1,
                "max": 15,
                "step": 1,
            }
        }
        super(params);
        
        this.animationProject = animationProject; // we need to be able to access the current layer
        this.drawnLineCoords = [];
        this.isDrawing = false;
        this.alphaFlag = 0.1; // the value of alpha to use for the pixels of the offscreen canvas so we can differentiate between copied-over pixels
        this.isActive = false; // so we can't run the filter multiple times on button click
    }
    
    setupTempCanvas(){
        const currLayer = this.animationProject.getCurrFrame().getCurrCanvas();
        const displayArea = currLayer.parentNode;
        const canvasElement = document.createElement("canvas");
        displayArea.appendChild(canvasElement);
        canvasElement.className = "tempCanvasForBlur";
        canvasElement.style.position = "absolute";
        canvasElement.style.border = "1px #000 dotted";
        canvasElement.style.zIndex = 10;
        canvasElement.style.top = 0;
        canvasElement.style.left = 0;
        //canvasElement.style.opacity = 0.75;
        
        canvasElement.width = currLayer.width;
        canvasElement.height = currLayer.height;
        
        const ctx = canvasElement.getContext('2d');
        ctx.fillStyle = `rgba(204, 204, 204, 0.5)`;
        ctx.fillRect(0, 0, currLayer.width, currLayer.height);
        
        // TODO: add event listeners to temp canvas
        // record drawn line points' coordinates
        canvasElement.addEventListener('pointerdown', (evt) => {
            evt.preventDefault();
            this.isDrawing = true;
            ctx.fillStyle = "#fff";
            ctx.lineJoin = "round";
            this.drawnLineCoords = [
                {
                    'x': Math.round(evt.offsetX), 
                    'y': Math.round(evt.offsetY)
                },
            ];
        });
        
        canvasElement.addEventListener('pointerup', (evt) => {
            evt.preventDefault();
            this.isDrawing = false;
            
            // do some processing on the coordinate data of the line drawn
            this.fillInSelectionAreaGaps();
            
            this.processOnOffscreenCanvas();
            
            // done
            canvasElement.parentNode.removeChild(canvasElement);
            document.removeEventListener('keydown', abortTargetBlur);         
        });
        
        canvasElement.addEventListener('pointermove', (evt) => {
            if(!this.isDrawing){
                return;
            }
            
            evt.preventDefault();
            
            this.drawnLineCoords.push({
                'x': Math.round(evt.offsetX),
                'y': Math.round(evt.offsetY),
            });
            
            for(let i = 0; i < this.drawnLineCoords.length; i++){
                ctx.lineWidth = 3;
                ctx.beginPath();
                
                // this helps generate a solid line, rather than a line of dots.
                if(i){
                    ctx.moveTo(this.drawnLineCoords[i-1].x, this.drawnLineCoords[i-1].y);
                }
                
                // keep monitoring largest/smallest x and y values
                // so we can get max width/height of drawn area
                
                ctx.lineTo(this.drawnLineCoords[i].x, this.drawnLineCoords[i].y);
                ctx.closePath();
                ctx.stroke();
            }
        });
        
        canvasElement.addEventListener('pointerleave', (evt) => {
            this.isDrawing = false;
        });
        
        function abortTargetBlur(evt){
            if(evt.code === "Escape"){
                canvasElement.parentNode.removeChild(canvasElement);
                document.removeEventListener('keydown', abortTargetBlur);
                this.isActive = false;
            }
        }
        
        document.addEventListener('keydown', abortTargetBlur);
    }
    
    // strategy to deal with a gap in logged coordinates
    fillInSelectionAreaGaps(){
        // sort y-coords collected, find an diffs > 1, add new coords based on the diff
        const coords = this.drawnLineCoords.slice(); // make a copy because we want to append to this.drawnLineCoords
        
        for(let idx = 1; idx < coords.length; idx++){
            const lastY = coords[idx-1].y;
            const lastX = coords[idx-1].x;
            const currY = coords[idx].y;
            const currX = coords[idx].x;
            
            if(Math.abs(currY - lastY) > 1){
                // fill in any coordinates in between this one and the previous (based on y-value)
                // so we can always have a pair of coordinates for the same row if it's passed through twice
                // this ensures a record of a continuous line
                // but we also need to consider how x changes from the prev to curr coord.
                const xInterval = Math.floor( (currX - lastX) / (currY - lastY) );
                
                if(currY - lastY < 0){
                    for(let i = currY; i < lastY; i++){
                        this.drawnLineCoords.push({
                            'x': lastX + xInterval, 
                            'y': i,
                        });
                        lastX += xInterval;
                    }
                }else{
                    for(let i = lastY+1; i < currY; i++){
                        this.drawnLineCoords.push({
                            'x': lastX + xInterval, 
                            'y': i,
                        });
                        lastX += xInterval;
                    }
                }
            }
        }
    }
    
    // reorganize selection loop coordinate data
    // so that we get an object where each key is a y-value (basically the row) that maps
    // to an array containing the min and max x-values that cover the selection (the range of pixels within that row that are part of the selection)
    reorgSelectionLoopData(){
        const coords = {};
        const data = this.drawnLineCoords;
        for(let i = 0; i < data.length; i++){
            const currY = data[i].y;
            const currX = data[i].x;
            if(!coords[currY]){
                coords[currY] = {
                    maxX: currX,
                    minX: currX,
                }
            }else{
                if(currX > coords[currY].maxX){
                    coords[currY].maxX = currX;
                }else if(currX < coords[currY].minX){
                    coords[currY].minX = currX;
                }
            }
        }
        return coords;
    }
    
    // get the width, height and top-left corner of the selected area
    getSelectionAreaInfo(){
        const selectedArea = this.reorgSelectionLoopData();
        const selectedAreaKeys = Object.keys(selectedArea);
        selectedAreaKeys.sort();
        
        const topLeftY = parseInt(selectedAreaKeys[0]);
        const topLeftX = Object.values(selectedArea).reduce((acc, curr) => Math.min(acc, curr.minX), selectedArea[topLeftY].minX);
        
        const height = selectedAreaKeys[selectedAreaKeys.length-1] - topLeftY;
        const width = Object.values(selectedArea).reduce((acc, curr) => Math.max(acc, curr.maxX - curr.minX), 0);
        
        //console.log("height: " + height + ", width: " + width + ", topLeftX: " + topLeftX + ", topLeftY: " + topLeftY);
        
        return {
            width,
            height,
            topLeftX,
            topLeftY,
            selectedArea,
        }
    }
    
    getOffscreenCanvas(){
        const selectedAreaInfo = this.getSelectionAreaInfo();
        
        const height = selectedAreaInfo.height;
        const width = selectedAreaInfo.width;
        
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        
        const ctx = offscreenCanvas.getContext('2d', {willReadFrequently: true});
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alphaFlag})`; // note alpha is 0.1, which is 26 (b/c 10% of 255)
        ctx.fillRect(0, 0, width, height);
        //console.log(ctx.getImageData(0, 0, 10, 10).data);
        
        return offscreenCanvas;
    }
    
    moveOffscreenPixelsBack(offscreenCanvas){
        // based on start coord and max width and height, put the processed pixels
        // back on the current layer canvas
        const currCanvas = this.animationProject.getCurrFrame().getCurrCanvas();
        const currLayerCtx = currCanvas.getContext('2d');
        const selectedAreaInfo = this.getSelectionAreaInfo();
        
        const offscreenData = offscreenCanvas.getContext('2d').getImageData(0, 0, selectedAreaInfo.width, selectedAreaInfo.height);
        const currCanvasData = currLayerCtx.getImageData(0, 0, currCanvas.width, currCanvas.height);
        
        // use selectedAreaInfo.topLeftY to know where to start
        // we find all the pixels in the offscreen canvas that don't have a certain alpha (so we know which pixels were copied over)
        // and overwrite the matching pixels in the source image canvas
        let currLayerRow = selectedAreaInfo.topLeftY;
        for(let row = 0; row < offscreenCanvas.height; row++){
            let currLayerCol = selectedAreaInfo.selectedArea[currLayerRow].minX;
            for(let col = 0; col < offscreenCanvas.width; col++){
                // if alpha channel is not 10 (maybe make a const for this), update pixel in currCanvas
                const alpha = offscreenData.data[4*row*offscreenData.width + 4*col + 3];
                if(alpha !== Math.round(this.alphaFlag*255)){
                    currCanvasData.data[4*currLayerRow*currCanvas.width + 4*currLayerCol] = offscreenData.data[4*row*offscreenData.width + 4*col]; // r
                    currCanvasData.data[4*currLayerRow*currCanvas.width + 4*currLayerCol + 1] = offscreenData.data[4*row*offscreenData.width + 4*col + 1]; // g
                    currCanvasData.data[4*currLayerRow*currCanvas.width + 4*currLayerCol + 2] = offscreenData.data[4*row*offscreenData.width + 4*col + 2]; // b
                    currCanvasData.data[4*currLayerRow*currCanvas.width + 4*currLayerCol + 3] = alpha; // a
                    currLayerCol++;
                }
            }
            currLayerRow++;
        }
        
        // put the blurred data onto the source canvas
        currLayerCtx.putImageData(currCanvasData, 0, 0);
        
        this.isActive = false;
    }
    
    copyPixelsToOffscreenCanvas(offscreenCanvas){
        const currCanvas = this.animationProject.getCurrFrame().getCurrCanvas();
        const currLayerCtx = currCanvas.getContext('2d');
        const selectedAreaInfo = this.getSelectionAreaInfo();
        
        //const imgData = currLayerCtx.getImageData(selectedAreaInfo.topLeftX, selectedAreaInfo.topLeftY, selectedAreaInfo.width, selectedAreaInfo.height);
        //offscreenCanvas.getContext('2d').putImageData(imgData, 0, 0);
        
        //console.log(selectedAreaInfo);
        
        const offscreenData = offscreenCanvas.getContext('2d').getImageData(0, 0, selectedAreaInfo.width, selectedAreaInfo.height);
        const currCanvasData = currLayerCtx.getImageData(0, 0, currCanvas.width, currCanvas.height).data;
        let offscreenRow = 0;
        for(let row = selectedAreaInfo.topLeftY; row < selectedAreaInfo.topLeftY + selectedAreaInfo.height; row++){
            const minX = selectedAreaInfo.selectedArea[row].minX;
            const maxX = selectedAreaInfo.selectedArea[row].maxX;
            
            let offscreenCol = 0;
            
            for(let col = selectedAreaInfo.topLeftX; col < selectedAreaInfo.topLeftX + selectedAreaInfo.width; col++){
                const r = currCanvasData[row*4*currCanvas.width + col*4];
                const g = currCanvasData[row*4*currCanvas.width + col*4 + 1];
                const b = currCanvasData[row*4*currCanvas.width + col*4 + 2];
                const a = currCanvasData[row*4*currCanvas.width + col*4 + 3];
                    
                if(col >= minX && col <= maxX){
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4] = r;
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4 + 1] = g;
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4 + 2] = b;
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4 + 3] = a;                    
                }else{
                    // copy over pixels but change alpha so we know not to copy them back after blurring
                    // since they're outside the selected area (but we need them when blurring)
                    // if you don't use them, the default #fff pixels on the offscreen canvas get factored in the blur, which is not desirable
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4] = r;
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4 + 1] = g;
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4 + 2] = b;
                    offscreenData.data[offscreenRow*4*offscreenCanvas.width + offscreenCol*4 + 3] = Math.round(this.alphaFlag*255);
                }
                
                offscreenCol++;
            }
            
            offscreenRow++;
        }
        
        offscreenCanvas.getContext('2d').putImageData(offscreenData, 0, 0);
        
        // for debugging
        //offscreenCanvas.style.border = '1px solid #000';
        //offscreenCanvas.style.margin = '10px';
        //document.body.appendChild(offscreenCanvas);
    }
    
    processOnOffscreenCanvas(){
        // create a new canvas with the max width and height
        const offscreenCanvas = this.getOffscreenCanvas();
        
        // take the pixels (from the current layer) within that area and copy it to the new canvas
        this.copyPixelsToOffscreenCanvas(offscreenCanvas);
        
        // blur that canvas
        const blurFilter = new Blur();
        blurFilter.params.blurFactor.value = this.params.blurFactor.value;
        
        const offscreenImgData = offscreenCanvas.getContext('2d').getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const blurredData = blurFilter.filter(offscreenImgData);
        offscreenCanvas.getContext('2d').putImageData(blurredData, 0, 0);
        
        // copy the pixels back (excluding the pixels outside the drawn area - use alpha channel to differentiate?)
        this.moveOffscreenPixelsBack(offscreenCanvas);
    }
    
    doTargetedBlur(){
        // create a temp canvas to draw the area to blur. impose the temp canvas on the current canvas
        this.setupTempCanvas();
    }
    
    filter(pixels){
        // do targeted blur
        if(this.isActive){
            return pixels;
        }
        
        this.isActive = true;
        
        this.doTargetedBlur();
        
        return pixels;
    }
}

export {
    TargetedBlur
};