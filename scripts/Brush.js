/***
	brush class
	pass in an instance of the SuperCanvas class as an argument
	the canvas argument will have a reference to the current canvas so that
	only the current canvas will be a target for the brush
***/
function Brush(canvas){

	this.previousCanvas = undefined;	
	this.currentCanvasSnapshots = [];	// keep track of what the current canvas looks like after each mouseup
	this.selectedBrush = 'default';		// user-selected brush 
	this.currColor = '#000';
	this.currColorArray = Uint8Array.from([0, 0, 0, 0]); 
	this.currSize = 2;
	
	// these variables keep track of the pixels drawn on by the mouse.
	// the redraw function uses this data to connect the dots 
	var clickX = [];
	var clickY = [];
	var clickDrag = [];
	var clickColor = [];
	var clickSize = [];
	
	// hold the current image after mouseup. 
	// only put it in the currentCanvasSnapshots after user starts drawing again, creating a new snapshot
	var tempSnapshot; 
	
	// pass in an instance of the SuperCanvas class as an argument
	// the canvas argument will have a reference to the current canvas so that
	// only the current canvas will be a target for the brush
	// note that a new variable, "thisBrushInstance", is assigned this (I want the brush object instance). 
	// that is because when you go inside another function (i.e. mousedown), 
	// using "this" doesn't refer to the object you're in, but that other function itself. 
	var thisBrushInstance = this;
	
	this.changeBrushSize = function(size){
		this.currSize = size;
	}
	
	this.defaultBrush = function(){	
		// reset mouse action functions first 
		resetBrush();
		var paint;
		$('#' + canvas.currentCanvas.id).on('mousedown touchstart', function(e){
			if((e.which === 1 && e.type === 'mousedown') || e.type === 'touchstart'){ //when left click only
				// update previousCanvas
				if(thisBrushInstance.previousCanvas !== canvas.currentCanvas){
					thisBrushInstance.previousCanvas = canvas.currentCanvas;
					// reset the snapshots array
					thisBrushInstance.currentCanvasSnapshots = [];
				}
				if(tempSnapshot){
					thisBrushInstance.currentCanvasSnapshots.push(tempSnapshot);
				}
				paint = true;
				
				// offset will be different with mobile
				// use e.originalEvent because using jQuery
				// https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
				// https://stackoverflow.com/questions/11287877/how-can-i-get-e-offsetx-on-mobile-ipad
				// using rect seems to work pretty well
				if(e.type === 'touchstart'){
					var rect = e.target.getBoundingClientRect();
					e.offsetX = e.originalEvent.touches[0].pageX - rect.left;
					e.offsetY = e.originalEvent.touches[0].pageY - rect.top;
				}
				
				addClick(e.offsetX, e.offsetY, true);
				redraw(canvas);
			}
		});
		//draw the lines as mouse moves
		$('#' + canvas.currentCanvas.id).on('mousemove touchmove', function(e){
			if(paint){
				if(e.type === 'touchmove'){
					var rect = e.target.getBoundingClientRect();
					e.offsetX = e.originalEvent.touches[0].pageX - rect.left;
					e.offsetY = e.originalEvent.touches[0].pageY - rect.top;

					// prevent page scrolling when drawing 
					e.preventDefault();
					
				}
				addClick(e.offsetX, e.offsetY, true);
				redraw(canvas);
			}
		});
		//stop drawing
		$('#' + canvas.currentCanvas.id).on('mouseup touchend', function(e) {
			// see if it's a new canvas or we're still on the same one as before the mousedown
			if(thisBrushInstance.previousCanvas === canvas.currentCanvas){
				// if it is, then log the current image data. this is important for the undo feature
				var c = canvas.currentCanvas;
				var w = c.width;
				var h = c.height;
				tempSnapshot = canvas.currentCanvas.getContext("2d").getImageData(0, 0, w, h);
			}
			
			clearClick();
			paint = false;
		});
		//stop drawing when mouse leaves
		$('#' + canvas.currentCanvas.id).mouseleave(function(e){
			paint = false;
		});
	}
	
	/***
		radial gradient brush 
	***/
	this.radialGradBrush = function(){
		// reset mouse action functions first 
		resetBrush();
		var curCanvas = canvas.currentCanvas.id;
		var context = canvas.currentCanvas.getContext("2d");
		var paint;
		context.lineJoin = context.lineCap = 'round';
		$('#' + curCanvas).mousedown(function(e){
			if(e.which === 1){
				paint = true;
				radialGrad(e.offsetX,e.offsetY);
			}
		});
		$('#' + curCanvas).mousemove(function(e){
			if(paint){
				radialGrad(e.offsetX,e.offsetY);
			}
		});
		$('#' + curCanvas).mouseup(function(e){
			paint = false;
			if(thisBrushInstance.previousCanvas === canvas.currentCanvas){
				// if it is, then log the current image data. this is important for the undo feature
				var c = canvas.currentCanvas;
				var w = c.width;
				var h = c.height;
				thisBrushInstance.currentCanvasSnapshots.push(canvas.currentCanvas.getContext("2d").getImageData(0, 0, w, h));
			}
		});
		//stop drawing when mouse leaves
		$('#' + curCanvas).mouseleave(function(e){
			paint = false;
		});
	}
	
	function radialGrad(x,y){
		var context = canvas.currentCanvas.getContext("2d");
		var radGrad = context.createRadialGradient(x,y,thisBrushInstance.currSize,x,y,thisBrushInstance.currSize*1.5);
		var colorPicked = thisBrushInstance.currColorArray;
		radGrad.addColorStop(0, thisBrushInstance.currColor);
		if(colorPicked !== undefined){
			radGrad.addColorStop(.5, 'rgba(' +  colorPicked[0] + ',' +  colorPicked[1] + ',' +  colorPicked[2] + ',.5)');
			radGrad.addColorStop(1, 'rgba(' +  colorPicked[0] + ',' +  colorPicked[1] + ',' +  colorPicked[2] + ',0)');
		}else{
			radGrad.addColorStop(.5, 'rgba(0,0,0,.5)');
			radGrad.addColorStop(1, 'rgba(0,0,0,0)');
		}
		context.fillStyle = radGrad;
		context.fillRect(x-20, y-20, 40, 40);
	}
	
	
	function resetBrush(){
		var curCanvas = canvas.currentCanvas.id;
		//detach any events from mouse actions (reset the events connected with mouse events)
		$('#' + curCanvas).off("mousedown");
		$('#' + curCanvas).off("mouseup");
		$('#' + curCanvas).off("mousemove");
	}

	//collect info where each pixel is to be drawn on canvas
	function addClick(x, y, dragging){
		var brushInstance = 
		clickX.push(x);
		clickY.push(y);
		clickDrag.push(dragging);
		clickColor.push(thisBrushInstance.currColor);
		clickSize.push(thisBrushInstance.currSize);
	}
	
	function redraw(canvas){
		var context = canvas.currentCanvas.getContext("2d");
		context.lineJoin = 'round';
		for(var i = 0; i < clickX.length; i++){
			context.beginPath();
			//this helps generate a solid line, rather than a line of dots. 
			//the subtracting of 1 from i means that the point at i is being connected
			//with the previous point
			if(clickDrag[i] && i){ 
				context.moveTo(clickX[i-1], clickY[i-1]);
			}else{
				//the adding of 1 allows you to make a dot on click
				context.moveTo(clickX[i], clickY[i]+1);
			}
			context.lineTo(clickX[i], clickY[i]);
			context.closePath();
			context.strokeStyle = clickColor[i];
			context.lineWidth = clickSize[i]; 
			context.stroke(); 
		}
	}

	function clearClick(){
		clickX = [];
		clickY = [];
		clickDrag = [];
		clickColor = [];
		clickSize = [];
	}
	
}

