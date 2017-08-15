
// super canvas class 
// the instance variables hold the default attributes for any canvas. 
// it also holds important information like a list of all the canvas instances.
// setupNewCanvas should be used to create a new canvas instance 
// @param container = the parent element ID (i.e. of a div) to append the canvas elements to 
function SuperCanvas(container){

	this.count = 0; 					// keep count of canvasses
	this.width = 800; 					// default value
	this.height = 800; 
	this.currentIndex = 0;
	this.canvasList = []; 				 // keep a list of all canvas instances
	this.currentCanvas;					// the current, active canvas being looked at (reference to html element)
	this.container = container;			// this is the html container to hold all the canvas elements
	this.play;							// used as a counter for the animation playback features
	
	// set up a new canvas element
	// makes the new canvas the current canvas 
	this.setupNewCanvas = function(){

		// create the new canvas element 
		var newCanvas = document.createElement('canvas');
		newCanvas.id = "canvas" + this.count;
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
	
	/***
		clone the current canvas
	***/
	this.copyCanvas = function(){
		
		var newCanvas = document.createElement('canvas');
		newCanvas.id = 'canvas' + this.count;
		setCanvas(newCanvas, this.width, this.height);
	
		this.canvasList[this.count - 1].style.opcaity = .92;
		
		// place the canvas in the container 
		document.getElementById(this.container).appendChild(newCanvas);
		
		// position the new canvas directly on top of the previous one 
		var top = $('#' + (this.canvasList[0].id)).position().top;
		var left = $('#' + (this.canvasList[0].id)).position().left;
		newCanvas.style.top = top;
		newCanvas.style.left = left;
		
		newCanvas.getContext("2d").drawImage(this.currentCanvas, 0, 0);

		this.canvasList.push(newCanvas);
		this.count++;	
	}

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




