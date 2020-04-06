// toolbar class
// assemble the common functions for the toolbar
// remove canvas param since you have animationProj
function Toolbar(canvas, brush, animationProj) {
    // keep this letiable for storing the most recent imported image
    // can be useful for resetting image
    let recentImage;
    // used as a counter for the animation playback features
    let play = null;
    // this will only work for the very first frame!!
    // when each method is called, the current canvas needs to be recalculated
    //let canvas = animationProj.frameList[animationProj.currentFrame];
    // used to hold user-indicated time (ms) per frame for animation playback and gif
    this.timePerFrame = 200; // set to 200 be default
    // should the keyboard keys be affecting the layer or the frame? 2 options only
    // this is useful for the arrow keys and space bar
    this.layerMode = true;
    this.htmlCounter = ""; // html element used as a counter specifying the current frame and layer
	
    this.setCounter = function(elementId){
        this.htmlCounter = document.getElementById(elementId);
    };
	
    this.up = function(){
        // this moves the current layer to the next one if exists
        let canvas = animationProj.getCurrFrame();
        if(canvas.currentIndex + 1 < canvas.canvasList.length) {
            // move to next canvas
            canvas.currentCanvas.style.opacity = .92; // apply onion skin to current canvas 
            canvas.currentCanvas.style.zIndex = 0;
            // in the special case for when you want to go to the next canvas from the very first one, 
            // ignore the step where the opacity and z-index for the previous canvas get reset to 0.
            if(canvas.currentIndex > 0) {
                // reset opacity and z-index for previous canvas (because of onionskin)
                canvas.canvasList[canvas.currentIndex - 1].style.opacity = 0;
                canvas.canvasList[canvas.currentIndex - 1].style.zIndex = 0;
            }
            // show the next canvas 
            canvas.canvasList[canvas.currentIndex + 1].style.opacity = .97;
            canvas.canvasList[canvas.currentIndex + 1].style.zIndex = 1;
            canvas.currentCanvas = canvas.canvasList[canvas.currentIndex + 1];
            canvas.currentIndex++;
            // apply brush on new current canvas 
            brush.defaultBrush();
            return true;
        }
        return false;
    };
	
    this.down = function(){
        // this moves the current layer to the previous one if exists
        let canvas = animationProj.getCurrFrame();
        if(canvas.currentIndex - 1 >= 0){
            // move to previous canvas
            canvas.currentCanvas.style.opacity = 0;
            canvas.currentCanvas.style.zIndex = 0;
            // make previous canvas visible 
            canvas.canvasList[canvas.currentIndex - 1].style.opacity = .97;
            canvas.canvasList[canvas.currentIndex - 1].style.zIndex = 1;
            // if there is another canvas before the previous one, apply onion skin
            if(canvas.currentIndex - 2 >= 0){
                canvas.canvasList[canvas.currentIndex - 2].style.opacity = .92;
            }
            canvas.currentCanvas = canvas.canvasList[canvas.currentIndex - 1];
            canvas.currentIndex--;
            // apply brush
            brush.defaultBrush();
            return true;
        }
        return false;
    };
	
    this.nextFrame = function(){
        let curr = animationProj.getCurrFrame();
        let next = animationProj.nextFrame();
        if(next !== null){
            curr.hide();
            next.show();
            animationProj.updateOnionSkin();
            brush.defaultBrush();
            return true;
        }
        return false;
    };
	
    this.prevFrame = function(){
        let curr = animationProj.getCurrFrame();
        let prev = animationProj.prevFrame();
        if(prev !== null){
            curr.hide();
            prev.show();
            animationProj.updateOnionSkin();
            brush.defaultBrush();
            return true;
        }
        return false;
    };
	
    this.addPage = function(){
        // TODO: shouldn't this be in Animation? 
        let canvas = animationProj.getCurrFrame();
        canvas.setupNewLayer();
    };

    /***
        insert a frame after the current frame
    ***/
    this.insertLayer = function(elementId){
        // not sure if better idea to add the container the layers go in as an instance letiable 
        // or pass in elementId here? 
        $('#' + elementId).click(function(){
            let canvas = animationProj.getCurrFrame();
            // add a new canvas first 
            canvas.setupNewLayer();
            // then move it after the current canvas 
            let newestCanvas = canvas.canvasList.pop();
            canvas.canvasList.splice(canvas.currentIndex + 1, 0, newestCanvas);
        });
    };
	
    /***
        delete current frame
        shifts the current frame to the next one if there is one.
        otherwise, the previous frame will become the current one.
        if there isn't a previous one either, then the frame will just be made blank.
    ***/
    this.deleteLayer = function(elementId){
        // elementId here refers to the display that shows current frame and layer
        let toolbarReference = this;
        $('#' + elementId).click(function(){
            let canvas = animationProj.getCurrFrame();
            let oldCanvasIndex = canvas.currentIndex;
            let oldCanvasId = canvas.currentCanvas.id;
            let parentNode = document.getElementById(oldCanvasId).parentNode;
            // if there's a canvas ahead of the current one 
            if(canvas.currentIndex + 1 < canvas.canvasList.length){
                // move current canvas to the next one 
                toolbarReference.up();
                // remove the old canvas from the array and the DOM!
                canvas.canvasList.splice(oldCanvasIndex, 1);
                parentNode.removeChild(document.getElementById(oldCanvasId));
                // adjust the current canvas index after the removal 
                canvas.currentIndex -= 1;
            }else if(canvas.currentIndex - 1 >= 0){
                // if there's a canvas behind the current one (and no more ahead)
                // move current canvas to the previous one 
                // note that currentIndex doesn't need to be adjusted because removing the 
                // next canvas doesn't affect the current canvas' index
                toolbarReference.down();
                canvas.canvasList.splice(oldCanvasIndex, 1);
                parentNode.removeChild(document.getElementById(oldCanvasId));
                // but need to adjust the counter, if present
                if (toolbarReference.htmlCounter) {
                    toolbarReference.htmlCounter.textContent = "frame: " + (animationProj.currentFrame + 1) + ", layer:" + (canvas.currentIndex + 1);
                }
            }else{
                // otherwise, just blank the canvas 
                let context = canvas.currentCanvas.getContext("2d");
                context.clearRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
                context.fillStyle = "#fff";
                context.fillRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
            }
        });
    };
	
    /***
        add a new frame
        note that it's adding a supercanvas instance
    ***/
    this.addNewFrameButton = function(elementId){
        $('#' + elementId).click(() => {
            animationProj.addNewFrame();
        });
    };
	
    /***
        color wheel functions
    ***/
    // pass in the elementId of the div where the color wheel should be 
    // pass in the size of the canvas of the color wheel 
    this.createColorWheel = function(elementId, size){
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
        colorWheelContext.fillRect(0, 0, 8, 8);
        // make white pickable too 
        colorWheelContext.fillRect(10, 0, 8, 8); // border around the white 
        colorWheelContext.fillStyle = "#fff";
        colorWheelContext.fillRect(11, 0, 6, 7);
        location.appendChild(colorWheel);
		
        // make the color wheel interactive and show picked color 
        let showColor = document.createElement('p'); // this element will show the color picked 
        showColor.style.textAlign = 'center';
        showColor.id = 'colorPicked';
        showColor.textContent = "pick a color! :)";
        location.appendChild(showColor);
        
		$('#' + colorWheel.id).mousedown((e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            let colorPicked = (document.getElementById(colorWheel.id).getContext('2d')).getImageData(x, y, 1, 1).data;
            let colorPickedText = document.getElementById(showColor.id);
            //correct the font color if the color is really dark
            if(colorPicked[0] > 10 && colorPicked[1] > 200){
                $('#' + showColor.id).css("color", "#000");
            }else{
                $('#' + showColor.id).css("color", "#FFF");
            }
            colorPickedText.textContent = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
            $('#' + showColor.id).css({ 'background-color': colorPickedText.textContent });
            // update current color seleted in brush object as Uint8 clamped array where each index corresponds to r,g,b,a
            brush.currColorArray = colorPicked;
            brush.currColor = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
        });
    };

	
    /***
        rotate image
        pass in an element id that will rotate the current canvas image on click
        
        currently buggy! after rotation, image becomes blurred. also, when attempting to draw on same canvas,
        coordinates get altered so on mousedown the drawing gets offset
    ***/
    this.rotateImage = function(elementId){
        //rotate image
        $('#' + elementId).click(function () {
            let canvas = animationProj.getCurrFrame();
            //using a promise to convert the initial image to a bitmap
            let width = canvas.currentCanvas.getAttribute("width");
            let height = canvas.currentCanvas.getAttribute("height");
            let context = canvas.currentCanvas.getContext("2d");
            Promise.all([
                createImageBitmap(canvas.currentCanvas, 0, 0, width, height)
            ]).then(function (bitmap) {
                context.clearRect(0, 0, width, height);
                context.translate(width / 2, height / 2);
                context.rotate((Math.PI) / 180);
                context.translate(-width / 2, -height / 2);
                //the returned bitmap is an array
                context.drawImage(bitmap[0], 0, 0);
            });
        });
    };
	
    /***
        clear the current canvas
        pass in an element id that will execute clear canvas onclick
    ***/
    this.setClearCanvas = function(elementId){
        $('#' + elementId).click(() => {
            let canvas = animationProj.getCurrFrame();
            let context = canvas.currentCanvas.getContext("2d");
            context.clearRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
        });
    };
	
    /***
        undo a previous drawing operation on the current canvas.
        still a little incorrect?
    ***/
    this.undo = function(elementId){
        $('#' + elementId).click(() => {
            let canvas = animationProj.getCurrFrame();
            let context = canvas.currentCanvas.getContext("2d");
            let width = canvas.currentCanvas.getAttribute("width");
            let height = canvas.currentCanvas.getAttribute("height");
            // unshift to add to front of stack of snapshots. 
            brush.currentCanvasSnapshots.unshift(context.getImageData(0, 0, width, height));
            // clear first
            context.clearRect(0, 0, width, height);
            // then put back last image (ignore the one that had just been drawn)
            // snapshots is a temp letiable that only holds all the images up to the 2nd to last image drawn. 
            // if you keep up to the last image drawn, then you have to click undo twice initially to get to the previous frame.
            if (brush.currentCanvasSnapshots.length >= 1) {
                let mostRecentImage = brush.currentCanvasSnapshots.pop();
                context.putImageData(mostRecentImage, 0, 0);
            }
        });
    };
	
    /***
        import an image
    ***/
    this.importImage = function(elementId) {
        $('#' + elementId).click(() => {
            
			let canvas = animationProj.getCurrFrame();
            
			// call fileHandler here
            fileHandler();
            
			// define fileHandler 
            function fileHandler() {
                //initiate file choosing after button click
                let input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
			
            function getFile(e) {
                let img = new Image();
                let reader = new FileReader();
                let file = e.target.files[0];
                if (!file.type.match(/image.*/)) {
                    console.log("not a valid image");
                    return;
                }
                //when the image loads, put it on the canvas.
                img.onload = function () {
                    // change current canvas' width and height according to imported picture
                    // to keep proportion 
                    // i.e. if width is at least 100px more than height, scale the current canvas'
                    // height back by multiplying .9 to 800. 
                    let currentCanvas = canvas.currentCanvas;
                    let context = currentCanvas.getContext("2d");
                    let height = img.height;
                    let width = img.width;
                    if ((img.width - img.height) >= 100){
                        // if image is wider than it is tall
                        currentCanvas.setAttribute('height', Math.floor(800 * .9));
                        currentCanvas.setAttribute('width', Math.floor(800 * 1.1));
                        height = currentCanvas.height;
                        width = currentCanvas.width;
                    }else if((img.height - img.width) >= 200){
                        // if image is taller than it is wide
                        currentCanvas.setAttribute('width', Math.floor(800 * .9));
                        currentCanvas.setAttribute('height', Math.floor(800 * 1.1));
                        height = currentCanvas.height;
                        width = currentCanvas.width;
                    }else{
                        // default value in super canvas object
                        height = canvas.height;
                        width = canvas.width;
                        currentCanvas.setAttribute('height', height);
                        currentCanvas.setAttribute('width', width);
                    }
                    context.drawImage(img, 0, 0, width, height);
                    // assign recentImage letiable the image 
                    recentImage = img;
                    // add the current image to snapshots 
                    brush.currentCanvasSnapshots.push(context.getImageData(0, 0, width, height));
                };
                //after reader has loaded file, put the data in the image object.
                reader.onloadend = function () {
                    img.src = reader.result;
                };
                //read the file as a URL
                reader.readAsDataURL(file);
            }
        });
    };
	
    /***
        reset the canvas to most recent imported image
    ***/
    this.resetImage = function(){
        if (recentImage) {
            let canvas = animationProj.getCurrFrame();
            let context = canvas.currentCanvas.getContext("2d");
            let height = canvas.currentCanvas.getAttribute("height");
            let width = canvas.currentCanvas.getAttribute("width");
            context.drawImage(recentImage, 0, 0, width, height);
        }
    };
	
    /***
        download a png file of the current canvas
    ***/
    this.download = function(elementId){
        $('#' + elementId).click(() => {
            // get image data from current canvas as blob
            let data = document.getElementById(canvas.currentCanvas.id).toBlob(function (blob) {
                let url = URL.createObjectURL(blob);
                let link = document.createElement('a');
                link.href = url;
                let name = prompt("please enter a name for the file");
                if (name === null) {
                    return;
                }
                else {
                    link.download = name;
                    //simulate a click on the blob's url to download it 
                    link.click();
                }
            });
        });
    };
	
    /********
    
        this section controls the animation playback features
        
        note that I specifically added my page counter element to the
        functions so that they change with the call to up() and down()

        this will need to be applied for FRAMES, not LAYERS of a frame.
    
    *********/
    let toolbar = this;
    let playFor = function(){
        if(toolbar.nextFrame()){
            if(toolbar.htmlCounter){
                let counterText = toolbar.htmlCounter;
                counterText.textContent = "frame: " + (animationProj.currentFrame + 1) + ", layer: " + (canvas.currentIndex + 1);
            }
        }
    };
	
    let playBack = function(){
        if (toolbar.prevFrame()) {
            if (toolbar.htmlCounter) {
                let counterText = toolbar.htmlCounter;
                counterText.textContent = "frame: " + (animationProj.currentFrame + 1) + ", layer: " + (canvas.currentIndex + 1);
            }
        }
    };
	
    this.playForward = function(){
        clearInterval(play);
        play = null;
        play = setInterval(playFor, this.timePerFrame);
    };
	
    this.playBackward = function(){
        clearInterval(play);
        play = null;
        //canvas.currentCanvas = canvas.canvasList[canvas.canvasList.length - 1];
        //canvas.currentCanvas.style.zIndex = 1;
        //canvas.currentCanvas.style.opacity = .97;
        play = setInterval(playBack, this.timePerFrame);
    };
	
    this.stop = function(){
        clearInterval(play);
        play = null;
    };
	
	
	this.mergeFrameLayers = function(frame){
		let tempCanvas = document.createElement('canvas');
		tempCanvas.width = frame.width;
		tempCanvas.height = frame.height;
		let tempCtx = tempCanvas.getContext("2d");
		tempCtx.fillStyle = "white";
		tempCtx.fillRect(0, 0, frame.width, frame.height);
		let tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
		let currFrame = frame;
		for(let j = 0; j < currFrame.canvasList.length; j++){
			let layer = currFrame.canvasList[j];
			let imageData = layer.getContext("2d").getImageData(0, 0, layer.width, layer.height).data;
			for(let k = 0; k < imageData.length; k += 4){
				if(imageData[k] === 255 && imageData[k + 1] === 255 && imageData[k + 2] === 255){
					continue;
				}else{
					// what if the canvas we're getting image data from to draw on the onion skin is LARGER than the onion skin canvas.
					// we might run into index/length issues...
					tempImageData.data[k] = imageData[k];
					tempImageData.data[k + 1] = imageData[k + 1];
					tempImageData.data[k + 2] = imageData[k + 2];
					tempImageData.data[k + 3] = 255;
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
    this.getGif = function(elementId, timelineMarkers){
        if (elementId) {
            document.getElementById(elementId).textContent = "now loading...";
        }
        let gif = new GIF({
            workers: 2,
            quality: 10
        });
        // add frames + take into account frame rate given by timelineMarkers
        for(let i = 0; i < animationProj.frameList.length; i++){
            let tempCanvas = this.mergeFrameLayers(animationProj.frameList[i]);
			let frameTime = timelineMarkers[i+1] ? timelineMarkers[i+1] : this.timePerFrame;
            gif.addFrame(tempCanvas, { delay: frameTime });
        }
        gif.on('finished', function(blob){
            document.getElementById(elementId).textContent = "";
            let newGif = URL.createObjectURL(blob);
            window.open(newGif);
        });
        gif.render();
    };
	
    /***
    
        save/export & import functions
        check this out: https://stackoverflow.com/questions/22329481/compressing-base64-data-uri-images
        
        don't think this is going to work without some sort of better compression. simply drawing a few lines on
        a canvas produces a very large base64 string spanning many lines. not very practical for exporting a project
        that has several frames, especially if you take into account different colors and more detail
        
    ***/
    this.save = function(elementId){
        $('#' + elementId).click(() => {
            // prompt the user to name the file 
            let name = prompt("name of file: ");
            if (name === "") {
                name = "funSketch_saveFile";
            }
            else if (name === null) {
                return;
            }
            let savedData = [];
            animationProj.frameList.forEach(function (frame) {
                // get frame metadata
                let newFrame = frame.getMetadata();
                newFrame['layers'] = []; // list of objects
                frame.canvasList.forEach(function (layer) {
                    // get layer metadata
                    let newLayer = {
                        'id': layer.id,
                        'width': layer.getAttribute("height"),
                        'height': layer.getAttribute("width"),
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
	
    this.importProject = function(elementId, optionalFunction){
        let self = this;
        $('#' + elementId).click(function() {
            fileHandler();
            //import project json file
            function fileHandler() {
                let input = document.createElement('input');
                input.type = 'file';
                input.addEventListener('change', getFile, false);
                input.click();
            }
            function getFile(e) {
                let reader = new FileReader();
                let file = e.target.files[0];
                //when the file loads, put it on the canvas.
                reader.onload = (function (theFile) {
                    return function (e) {
                        // parse the JSON using JSON.parse 
                        // check if it can be parsed though first!
                        let data;
                        try {
                            data = JSON.parse(e.target.result);
                        } catch (e) {
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
                        animationProj.resetProject();
						
                        // load saved project
                        data.forEach(function(frame, index){
                            if (index > 0) {
                                // add a new frame
                                animationProj.addNewFrame();
                            }
                            // overwrite existing frame
                            // TODO: implement an updateFrame method 
                            // animationProj.updateFrame(0, frame); // updateFrame takes an index of the existing frame to overwrite and takes a SuperCanvas object to update with as well
                            let currFrame = animationProj.frameList[index];
                            let currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
                            let currFrameLayersFromCurrPrj = currFrame.canvasList;
                            currFrameLayersFromImport.forEach(function (layer, layerIndex) {
                                if ((layerIndex + 1) > currFrameLayersFromCurrPrj.length) {
                                    // add new layer to curr project as needed based on import
                                    animationProj.frameList[index].setupNewLayer();
                                }
                                let currLayer = animationProj.frameList[index].canvasList[layerIndex];
                                // is this part necessary? maybe, if you want the project to look exactly as when it was saved.
                                currLayer.style.opacity = layer.opacity;
                                currLayer.style.zIndex = layer.zIndex;
                                currLayer.height = layer.height;
                                currLayer.width = layer.width;
                                // add the image data 
                                let newCtx = currLayer.getContext("2d");
                                let img = new Image();
                                (function(context, image){
                                    image.onload = function () {
                                        context.drawImage(image, 0, 0);
										if(index === data.length - 1 && optionalFunction){
											optionalFunction();
										}
                                    };
                                    image.src = layer.imageData;
                                })(newCtx, img);
                            });
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