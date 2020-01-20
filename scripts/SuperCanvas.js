// TODO: have an animation mode and a paint mode? in paint mode, you can do all the layering per frame and stuff.
// in animation mode, we process all the frames and for each one condense all their layers into a single frame.
// then we can use those frames in an animation.
// to optimize performance when going into animation mode, maybe cache which frames are 'tainted' from the last time 
// animation mode was switched to.


/***
	super canvas class 
	the instance variables hold the default attributes for any canvas. 
	it also holds important information like a list of all the canvas instances.
	setupNewCanvas should be used to create a new canvas instance 
	@param container = the parent element ID (i.e. of a div) to append the canvas elements to 
	
	a supercanvas is really a frame, containing a list of canvas elements which represent layers of the frame
***/
function SuperCanvas(container, number){

	this.count = 0; 					// keep count of canvasses - unnecessary since you have a list!
	this.width = 800; 					// default value
	this.height = 800;
	this.currentIndex = 0;
	this.canvasList = []; 				// keep a list of all canvas instances
	this.currentCanvas;					// the current, active canvas being looked at (reference to html element)
	this.container = container;			// this is the html container id to hold all the layers of this frame
	this.tainted = false;				// set to true if any layers are edited
	this.number = number;				// frame number


	this.getCurrCanvas = function(){
		return this.canvasList[this.currentIndex];
	}
	
	/*** 
	    set up a new canvas element
		makes the new canvas the current canvas 
	***/
	this.setupNewLayer = function(){

		// create the new canvas element 
		var newCanvas = document.createElement('canvas');
		newCanvas.id = "frame" + this.number + "canvas" + this.count;
		setCanvas(newCanvas, this.width, this.height);
		
		if(this.count === 0){
			newCanvas.style.opacity = .97;
			newCanvas.style.zIndex = 1;
		}
		
		// add it to the container passed in as the argument
		document.getElementById(this.container).appendChild(newCanvas);
	
		// set new canvas to be the current canvas only initially!
		if(this.count === 0){
			this.currentCanvas = newCanvas;
		}
		
		// if at least 1 canvas already present, make the previous canvas be slightly opaque for onion-skin effect
		if(this.count >= 1){	
			// position the new canvas directly on top of the previous one 
			var top = $('#' + this.canvasList[0].id).position().top;
			var left = $('#' + this.canvasList[0].id).position().left;
			newCanvas.style.top = top;
			newCanvas.style.left = left;
		}
	
		this.canvasList.push(newCanvas);
		this.count++;
	}
	
	this.hide = function(){
		// puts all layers at zIndex -1 so they're not visible
		this.canvasList.forEach(function(canvas){
			canvas.style.zIndex = -1;
			canvas.hidden = true;
		});
	}
	
	this.show = function(){
		// makes all layers visible
		this.canvasList.forEach(function(canvas){
			canvas.style.zIndex = 1;
			canvas.hidden = false;
		});
	}
	
	/***
		clone the current canvas
	***/
	this.copyCanvas = function(){
		
		var newCanvas = document.createElement('canvas');
		newCanvas.id = 'frame' + this.number + 'canvas' + this.count;
		setCanvas(newCanvas, this.width, this.height);
	
		this.canvasList[this.count - 1].style.opacity = .92;
		
		// place the canvas in the container 
		document.getElementById(container).appendChild(newCanvas);
		
		// position the new canvas directly on top of the previous one 
		var top = $('#' + (this.canvasList[0].id)).position().top;
		var left = $('#' + (this.canvasList[0].id)).position().left;
		newCanvas.style.top = top;
		newCanvas.style.left = left;
		
		newCanvas.getContext("2d").drawImage(this.currentCanvas, 0, 0);

		this.canvasList.push(newCanvas);
		this.count++;	
	}
	
		
	/***
		reset the canvas object - i.e. remove all frames, reset values, etc.
		necessary to do before importing an old project
		
		- can pass in an element ID that corresponds to the canvas counter, which 
		also needs to be reset
		
		- be careful! note that if this function needs to be used, no other DOM 
		  element should have an id that contains the string 'canvas'!
	***/
	this.resetCanvas = function(counterElementId){
		
		// delete all canvasses except first one from the dom
		var allCanvas = document.querySelectorAll('[id^="canvas"]');
		
		// because I also have an element with the id "canvasArea", the element at the 0th index 
		// is actually canvasArea, so skip that element 
		var parentNodeCanvas = allCanvas[1].parentNode;

		for(var i = 2; i < allCanvas.length; i++){
			parentNodeCanvas.removeChild(allCanvas[i]);
		}
		
		this.count = 1;
		this.currentIndex = 0;
		this.canvasList = this.canvasList.splice(0,1);	// only keep the first canvas 
		
		// ensure the first canvas is visible if this resetCanvas function was called while looking at 
		// some other canvas 
		this.canvasList[0].style.opacity = 1;
		this.canvasList[0].style.zIndex = 1;
	
		if(counterElementId){
			document.getElementById(counterElementId).textContent = "1";
		}
	}

}

/***
	an animation is a single project containing one or more supercanvases (or frames).
	it also instantiates an onion skin frame.
***/
function Animation(container){
	this.name = "";
	this.currentFrame = 0;
	this.speed = 100;	// 100 ms per frame 
	this.frameList = [];
	this.mode = 0;	// 0 == drawing mode. 1 == animation mode.
	this.onionSkinFrame = createOnionSkinFrame(container);
	this.container = container; // id of the html element the frames are displayed in
	
	this.add = function(frame){
		this.frameList.push(frame);
	}
	
	this.nextFrame = function(){
		if(this.frameList.length === this.currentFrame + 1){
			return null; // no more frames to see
		}
		
		this.currentFrame += 1;
		return this.frameList[this.currentFrame];
	}
	
	this.prevFrame = function(){
		if(this.currentFrame - 1 > 0){
			return null; // no more frames to see
		}
		
		this.currentFrame -= 1;
		return this.frameList[this.currentFrame];
	}

	this.getCurrFrame = function(){
		return this.frameList[this.currentFrame];
	}
	
	this.updateOnionSkin = function(){
		// take the previous frame, merge all layers, put into onion skin frame
		console.log("update onion skin");
	}
	
}

function createOnionSkinFrame(container){
		
	var width = 800; 				
	var height = 800;

	// create the new canvas element 
	var newCanvas = document.createElement('canvas');
	newCanvas.id = "onionSkinCanvas";
	setCanvas(newCanvas, width, height);
	
	newCanvas.style.opacity = .97;
	newCanvas.style.zIndex = -1; // come back to this later. make sure it's visible if current frame > 1!
	
	// add it to the container passed in as the argument
	document.getElementById(container).appendChild(newCanvas);
	
	return newCanvas;
}

// assigns position, z-index, border, width, height and opacity
function setCanvas(canvasElement, width, height){
	canvasElement.style.position = 'absolute';
	canvasElement.style.border = '1px #000 solid';
	canvasElement.style.zIndex = 0;
	canvasElement.style.opacity = 0;
	canvasElement.setAttribute('width', width);
	canvasElement.setAttribute('height', height);
	canvasElement.getContext("2d").fillStyle = "#fff";
	canvasElement.getContext("2d").fillRect(0, 0, width, height);
}




