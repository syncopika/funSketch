// toolbar class

// assemble the common functions for the toolbar
// remove canvas param since you have animationProj
class Toolbar {
	constructor(brush, animationProj){
		// use this for storing the most recent imported image
		// can be useful for resetting image
		this.recentImage = null;

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
        // this moves the current layer to the next one if exists
        let frame = this.animationProj.getCurrFrame();
		if(frame.nextLayer()){
			// apply brush
			// TODO: can we figure out a better way to handle brushes?
            this.brush.applyBrush();
			return true;
		}else{
			return false;
		}
    }
	
    prevLayer(){
        // this moves the current layer to the previous one if exists
        let frame = this.animationProj.getCurrFrame();
        if(frame.prevLayer()){			
            // apply brush
            this.brush.applyBrush();
            return true;
        }
        return false;
    }
	
	setCurrLayer(layerIndex){
		// true to show onion skin of prev layer
		this.animationProj.getCurrFrame().setToLayer(layerIndex, true);
	}
	
    nextFrame(){
        let curr = this.animationProj.getCurrFrame();
        let next = this.animationProj.nextFrame();
        if(next !== null){
            curr.hide();
            next.show();
            this.brush.applyBrush();
            return true;
        }
        return false;
    }
	
    prevFrame(){
        let curr = this.animationProj.getCurrFrame();
        let prev = this.animationProj.prevFrame();
        if(prev !== null){
            curr.hide();
            prev.show();
            this.brush.applyBrush();
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
        // not sure if better idea to add the container the layers go in as an instance letiable 
        // or pass in elementId here? 
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
		add a new frame
    ***/
    addNewFrameButton(elementId){
        document.getElementById(elementId).addEventListener('click', () => {
            this.animationProj.addNewFrame();
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
            this.brush.currColorArray = colorPicked;
            this.brush.currColor = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
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
            let canvas = this.animationProj.getCurrFrame();
            let context = canvas.currentCanvas.getContext("2d");
            context.clearRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
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
            let canvas = this.animationProj.getCurrFrame();
            let context = canvas.currentCanvas.getContext("2d");
            let width = canvas.currentCanvas.getAttribute("width");
            let height = canvas.currentCanvas.getAttribute("height");
            // unshift to add to front of stack of snapshots. 
            this.brush.currentCanvasSnapshots.unshift(context.getImageData(0, 0, width, height));
            // clear first
            context.clearRect(0, 0, width, height);
            // then put back last image (ignore the one that had just been drawn)
            // snapshots is a variable that only holds all the images up to the 2nd to last image drawn. 
            // if you keep up to the last image drawn, then you have to click undo twice initially to get to the previous frame.
            if(this.brush.currentCanvasSnapshots.length >= 1){
                let mostRecentImage = this.brush.currentCanvasSnapshots.pop();
                context.putImageData(mostRecentImage, 0, 0);
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

					// default value in super canvas object
					height = canvas.height;
					width = canvas.width;
					currentCanvas.setAttribute('height', height);
					currentCanvas.setAttribute('width', width);
                    
                    context.drawImage(img, 0, 0, width, height);
                    // assign recentImage the image 
                    self.recentImage = img;
                    // add the current image to snapshots 
                    self.brush.currentCanvasSnapshots.push(context.getImageData(0, 0, width, height));
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
	
	importProject(elementId, updateStateFunction){
		const self = this;
        document.getElementById(elementId).addEventListener('click', () => {
            fileHandler();
            //import project json file
            function fileHandler(){
                let input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
            function getFile(e){
                let reader = new FileReader();
                let file = e.target.files[0];
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
                            return;
                        }
                        // do some validation
                        // if there is no canvas
                        // or it's a valid json object but no fields correspond to a canvas, quit
                        if (!data[0] || (!data[0].name && !data[0].height && !data[0].width && !data[0].data)) {
                            console.log("it appears to not be a valid project! :<");
                            return;
                        }
                        // clear existing project
                        self.animationProj.resetProject();
						
                        // load saved project
                        data.forEach(function(frame, index){
                            if(index > 0){
                                // add a new frame
                                self.animationProj.addNewFrame();
                            }
                            // overwrite existing frame
                            // TODO: implement an updateFrame method 
                            // something like: animationProj.updateFrame(0, frame);
                            let currFrame = self.animationProj.getFrames()[index];
                            let currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
                            let currFrameLayersFromCurrPrj = currFrame.getLayers();
                            
							currFrameLayersFromImport.forEach(function(layer, layerIndex){
								
                                if((layerIndex + 1) > currFrameLayersFromCurrPrj.length){
                                    // add new layer to curr project as needed based on import
                                    currFrame.setupNewLayer();
                                }
								
                                let currLayer = self.animationProj.getFrames()[index].getLayers()[layerIndex];
                                // is this part necessary? maybe, if you want the project to look exactly as when it was saved.
                                currLayer.style.opacity = layer.opacity;
                                currLayer.style.zIndex = layer.zIndex;

                                // add the image data 
                                let newCtx = currLayer.getContext("2d");
                                let img = new Image();
                                (function(context, image){
                                    image.onload = function(){
                                        context.drawImage(image, 0, 0);
										if(index === data.length-1 && updateStateFunction){
											updateStateFunction();
										}
                                    };
                                    image.src = layer.imageData;
                                })(newCtx, img);
									
								// make sure to update this frame's current canvas so it matches currentIndex
								// another thing to refactor later (i.e. since we have currentIndex, we really shouldn't have another variable
								// to keep track of whose value could be known with currentIndex)
								if(layerIndex === currFrame.currentIndex){
									currFrame.currentCanvas = currLayer;
								}
                            });
							
							currFrame.setCurrIndex(frame.currentIndex);
                        });
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