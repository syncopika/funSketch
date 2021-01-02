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
	constructor(container, number){
		this.currentIndex = 0; // index of currently showing layer
		this.canvasList = []; // keep a list of all canvas instances
		this.currentCanvas; // the current, active canvas being looked at (reference to html element)
		this.container = container; // this is the html container id to hold all the layers of this frame
		this.number = number; // thid frame's number
		this.count = 0; // current number of layers
		this.width = 0;
		this.height = 0;
	}
	
    getMetadata(){
        return {
			'width': this.width,
			'height': this.height,
            'containerId': container,
            'currentIndex': this.currentIndex,
            'number': this.number
        };
    }
	
	// do we need this? since we have this.currentCanvas... :|
    getCurrCanvas(){
        return this.canvasList[this.currentIndex];
    }
	
    /***
        set up a new canvas element
        makes the new canvas the current canvas
    ***/
    setupNewLayer(){
        // create the new canvas element 
        let newCanvas = document.createElement('canvas');
        newCanvas.id = `frame${this.number}canvas${this.count}`;
		document.getElementById(this.container).appendChild(newCanvas);
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
	
    hide(){
        // puts all layers at zIndex -1 so they're not visible
        this.canvasList.forEach((canvas) => {
			canvas.style.zIndex = -1;
			canvas.style.visibility = "hidden";
			canvas.style.cursor = "";
        });
    }
	
    show(){
        // makes all layers visible
		let activeLayerOpacity = .97;
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
	
	setToLayer(layerIndex, onionSkin){
		// note that this does not hide the previous layer + previous onion skin before switching to 
		// the new layer.

		let newLayer = this.canvasList[layerIndex];
		//console.log(newLayer);
		
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
    ***/
    copyCanvas(){
        let newCanvas = document.createElement('canvas');
        newCanvas.id = 'frame' + this.number + 'canvas' + this.count;
        setCanvas(newCanvas, this.width, this.height);
        this.canvasList[this.count-1].style.opacity = .97;
        // place the canvas in the container 
        document.getElementById(container).appendChild(newCanvas);
        // position the new canvas directly on top of the previous one 
        let canvas = document.getElementById(this.canvasList[0].id);
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
	constructor(container){
		this.name = "";
		this.currentFrame = 0; // index of current frame
		this.speed = 100; // 100 ms per frame 
		this.frameList = [];
		this.onionSkinFrame = createOnionSkinFrame(container);
		this.onionSkinFrame.style.display = 'none'; // hide it initially
		this.container = container; // id of the html element the frames are displayed in
	}
	
    resetProject(){
        this.frameList.forEach(function(frame, frameIndex){ 
            let parent = document.getElementById(frame['container']);
            // just keep the first frame
            frame.canvasList.forEach(function(layer, layerIndex){
                if (frameIndex > 0 || (frameIndex === 0 && layerIndex > 0)) {
                    parent.removeChild(layer);
                }
            });
			if(frameIndex === 0){
				frame.canvasList = [frame.canvasList[0]];
				frame.currentIndex = 0;
				frame.currentCanvas = frame.canvasList[0];
			}
        });
        this.frameList = [this.frameList[0]];
		
        // clear the first layer of the first frame!
        this.frameList[0].clearCurrentLayer();
        this.currentFrame = 0;
        this.speed = 100;
		
		this.frameList[0].currentCanvas.style.visibility = "";
		this.clearOnionSkin();
    }
	
    addNewFrame(showFlag){
        let newFrame = new Frame(this.container, this.frameList.length);
        newFrame.setupNewLayer();
        this.frameList.push(newFrame);
        if(!showFlag){
            newFrame.hide();
        }
    }
	
	deleteFrame(index){
		
		// don't allow removal if only one frame exists
		if(this.frameList.length === 1){
			return false;
		}
		
		let frame = this.frameList[index];
		
		// remove frame from frameList
		this.frameList.splice(index, 1);
		
		let parentContainer = document.getElementById(frame['container']);
		
		// remove all layers
		frame.canvasList.forEach((layer) => {
			parentContainer.removeChild(layer);
		});
		
		return true;
	}
	
    nextFrame(){
        if(this.frameList.length === this.currentFrame + 1){
            return null; // no more frames to see
        }
        this.currentFrame += 1;
		this.updateOnionSkin()
        return this.frameList[this.currentFrame];
    }
	
    prevFrame(){
        if(this.currentFrame - 1 < 0){
            return null; // no more frames to see
        }
        this.currentFrame -= 1;
		this.updateOnionSkin();
        return this.frameList[this.currentFrame];
    }
	
    getCurrFrame(){
        return this.frameList[this.currentFrame];
    }
	
    updateOnionSkin(){
        if(this.currentFrame - 1 < 0){
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
        let prevFrame = this.frameList[this.currentFrame-1];
        prevFrame.canvasList.forEach(function (layer) {
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

// assigns position, z-index, border, width, height and opacity
function setCanvas(canvasElement){
	canvasElement.style.position = "absolute";
    canvasElement.style.border = '1px #000 solid';
    canvasElement.style.zIndex = 0;
    canvasElement.style.opacity = 0;
	canvasElement.style.width = "100%";
	canvasElement.style.height = "100%";
	canvasElement.width = canvasElement.offsetWidth;
	canvasElement.height = canvasElement.offsetHeight;
    canvasElement.getContext("2d").fillStyle = "rgba(255,255,255,255)";
    canvasElement.getContext("2d").fillRect(0, 0, canvasElement.width, canvasElement.height);
}

export{
	Frame,
	AnimationProject,
	createOnionSkinFrame,
	setCanvas
};
