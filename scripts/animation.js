/***

	functions relevant to animating 

****/
//this will hold each canvas' image data (important for cloning and undoing!!)
var canvasData = {};

//add a new canvas
function addPage(){
	
	page = page + 1;
	
	var canvasClone = $('#canvas0').clone();
	var newId = 'canvas' + page;
	
	layerArray.push(newId);
	
	canvasClone.addClass('canvas');
	canvasClone.attr('id', newId);

	var top = $('#' + curCanvas).position().top;
	var left = $('#canvas0').position().left;
	
	canvasClone.css({"position": "absolute", "top": top+"px", "left": left+"px", "z-index":0, "border": "1px black solid", "opacity":0});
	canvasClone.attr({"width": 800, "height": 800}); // let 800 x 800 be default size 
	canvasClone.appendTo('#picture');

	//set canvas bg color to white!
	$('#' + newId)[0].getContext('2d').fillStyle = "#FFFFFF";
	$('#' + newId)[0].getContext('2d').fillRect(0, 0, 800, 800);
}

//clone the previous canvas
function clonePage(){
	
	page = page + 1;
	
	var canvasClone = $('#' + curCanvas).clone();//cloning the previous canvas only copies the canvas, not what's in it...
	var newId = 'canvas' + page;
	var top = $('#canvas0').position().top;
	var left = $('#canvas0').position().left;
	
	layerArray.push(newId);
	canvasClone.addClass('canvas');
	canvasClone.attr('id', newId);
	canvasClone.css({"position": "absolute", "top": top+"px", "left": left+"px", "z-index":0, "border": "1px black solid", "opacity":.4});
	canvasClone.appendTo('#picture');

	//set canvas bg color to white!
	$('#' + newId)[0].getContext('2d').fillStyle = "#FFFFFF";
	$('#' + newId)[0].getContext('2d').fillRect(0, 0, context.canvas.width, context.canvas.height);

	//get image data for frame you want to clone
	var canvasToClone = context.getImageData(0, 0, context.canvas.width, context.canvas.height);

	//assign context to new canvas
	context = document.getElementById(newId).getContext("2d");

	//draw image data of most recent version of current canvas
	context.putImageData(canvasToClone, 0, 0);
	
	//also update canvasData, so that undo will work for clone!
	canvasData[newId] = [canvasToClone];
}


//function for storing/modifying pixel data for each canvas
function storePixelData(){

	if(canvasData[curCanvas] === undefined){
		canvasData[curCanvas] = [context.getImageData(0, 0, width, height)];
	}
	//if user returns to a previous canvas, add any new pixel data to the  existing array
	else if(canvasData[curCanvas] !== 'undefined' && canvasData[curCanvas].length < 10){
		canvasData[curCanvas].push(context.getImageData(0, 0, width, height));
	}
	else if(canvasData[curCanvas] !== 'undefined' && canvasData[curCanvas].length === 10){
		//remove the first entry of the array and put in the latest drawing
		canvasData[curCanvas].shift();
		canvasData[curCanvas].push(context.getImageData(0, 0, width, height));
	}
}

//UP
function up(){
	//reset undo counter
	undoCounter = undefined;
	
	if(curPage < page){
		curPage = curPage + 1;
		$('#count').html(curPage);
		curCanvas = layerArray[curPage];
	
		//if canvas wasn't white, you could set opacity to 1.
		//but if you keep a white background, curCanvas needs to be somewhat opaque
		//in order to see the canvas behind it (for animation aiding purposes)
		$('#' + curCanvas).css({"z-index":10, "opacity": .9}); 
		
		//update to correct context
		context = document.getElementById(curCanvas).getContext("2d");

		for(i=0;i<layerArray.length;i++){
			if(layerArray[i] !== curCanvas){
				$('#' + layerArray[i]).css({"z-index":0,"opacity":0});
			}
		};
		//set only the second-to-last canvas a lower opacity
		$('#' + layerArray[curPage-1]).css({"z-index":0,"opacity":.6});
	}

	//reset
	//when you leave a frame, reset everything!
	clearClick();
	draw();
}
$("#up").click(up);

//DOWN
function down(){
	//reset undo counter
	undoCounter = undefined;
	
	if(curPage > 0){
		curPage = curPage - 1;
		$('#count').html(curPage);
		curCanvas = layerArray[curPage];
		$('#' + curCanvas).css({"z-index":10, "opacity": .9});
	}

	context = document.getElementById(curCanvas).getContext("2d");

	for(i=0;i<layerArray.length;i++){
		if(layerArray[i] !== curCanvas){
			$('#' + layerArray[i]).css({"z-index":0,"opacity":0});
		}
	};

	$('#' + layerArray[curPage-1]).css({"z-index":0,"opacity":.6});

	//when you leave a frame, reset everything!
	clearClick();
	draw();
}
$("#down").click(down);

//keymapping
$(document).keydown(function(e){
	switch(e.which){
		case 37: //left arrow key
		down();
		break;
		case 39: //right arrow key
		up();
		break;
		case 32: //space bar
		addPage();
		break;
		default:
		return;
	}
	e.preventDefault();
});

//functions for animation playback
var play;
function playForward(){
	play = null;
	play = setInterval(up,1000);
}

function playBackward(){
	play = null;
	//autofocus on last frame
	$('#' + layerArray[layerArray.length-1]).css({"z-index":10, "opacity": .8});
	curCanvas = layerArray[page];
	curPage = page;
	play = setInterval(down,1000);
}

function stop(){
	clearInterval(play);
}
