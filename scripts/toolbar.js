/****

 these functions concern the buttons in the toolbar.
 basic utilities like undo, download, etc.
 
 note that most of these functions rely on an element ID, so you
 still have to create an element with a specific id in the 
 corresponding HTML file

****/

// dynamically generate a color wheel
// pass in the id of the element, radius 
function makeColorWheel(elementID, rad){
	
	var colorWheel = document.getElementById(elementID);
	var colorWheelContext = colorWheel.getContext('2d');

	var x = colorWheel.width / 2;
	var y = colorWheel.height / 2;
	var radius = rad;

	for(var angle = 0; angle <= 5600; angle++){
		var startAngle = (angle-2)*Math.PI / 180; //convert angles to radians
		var endAngle = (angle)*Math.PI / 180;
		
		colorWheelContext.beginPath();
		colorWheelContext.moveTo(x, y);
		//.arc(x, y, radius, startAngle, endAngle, anticlockwise)
		colorWheelContext.arc(x, y, radius, startAngle, endAngle, false);
		colorWheelContext.closePath();
		
		//use .createRadialGradient to get a different color for each angle
		//createRadialGradient(x0, y0, r0, x1, y1, r1)
		var gradient = colorWheelContext.createRadialGradient(x, y, 0, startAngle, endAngle, radius);
		gradient.addColorStop(0, 'hsla(' + angle + ', 10%, 100%, 1)');
		gradient.addColorStop(1, 'hsla(' + angle + ', 100%, 50%, 1)');
		
		colorWheelContext.fillStyle = gradient;
		colorWheelContext.fill();
	}
}

// function to pick a color from the color wheel and display it in the elementID passed to it
// notice it uses the colorPicked global variable. this is a Uint4 clamped array!
// need to find a better way to keep track of global variables I want to update 
function displayColorEnabled(elementID, colorWheelID){
	
	$('#colorWheel').mousedown(function(e){ 
		var x = e.offsetX;
		var y = e.offsetY;
		colorPicked = (document.getElementById(colorWheelID).getContext('2d')).getImageData(x, y, 1, 1).data;
		var colorPickedText = document.getElementById(elementID);
		//correct the font color if the color is really dark
		if(colorPicked[0] > 10 && colorPicked[1] > 200){
			$('#' + elementID).css("color", "#000");
		}else{
			$('#' + elementID).css("color", "#FFF");
		}
		colorPickedText.textContent = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
		$('#' + elementID).css({'background-color': colorPickedText.textContent});
		curColor = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
	});	
	
}

// allow rotate function. pass in id of button used to control rotation. 
// this relies on a global variable called canvasData, which holds data for all the canvasses
// and the curCanvas

// something interesting - try drawing on the canvas, then rotating. some marks disappear! 
// also - the coordinates for drawing lines gets thrown off after rotation!
function addRotate(elementID){
	
	//rotate image
	$('#' + elementID).click(function(){
		//using a promise to convert the initial image to a bitmap
		//canvasData[curCanvas][0] is used every time, which is the original picture
		Promise.all([
			createImageBitmap(canvasData[curCanvas][0], 0, 0, width, height)
			]).then(function(bitmap){
				context.clearRect(0, 0, width, height);	
				context.translate(width/2, height/2);
				context.rotate((Math.PI) / 180);
				context.translate(-width/2, -height/2);
				//the returned bitmap is an array
				context.drawImage(bitmap[0], 0, 0);	
			});
	});
		
}


//clear canvas function. takes id of element that will clear the current canvas on click 
function clearCanvasEnabled(elementID){
	$('#' + elementID).click(function(){
		clearClick();
		context = document.getElementById(curCanvas).getContext("2d");
		context.clearRect(0, 0, width, height);
		context.fillStyle = "#FFFFFF";
		context.fillRect(0, 0, width, height);
	});
}


// undo function. note that this relies on the curCanvas and context global variables!
// this function is a bit tricky and might possibly be very buggy still
// now that I think of it (7/9/17), why not use a stack? I think that would be perfect for this operation.
function undo(){
	if(undoCounter === undefined){
		//subtract 2, because .length - 1 returns what you just drew (the presumed mistake).
		//assuming you want the second-to-last thing you drew. 
		context.clearRect(0, 0, width, height);
		if(canvasData[curCanvas].length >= 2){
		undoCounter = canvasData[curCanvas].length - 2;
		context.putImageData(canvasData[curCanvas][undoCounter], 0, 0);
		}
	}else if(undoCounter > 0){
		context.clearRect(0, 0, width, height);
		context.putImageData(canvasData[curCanvas][--undoCounter], 0, 0);
	}else{
		//start again from latest image data
		undoCounter = canvasData[curCanvas].length-1;
		context.clearRect(0, 0, width, height);
		context.putImageData(canvasData[curCanvas][undoCounter], 0, 0);
	}
}


// download image from canvas
// todo: make a gif from multiple layers?? is that possible?
function download(){

	// get image data from current canvas as blob
	var data = document.getElementById(curCanvas).toBlob(function(blob){	
		var url = URL.createObjectURL(blob);
	
		var link = document.createElement('a');
		link.href = url;
		
		var name = prompt("please enter a name for the file");
		link.download = name;
	
		//simulate a click on the blob's url to download it 
		link.click();
	});
}
