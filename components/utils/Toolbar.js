
class Toolbar {
	constructor(brush, animationProj){
		// used as a flag for the animation playback features
		this.play = null;

		// used to hold user-indicated time (ms) per frame for animation playback and gif
		this.timePerFrame = 200; // set to 200 be default
		// should the keyboard keys be affecting the layer or the frame? 2 options only
		// this is useful for the arrow keys and space bar
		this.layerMode = true;
		this.htmlCounter = ""; // html element used as a counter specifying the current frame and layer
		
		this.brush = brush;
		this.animationProj = animationProj;
	}
	
    setCounter(elementId){
        this.htmlCounter = document.getElementById(elementId);
    }
	
    nextLayer(){
		this.brush.resetBrush();
        let frame = this.animationProj.getCurrFrame();
		let result = frame.nextLayer();
		// TODO: can we figure out a better way to handle brushes?
        this.brush.applyBrush(); // apply brush whether or not layer changed because it was reset initially
		return result;
    }
	
    prevLayer(){
		this.brush.resetBrush();
        let frame = this.animationProj.getCurrFrame();
        let result = frame.prevLayer();
		this.brush.applyBrush();
        return result;
    }
	
	setCurrLayer(layerIndex){
		// true to show onion skin of prev layer (when would we not?)
		this.animationProj.getCurrFrame().setToLayer(layerIndex, true);
	}
	
    nextFrame(){
		this.brush.resetBrush();
        let curr = this.animationProj.getCurrFrame();
        let next = this.animationProj.nextFrame();
        this.brush.applyBrush();
		if(next !== null){
            curr.hide();
            next.show();
			return true;
        }
        return false;
    }
	
    prevFrame(){
		this.brush.resetBrush();
        let curr = this.animationProj.getCurrFrame();
        let prev = this.animationProj.prevFrame();
        this.brush.applyBrush();
		if(prev !== null){
            curr.hide();
            prev.show();
            return true;
        }
        return false;
    }
	
    goToFrame(frameIndex){
		this.brush.resetBrush();
        let curr = this.animationProj.getCurrFrame();
        let destFrame = this.animationProj.goToFrame(frameIndex);
        this.brush.applyBrush();
		if(destFrame !== null){
            curr.hide();
            destFrame.show();
            return true;
        }
        return false;
    }
	
    addNewLayer(){
        let canvas = this.animationProj.getCurrFrame();
        canvas.setupNewLayer();
    }
	
	insertNewLayer(){
		let canvas = this.animationProj.getCurrFrame();
		// add a new canvas first 
		canvas.setupNewLayer();
		// then move it after the current canvas 
		let newestCanvas = canvas.canvasList.pop();
		canvas.canvasList.splice(canvas.currentIndex + 1, 0, newestCanvas);
		return newestCanvas;
	}

