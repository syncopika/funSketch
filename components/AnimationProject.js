// TODO: have an animation mode and a paint mode? in paint mode, you can do all the layering per frame and stuff.
// in animation mode, we process all the frames and for each one condense all their layers into a single frame.
// then we can use those frames in an animation.
// to optimize performance when going into animation mode, maybe cache which frames are 'tainted' from the last time 
// animation mode was switched to.
import React from 'react';

/***
    a class representing a frame, containing a list of canvas elements which represent layers of the frame
***/
class Frame {
	constructor(containerId, number){
		this.currentIndex = 0; // index of currently showing layer
		this.canvasList = []; // keep a list of all canvas instances
		this.currentCanvas; // the current, active canvas being looked at (reference to html element)
		this.containerId = containerId; // this is the html container id to hold all the layers of this frame
		this.number = number; // this frame's number
		this.count = 0; // current number of layers
		this.width = 0;
		this.height = 0;
	}
	
    getMetadata(){
        return {
			'width': this.width,
			'height': this.height,
            'containerId': this.containerId,
            'currentIndex': this.currentIndex,
            'number': this.number
        };
    }
	
	getContainerId(){
		return this.containerId;
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
    ***/
    setupNewLayer(){
        // create the new canvas element 
        let newCanvas = document.createElement('canvas');
        newCanvas.id = `frame${this.number}canvas${this.count}`;
        document.getElementById(this.containerId).appendChild(newCanvas);
        setCanvas(newCanvas);
        if(this.count === 0){
            newCanvas.style.opacity = .97;
            newCanvas.style.zIndex = 1;
			newCanvas.style.cursor = "crosshair";
			this.width = newCanvas.width;
			this.height = newCanvas.height;
        }
        // set new canvas to be the current canvas only initially!
        if(this.count === 0){
            this.currentCanvas = newCanvas;
        }
        this.canvasList.push(newCanvas);
        this.count++;
    }
	
	_showLayer(canvas){
		canvas.style.opacity = .97;
		canvas.style.zIndex = 1;
		canvas.style.cursor = "crosshair";
	}

	_hideLayer(canvas){
		canvas.style.opacity = 0;
		canvas.style.zIndex = 0;
		canvas.style.cursor = "";
	}
	
	// make current canvas an onion skin
	_makeCurrLayerOnion(canvas){
		canvas.style.opacity = .92; // apply onion skin to current canvas 
		canvas.style.zIndex = 0;
		canvas.style.cursor = "";
	}
	
    nextLayer(){
        // this moves the current layer to the next one if exists
        if(this.currentIndex + 1 < this.canvasList.length){
            // move to next canvas and apply onion skin to current canvas
			let currLayer = this.currentCanvas;
            this._makeCurrLayerOnion(currLayer);
            
			// in the special case for when you want to go to the next canvas from the very first one, 
            // ignore the step where the opacity and z-index for the previous canvas get reset to 0.
            if(currLayer.currentIndex > 0){
				let prevLayer = this.canvasList[this.currentIndex - 1];
                // reset opacity and z-index for previous canvas (because of onionskin)
                this._hideLayer(prevLayer);
            }
            // show the next canvas 
			let nextLayer = this.canvasList[this.currentIndex + 1];
            this._showLayer(nextLayer);
			
            this.currentCanvas = nextLayer;
            this.currentIndex++;
			
            return true;
        }
        return false;
    }
	
    prevLayer(){
        // this moves the current layer to the previous one if exists
        if(this.currentIndex - 1 >= 0){
            // move to previous canvas
			let currLayer = this.currentCanvas;
            this._hideLayer(currLayer);
            
			// make previous canvas visible 
			let prevLayer = this.canvasList[this.currentIndex - 1];
            this._showLayer(prevLayer);
            
			// if there is another canvas before the previous one, apply onion skin
            if(this.currentIndex - 2 >= 0){
                this.canvasList[this.currentIndex - 2].style.opacity = .92;
            }
            this.currentCanvas = prevLayer;
            this.currentIndex--;
			
            return true;
        }
        return false;
    }
	
    hide(){
        // makes all layers not visible
        this.canvasList.forEach((canvas) => {
			canvas.style.zIndex = -1;
			canvas.style.visibility = "hidden";
			canvas.style.cursor = "";
        });
    }
	
    show(){
        // makes all layers visible
		const activeLayerOpacity = .97;
        this.canvasList.forEach((canvas) => {
			if(canvas.style.opacity >= activeLayerOpacity){
				canvas.style.zIndex = 1;
			}else{
				canvas.style.zIndex = 0;
			}
			canvas.style.visibility = "";
			canvas.style.cursor = "crosshair";		
        });
    }
	
	// layerIndex (int) = the index of the layer to make active (current layer)
	// onionSkin (bool) = whether onionskin should be visible 
	setToLayer(layerIndex, onionSkin){
		// note that this does not hide the previous layer + previous onion skin before switching to 
		// the new layer.
		let newLayer = this.canvasList[layerIndex];
		newLayer.style.opacity = 0.97;
		newLayer.style.zIndex = 1;
		
		this.currentCanvas = newLayer;
		this.currentIndex = layerIndex;
		
		if(onionSkin && (layerIndex-1 > 0)){
			// apply onionskin
			let prevLayer = this.canvasList[layerIndex-1];
            prevLayer.style.opacity = .92;
			prevLayer.style.zIndex = 0;
		}
	}
	
    /***
        clone the current canvas
		this creates a new layer whose image data is the same as the current canvas.
		
		not sure I'm using this?
    ***/
    copyCanvas(){
        let newCanvas = document.createElement('canvas');
        newCanvas.id = `frame${this.number}canvas${this.count}`;
        setCanvas(newCanvas, this.width, this.height);
        newCanvas.style.opacity = 0.97;
        document.getElementById(this.containerId).appendChild(newCanvas);
		newCanvas.getContext("2d").drawImage(this.currentCanvas, 0, 0);
        this.canvasList.push(newCanvas);
        this.count++;
    }
	
    clearCurrentLayer(){
        let currLayer = this.getCurrCanvas();
        let context = currLayer.getContext("2d");
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
	constructor(containerId){
		this.name = "";
		this.currentFrameIndex = 0; // index of current frame
		this.speed = 100; // 100 ms per frame 
		this.frameList = [];
		this.onionSkinFrame = createOnionSkinFrame(containerId);
		this.onionSkinFrame.style.display = 'none'; // hide it initially
		this.containerId = containerId; // id of the html element the frames are displayed in
	}
	
	getContainerId(){
		return this.containerId;
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
            const parent = document.getElementById(frame.getContainerId());
            // just keep the first frame
            frame.canvasList.forEach(function(layer, layerIndex){
                if (frameIndex > 0 || (frameIndex === 0 && layerIndex > 0)) {
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
        let newFrame = new Frame(this.containerId, this.frameList.length);
        newFrame.setupNewLayer();
        this.frameList.push(newFrame);
        if(!showFlag){
            newFrame.hide();
        }
    }
	
	deleteFrame(index){
		// don't allow removal if only one frame exists
		if(this.frameList.length === 1 || index < 0 || index > this.frameList.length - 1){
			return false;
		}
		
		const frame = this.frameList[index];
		
		// remove frame from frameList
		this.frameList.splice(index, 1);
		
		const parentContainer = document.getElementById(frame.getContainerId());
		
		// remove all layers
		frame.getLayers().forEach((layer) => {
			parentContainer.removeChild(layer);
		});
		
		return true;
	}
	
    nextFrame(){
        if(this.frameList.length <= this.currentFrameIndex + 1){
            return null; // no more frames to see
        }
        this.currentFrameIndex += 1;
		this.updateOnionSkin();
        return this.frameList[this.currentFrameIndex];
    }
	
    prevFrame(){
        if(this.currentFrameIndex - 1 < 0){
            return null; // no more frames to see
        }
        this.currentFrameIndex -= 1;
		this.updateOnionSkin();
        return this.frameList[this.currentFrameIndex];
    }
	
    updateOnionSkin(){
        if(this.currentFrameIndex - 1 < 0){
			// no onionskin for very first frame 
			this.onionSkinFrame.style.opacity = 0;
            return;
        }
        this.onionSkinFrame.style.display = ''; // show onion skin
        let onionSkinCtx = this.onionSkinFrame.getContext("2d");
        onionSkinCtx.clearRect(0, 0, this.onionSkinFrame.width, this.onionSkinFrame.height);
        // take the previous frame, merge all layers, put into onion skin frame
        // try this? only draw pixels that are non-white?
        let onionSkinImageData = onionSkinCtx.getImageData(0, 0, this.onionSkinFrame.width, this.onionSkinFrame.height);
        // build the merged image from the first to last
        let prevFrame = this.frameList[this.currentFrameIndex-1];
        prevFrame.getLayers().forEach(function (layer) {
            let imageData = layer.getContext("2d").getImageData(0, 0, layer.width, layer.height).data;
            for(let i = 0; i < imageData.length; i += 4) {
                if (imageData[i] === 255 && imageData[i+1] === 255 && imageData[i+2] === 255) {
                    continue;
                }
                else {
                    // what if the canvas we're getting image data from to draw on the onion skin is LARGER than the onion skin canvas.
                    // we might run into index/length issues...
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
		let onionSkin = this.onionSkinFrame;
		let context = this.onionSkinFrame.getContext("2d");
        context.clearRect(0, 0, onionSkin.getAttribute('width'), onionSkin.getAttribute('height'));
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, onionSkin.getAttribute('width'), onionSkin.getAttribute('height'));
	}
	
}

function createOnionSkinFrame(container){
    // create the new canvas element 
    let newCanvas = document.createElement('canvas');
    newCanvas.id = "onionSkinCanvas";
	document.getElementById(container).appendChild(newCanvas);
    setCanvas(newCanvas);
    newCanvas.style.opacity = .97;
    newCanvas.style.zIndex = -1; // TODO: come back to this later. make sure it's visible if current frame > 1!
    return newCanvas;
}

// assigns default canvas attributes and styling
function setCanvas(canvasElement, width, height){
	canvasElement.style.position = "absolute";
    canvasElement.style.border = '1px #000 solid';
    canvasElement.style.zIndex = 0;
    canvasElement.style.opacity = 0;
	canvasElement.style.width = "100%";
	canvasElement.style.height = "100%";
	canvasElement.width = width ? width : canvasElement.offsetWidth;
	canvasElement.height = height ? height : canvasElement.offsetHeight;
    canvasElement.getContext("2d").fillStyle = "rgba(255,255,255,255)";
    canvasElement.getContext("2d").fillRect(0, 0, canvasElement.width, canvasElement.height);
}

export{
	Frame,
	AnimationProject,
	createOnionSkinFrame,
	setCanvas
};
