//brush kit for my drawing/animating app
//resources: http://perfectionkills.com/exploring-canvas-drawing-techniques/

//var brushImg = new Image();
//brushImg.src = 'http://www.tricedesigns.com/wp-content/uploads/2012/01/brush2.png';
//brushImg.crossOrigin = "Anonymous";
//var brushOn = true;

//an object to keep track of which brush is active. if all are false,
//the default brush is active.
var brushes = {"radialGrad": false};
var brushFlag = false;

//function to retrieve brush type when onclick from dropdown list
function selectBrush(id){
	resetMouse();
	//console.log(id);
	if(id === 'defaultBrush'){
		for(brush in brushes){
			brushes[brush] = false;
		}
		brushFlag = false;
		draw();
	}else{
		for(brush in brushes){
			brushes[brush] = false;
		}
		brushes[id] = true;
		brushFlag = true;
		draw();
	}
}

//detach any events from mouse actions (reset the events connected with mouse events)
function resetMouse(){
	$('#' + curCanvas).off("mousedown");
	$('#' + curCanvas).off("mouseup");
	$('#' + curCanvas).off("mousemove");
}

/********* BEGIN BRUSHES **************/

/**
* DEFAULT BRUSH
*/
function redraw(){
	
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

function defaultBrush(){
	if(brushFlag === false){
	var paint;
	$('#' + curCanvas).mousedown(function(e){
		if(e.which === 1){ //when left click only
			paint = true;
			addClick(e.offsetX, e.offsetY);
			redraw();
		}
	});
	//draw the lines as mouse moves
	$('#' + curCanvas).mousemove(function(e){
		if(paint){
			addClick(e.offsetX, e.offsetY, true);
			redraw();
		}
	});
	//stop drawing
	//this should be universal for all brushes
	$('#' + curCanvas).mouseup(function(e) {
		clearClick();
		//log new pixel data every time a canvas is drawn on!
		storePixelData();
		//also reset undoCounter so that only the most recent image
		//can be undone first
		undoCounter = undefined;
		paint = false;
	});
	//stop drawing when mouse leaves
	//this should be universal for all brushes
	$('#' + curCanvas).mouseleave(function(e){
		paint = false;
	});
	}
}//end draw function

/**
* RADIAL GRADIENT BRUSH
*/
//each brush will have its own mousemove/mousedown events!!
function radialGrad(x,y){
		//adding those trig utility functions
		//to connect the newest and last points to 
		//create a nice solid line seems like a pretty good idea
		var radGrad = context.createRadialGradient(x,y,curSize,x,y,curSize*1.5);
		radGrad.addColorStop(0, curColor);
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

//activate radial gradient brush
function radialGradBrush(){
if(brushes["radialGrad"] === true && brushFlag === true){
	var paint;
	context.lineJoin = context.lineCap = 'round';
	$('#' + curCanvas).mousedown(function(e){
		paint = true;
		radialGrad(e.offsetX,e.offsetY);
	});
	$('#' + curCanvas).mousemove(function(e){
		if(paint){
		radialGrad(e.offsetX,e.offsetY);
		}
	});
	$('#' + curCanvas).mouseup(function(e){
		storePixelData();
		//console.log(canvasData);
		paint = false;
	});
}
}