    /***
        insert a new layer after the current layer
    ***/
    insertLayer(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.insertNewLayer();
        });
    }
	
	/***
		duplicate the current layer
		note: the next layer after the current will have identitcal image data
	***/
	duplicateLayer(elementId){
		document.getElementById(elementId).addEventListener('click', () => {
			let currentCanvas = this.animationProj.getCurrFrame().currentCanvas;
			let newLayer = this.insertNewLayer();
			newLayer.getContext('2d').drawImage(currentCanvas, 0, 0);
		});
	}
	
    /***
        delete current layer
        shifts the current layer to the next one if there is one.
        otherwise, the previous layer will become the current one.
        if there isn't a previous one either, then the layer will just be made blank.
    ***/
    deleteLayer(elementId, setStateFunction){
        // elementId here refers to the display that shows current frame and layer
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
            const oldLayerIndex = frame.getCurrCanvasIndex();
			const oldLayer = frame.getCurrCanvas();
            const parentNode = document.getElementById(oldLayer.id).parentNode;
			const layerList = frame.getLayers();
			
            if(oldLayerIndex + 1 < layerList.length || oldLayerIndex - 1 >= 0){
                frame.deleteLayer(oldLayerIndex);
                parentNode.removeChild(oldLayer);
				this.brush.applyBrush();
            }else{
                // otherwise, just blank the canvas 
                let context = oldLayer.getContext("2d");
                context.clearRect(0, 0, oldLayer.getAttribute('width'), oldLayer.getAttribute('height'));
                context.fillStyle = "#fff";
                context.fillRect(0, 0, oldLayer.getAttribute('width'), oldLayer.getAttribute('height'));
            }
			
			setStateFunction(frame.getCurrCanvasIndex());
        });
    }
	
    /***
		add a new frame
    ***/
    addNewFrameButton(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.animationProj.addNewFrame();
        });
    }
	
    /***
		duplicate current frame
    ***/
    copyCurrFrameButton(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.animationProj.copyCurrFrame();
        });
    }
	
	/***
		delete current frame
	***/
	deleteCurrentFrameButton(elementId, setStateFunction){
        document.getElementById(elementId).addEventListener('click', () => {
			let currFrameIdx = this.animationProj.getCurrFrameIndex();
            
			// move to another frame first before deleting
			if(currFrameIdx - 1 >= 0){
				this.prevFrame();
			}else{
				// go forward a frame
				this.nextFrame();
			}
			if(this.animationProj.deleteFrame(currFrameIdx)){	
				setStateFunction(currFrameIdx); // the index of the frame we deleted
			}
        });
	}
	
	/***
		change layer order for current frame on button press
	***/
	changeCurrentFrameLayerOrder(elementId, setStateFunction){
		document.getElementById(elementId).addEventListener('click', () => {
			// I'm not sure why right now but something weird happens after calling 
			// changeCurrentFrameLayerOrder for the first time.
			// it acts as expected but also I get an error saying setStateFunction is undefined 
			// in the console. :/ so for now check if setStateFunction is not undefined?
			if(setStateFunction){
				setStateFunction(null);
			}
		});
	}
	
    /***
        color wheel functions
    ***/
    // pass in the elementId of the div where the color wheel should be 
    // pass in the size of the canvas of the color wheel 
    createColorWheel(elementId, size){
        let location = document.getElementById(elementId);
        
		let colorWheel = document.createElement('canvas');
        colorWheel.id = "colorWheel";
        colorWheel.setAttribute('width', size);
        colorWheel.setAttribute('height', size);
        
		let colorWheelContext = colorWheel.getContext('2d');
        let x = colorWheel.width / 2;
        let y = colorWheel.height / 2;
        let radius = 90;
       
	   // why 5600??
        for(let angle = 0; angle <= 5600; angle++) {
            let startAngle = (angle - 2) * Math.PI / 180; //convert angles to radians
            let endAngle = (angle) * Math.PI / 180;
            colorWheelContext.beginPath();
            colorWheelContext.moveTo(x, y);
            //.arc(x, y, radius, startAngle, endAngle, anticlockwise)
            colorWheelContext.arc(x, y, radius, startAngle, endAngle, false);
            colorWheelContext.closePath();
            //use .createRadialGradient to get a different color for each angle
            //createRadialGradient(x0, y0, r0, x1, y1, r1)
            let gradient = colorWheelContext.createRadialGradient(x, y, 0, startAngle, endAngle, radius);
            gradient.addColorStop(0, 'hsla(' + angle + ', 10%, 100%, 1)');
            gradient.addColorStop(1, 'hsla(' + angle + ', 100%, 50%, 1)');
            colorWheelContext.fillStyle = gradient;
            colorWheelContext.fill();
        }
		
        // make black a pickable color 
        colorWheelContext.fillStyle = "#000";
		colorWheelContext.beginPath();
        colorWheelContext.arc(10, 10, 8, 0, 2*Math.PI);
		colorWheelContext.fill();
		
        // make white pickable too
		
		// black outline
		colorWheelContext.beginPath();
        colorWheelContext.arc(30, 10, 8, 0, 2*Math.PI); // border around the white 
        colorWheelContext.stroke();
		
		// make sure circle is filled with #fff
		colorWheelContext.fillStyle = "#fff";
        colorWheelContext.arc(30, 10, 8, 0, 2*Math.PI);
		colorWheelContext.fill();
		
        location.appendChild(colorWheel);
		
        // make the color wheel interactive and show picked color 
        let showColor = document.createElement('p'); // this element will show the color picked 
        showColor.style.textAlign = 'center';
        showColor.id = 'colorPicked';
        showColor.textContent = "pick a color! :)";
        location.appendChild(showColor);
        
		document.getElementById(colorWheel.id).addEventListener('mousedown', (evt) => {
            let x = evt.offsetX;
            let y = evt.offsetY;
            let colorPicked = (document.getElementById(colorWheel.id).getContext('2d')).getImageData(x, y, 1, 1).data;
			
            //correct the font color if the color is really dark
			let colorPickedText = document.getElementById(showColor.id);
			if(colorPicked[0] > 10 && colorPicked[1] > 200){
                colorPickedText.style.color = "#000";
            }else{
                colorPickedText.style.color = "#FFF";
            }
			
            colorPickedText.textContent = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
            colorPickedText.style.backgroundColor = colorPickedText.textContent;
            
			// update current color seleted in brush object as Uint8 clamped array where each index corresponds to r,g,b,a
            this.brush.changeBrushColor(colorPicked);
			//this.brush.currColorArray = colorPicked;
            //this.brush.currColor = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
        });
    }

	
    /***
        rotate image
        pass in an element id that will rotate the current canvas image on click
        
        currently buggy! after rotation, image becomes blurred. also, when attempting to draw on same canvas,
        coordinates get altered so on mousedown the drawing gets offset
    ***/
    rotateImage(elementId){
        //rotate image
        document.getElementById(elementId).addEventListener('click', () => {
            let canvas = this.animationProj.getCurrFrame();
            //using a promise to convert the initial image to a bitmap
            let width = canvas.currentCanvas.getAttribute("width");
            let height = canvas.currentCanvas.getAttribute("height");
            let context = canvas.currentCanvas.getContext("2d");
            Promise.all([
                createImageBitmap(canvas.currentCanvas, 0, 0, width, height)
            ]).then(function(bitmap){
                context.clearRect(0, 0, width, height);
                context.translate(width / 2, height / 2);
                context.rotate((Math.PI) / 180);
                context.translate(-width / 2, -height / 2);
                //the returned bitmap is an array
                context.drawImage(bitmap[0], 0, 0);
            });
        });
    }
	
    /***
        clear the current canvas
        pass in an element id that will execute clear canvas onclick
    ***/
    setClearCanvas(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
            const context = frame.currentCanvas.getContext("2d");
            const width = frame.currentCanvas.getAttribute("width");
            const height = frame.currentCanvas.getAttribute("height");
            context.clearRect(0, 0, width, height);
            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, width, height);
        });
    }
	
    /***
        undo a previous drawing operation on the current canvas.
        still a little incorrect? - TODO: needs work
		- problem: undo affects all layers and is not specific to one canvas (which it should)
		  maybe the frame class should store layer info for undo
    ***/
    undo(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            const frame = this.animationProj.getCurrFrame();
			const currLayer = frame.getCurrCanvas();
            const context = currLayer.getContext("2d");
            const width = currLayer.getAttribute("width");
            const height = currLayer.getAttribute("height");
			const currLayerSnapshots = frame.getSnapshots();
			
            // then put back last image (ignore the one that had just been drawn)
            if(currLayerSnapshots.length > 1){
                let mostRecentImage = currLayerSnapshots.pop();
				
				// unfortunately, we might need to pop again b/c if we just finished drawing and want to undo,
				// the first one on the stack is the image we just finished drawing
				// but this operation seems fast enough
				const currImgData = context.getImageData(0, 0, width, height).data;
				let isSameImage = true;
				for(let i = 0; i < currImgData.length; i++){
					if(currImgData[i] !== mostRecentImage.data[i]){
						isSameImage = false;
						break;
					}
				}
				if(isSameImage){
					mostRecentImage = currLayerSnapshots.pop();
				}
				
				context.clearRect(0, 0, width, height);
                context.putImageData(mostRecentImage, 0, 0);
				
				// but then put it back on the stack
				frame.addSnapshot(mostRecentImage);
				
            }else if(currLayerSnapshots.length === 1){
				context.putImageData(currLayerSnapshots[0], 0, 0);
			}
        });
    }
	
    /***
        import an image
    ***/
    importImage(elementId){
		const self = this;
		
        document.getElementById(elementId).addEventListener('click', () => {
			const canvas = this.animationProj.getCurrFrame();
            
			// call fileHandler here
            fileHandler();
            
			// define fileHandler 
            function fileHandler(){
                //initiate file choosing after button click
                let input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
			
            function getFile(e){
                let img = new Image();
                let reader = new FileReader();
                let file = e.target.files[0];
                if (!file.type.match(/image.*/)){
                    console.log("not a valid image");
                    return;
                }
                //when the image loads, put it on the canvas.
                img.onload = () => {
                    // change current canvas' width and height according to imported picture
                    let currentCanvas = canvas.currentCanvas;
                    let context = currentCanvas.getContext("2d");
                    let height = img.height;
                    let width = img.width;

					height = canvas.height;
					width = canvas.width;
					currentCanvas.setAttribute('height', height);
					currentCanvas.setAttribute('width', width);
                    
                    context.drawImage(img, 0, 0, width, height);
					
					canvas.addSnapshot(currentCanvas.getContext("2d").getImageData(0, 0, width, height));
                };
                //after reader has loaded file, put the data in the image object.
                reader.onloadend = function(){ 
                    img.src = reader.result;
                };
                //read the file as a URL
                reader.readAsDataURL(file);
            }
        });
    }
	
    /***
        reset the canvas to most recent imported image
    ***/
    resetImage(){
        if(this.recentImage){
            let canvas = this.animationProj.getCurrFrame();
            let context = canvas.currentCanvas.getContext("2d");
            let height = canvas.currentCanvas.getAttribute("height");
            let width = canvas.currentCanvas.getAttribute("width");
            context.drawImage(this.recentImage, 0, 0, width, height);
        }
    }
	
    /***
        download a png file of the current layer
    ***/
    downloadLayer(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            // get image data from current canvas as blob
			let canvas = this.animationProj.getCurrFrame();
            let data = document.getElementById(canvas.currentCanvas.id).toBlob((blob) => {
                let url = URL.createObjectURL(blob);
                let link = document.createElement('a');
                link.href = url;
                let name = prompt("please enter a name for the file");
                if(name === null) {
                    return;
                }else{
                    link.download = name;
                    //simulate a click on the blob's url to download it 
                    link.click();
                }
            });
        });
    }
	
	/***
		download a png file of the current frame
	***/
	downloadFrame(elementId){
		document.getElementById(elementId).addEventListener('click', () => {
			let frame = this.animationProj.getCurrFrame();
			let mergedLayers = this.mergeFrameLayers(frame);
			let data = mergedLayers.toBlob((blob) => {
                let url = URL.createObjectURL(blob);
                let link = document.createElement('a');
                link.href = url;
                let name = prompt("please enter a name for the file");
                if(name === null) {
                    return;
                }else{
                    link.download = name;
                    link.click();
                }
			});
		});
	}
	
    /********
    
        this section controls the animation playback features
        
        note that I specifically added my page counter element to the
        functions so that they change with the call to up() and down()

        this will need to be applied for FRAMES, not LAYERS of a frame.
    
    *********/
    //let toolbar = this;
    playFor(){
        if(this.nextFrame()){
            if(this.htmlCounter){
                let counterText = this.htmlCounter;
                counterText.textContent = "frame: " + (this.animationProj.currentFrame + 1) + ", layer: " + (canvas.currentIndex + 1);
            }
        }
    }
	
    playBack(){
        if(this.prevFrame()){
            if(this.htmlCounter){
                let counterText = this.htmlCounter;
                counterText.textContent = "frame: " + (this.animationProj.currentFrame + 1) + ", layer: " + (canvas.currentIndex + 1);
            }
        }
    }
	
    playForward(){
        clearInterval(this.play);
        this.play = null;
        this.play = setInterval(this.playFor, this.timePerFrame);
    }
	
    playBackward(){
        clearInterval(this.play);
        this.play = null;
        this.play = setInterval(this.playBack, this.timePerFrame);
    }
	
    stop(){
        clearInterval(this.play);
        this.play = null;
    }
	
	mergeFrameLayers(frame){
		let tempCanvas = document.createElement('canvas');
		let tempCtx = tempCanvas.getContext("2d");
		tempCanvas.width = frame.width;
		tempCanvas.height = frame.height;
		tempCtx.fillStyle = "white";
		tempCtx.fillRect(0, 0, frame.width, frame.height);
		let tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

		for(let j = 0; j < frame.canvasList.length; j++){
			let layer = frame.canvasList[j];
			// possible issue: this assumes that all layers within a frame share the same dimensions (but it should be that way, right?)
			let imageData = layer.getContext("2d").getImageData(0, 0, frame.width, frame.height).data;
			for(let k = 0; k < imageData.length; k += 4){
				if(imageData[k] === 255 && imageData[k+1] === 255 && imageData[k+2] === 255){
					continue;
				}else{
					// what if the canvas we're getting image data from to draw on the onion skin is LARGER than the onion skin canvas.
					// we might run into index/length issues...
					tempImageData.data[k] = imageData[k];
					tempImageData.data[k+1] = imageData[k+1];
					tempImageData.data[k+2] = imageData[k+2];
					tempImageData.data[k+3] = 255;
				}
			}
			// apply each layer to the onion skin
			tempCtx.putImageData(tempImageData, 0, 0);
		}
		return tempCanvas;
	}

	
    /***
    
        create a gif from the frames.
        using gif.js - https://github.com/jnordberg/gif.js
    
        elementId is for the loading message,
        i.e. a <p> element that says "now loading..."
        
        this will need to be applied for FRAMES, not LAYERS of a frame.
    
		timeMarkers (dictionary): a dictionary mapping frames to their time delay (millisec), i.e.
		{
			1: 100, // frame 1
			2: 1000 // frame 2
		}
    ***/
    getGif(elementId, timelineMarkers){
        if(elementId){
            document.getElementById(elementId).textContent = "now loading...";
        }
        let gif = new GIF({
            workers: 2,
            quality: 10
        });
        // add frames + take into account frame rate given by timelineMarkers
        for(let i = 0; i < this.animationProj.frameList.length; i++){
            let tempCanvas = this.mergeFrameLayers(this.animationProj.frameList[i]);
			let frameTime = timelineMarkers[i+1] ? timelineMarkers[i+1] : this.timePerFrame;
            gif.addFrame(tempCanvas, { delay: frameTime });
        }
        gif.on('finished', function(blob){
            document.getElementById(elementId).textContent = "";
            let newGif = URL.createObjectURL(blob);
            window.open(newGif);
        });
        gif.render();
    }
	
    /***
    
        save/export & import functions
        check this out: https://stackoverflow.com/questions/22329481/compressing-base64-data-uri-images
        
        don't think this is going to work for large projects without some sort of better compression. simply drawing a few lines on
        a canvas produces a very large base64 string spanning many lines. not very practical for exporting a project
        that has several frames, especially if you take into account different colors and more detail
        
    ***/
    save(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            // prompt the user to name the file 
            let name = prompt("name of file: ");
            if(name === ""){
                name = "funSketch_saveFile";
            }else if(name === null){
                return;
            }
            let savedData = [];
            this.animationProj.frameList.forEach(function(frame){
                // get frame metadata
                let newFrame = frame.getMetadata();
                newFrame['layers'] = []; // list of objects
                frame.canvasList.forEach(function(layer){
                    // get layer metadata
                    let newLayer = {
                        'id': layer.id,
                        'width': layer.getAttribute("width"),
                        'height': layer.getAttribute("height"),
                        'zIndex': layer.style.zIndex,
                        'opacity': layer.style.opacity,
                    };
                    // add layer image data
                    newLayer['imageData'] = layer.toDataURL();
                    newFrame.layers.push(newLayer);
                });
                savedData.push(JSON.stringify(newFrame));
            });
            let json = "[\n";
            json += savedData.join(",\n"); // put a line break between each new object, which represents a frame
            json += "\n]";
            // make a blob so it can be downloaded 
            let blob = new Blob([json], { type: "application/json" });
            let url = URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.href = url;
            link.download = name + ".json";
            link.click();
        });
    };
	
	// data: JSON data representing a project
	// updateStateFunction: function that updates state. used in the react component that has the toolbar as a prop
	importData(data, updateStateFunction){
		if(!data[0] || (!data[0].name && !data[0].height && !data[0].width && !data[0].data)){
			console.log("import failed: it appears to not be a valid project! :<");
			return;
		}
		// clear existing project
		this.animationProj.resetProject();
		
		// load saved project
		data.forEach((frame, index) => {
			if(index > 0){
				// add a new frame
				this.animationProj.addNewFrame();
			}
			// overwrite existing frame
			// TODO: implement an updateFrame method 
			// something like: animationProj.updateFrame(0, frame);
			const currFrame = this.animationProj.getFrames()[index];
			const currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
			const currFrameLayersFromCurrPrj = currFrame.getLayers();
			
			currFrameLayersFromImport.forEach((layer, layerIndex) => {
				
				if((layerIndex + 1) > currFrameLayersFromCurrPrj.length){
					// add new layer to curr project as needed based on import
					currFrame.setupNewLayer();
				}
				
				const currLayer = currFrame.getLayers()[layerIndex];

				// add the image data 
				const newCtx = currLayer.getContext("2d");
				const img = new Image();
				(function(context, image){
					image.onload = function(){
						context.drawImage(image, 0, 0);
						if(index === data.length-1 && updateStateFunction){
							// after importing all the frames, update state (i.e. frame and layer counters, animation timeline)
							updateStateFunction();
						}
					};
					image.src = layer.imageData;
				})(newCtx, img);
			});
			
			currFrame.setCurrIndex(frame.currentIndex);
		});
	}
	
	importProject(elementId, updateStateFunction){
		const self = this;
        document.getElementById(elementId).addEventListener('click', () => {
            fileHandler();
            //import project json file
            function fileHandler(){
                const input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
            function getFile(e){
                const reader = new FileReader();
                const file = e.target.files[0];
                //when the file loads, put it on the canvas.
                reader.onload = (function(theFile){
                    return function(e){
                        // parse the JSON using JSON.parse 
                        // check if it can be parsed though first!
                        let data;
                        try {
                            data = JSON.parse(e.target.result);
                        }catch(e){
                            // not valid json file 
							console.log("import failed: not a valid JSON file");
                            return;
                        }
						self.importData(data, updateStateFunction);
                    };
                })(file);
                reader.readAsText(file);
            }
        });
    };
} // end of Toolbar 


export {
	Toolbar
};