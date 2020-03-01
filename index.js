import { Frame, AnimationProject } from './built/SuperCanvas.js';
import { Brush } from './built/Brush.js';
import { Toolbar } from './built/Toolbar.js';

// prevent FOUC
document.addEventListener("DOMContentLoaded", function(){
	$('html').css('display', 'block');
});

// set up project
var project = new AnimationProject('canvasArea');
project.addNewFrame(true); // since it's the first frame, show it
var newCanvas = project.getCurrFrame(); //new SuperCanvas('canvasArea', project.frameList.length);
//newCanvas.setupNewLayer();
//project.add(newCanvas);

// set up brush
var newBrush = new Brush(project);
newBrush.defaultBrush();

// set up toolbar 
// here I'm passing in element Id's that these functions will attach to
var newToolbar = new Toolbar(newCanvas, newBrush, project);
newToolbar.setCounter("count");
newToolbar.setKeyDown(document);	// enables new canvas add on spacebar, go to next with right arrow, prev with left arrow.
newToolbar.createColorWheel('colorPicker', 200);
newToolbar.floodFill('floodfill');
newToolbar.insertLayer('insertCanvas');
newToolbar.deleteLayer('deleteCanvas', 'count');
newToolbar.setClearCanvas('clearCanvas');
newToolbar.rotateImage('rotateCanvasImage'); 
newToolbar.undo('undo');
newToolbar.download('download');
newToolbar.importImage('importImage');
newToolbar.save('saveWork');
newToolbar.importProject('importProject', 'count');
newToolbar.addNewFrameButton('addNewFrame');

// make the goLeft and goRight arrows clickable FOR LAYERS
// note: this is for clicking the icons with a mouse!
$('#goLeft').click(function(){
	if(newToolbar.down()){
		var curr = project.getCurrFrame();
		document.getElementById("count").textContent = "frame: " + (project.currentFrame+1) + ", layer: " + (curr.currentIndex + 1);
	}
});
$('#goRight').click(function(){
	if(newToolbar.up()){
		var curr = project.getCurrFrame();
		document.getElementById("count").textContent = "frame: " + (project.currentFrame+1) + ", layer: " + (curr.currentIndex + 1);
	}
});

// left and right arrows for FRAMES
$('#prevFrame').click(function(){
	if(newToolbar.prevFrame()){
		var curr = project.getCurrFrame();
		document.getElementById("count").textContent = "frame: " + (project.currentFrame+1) + ", layer: " + (curr.currentIndex + 1);
	}
});

$('#nextFrame').click(function(){
	if(newToolbar.nextFrame()){
		var curr = project.getCurrFrame();
		document.getElementById("count").textContent = "frame: " + (project.currentFrame+1) + ", layer: " + (curr.currentIndex + 1);
	}
});

$('#generateGif').click(function(){
	newToolbar.getGif("loadingScreen");
});

$('#toggleLayerOrFrame').click(function(){
	element = document.getElementById("toggleLayerOrFrame");
	if(newToolbar.layerMode){
		newToolbar.layerMode = false;
		element.textContent = "toggle layer addition on spacebar press";
	}else{
		newToolbar.layerMode = true;
		element.textContent = "toggle frame addition on spacebar press";
	}
});

// set up filters object
var newFilters = new Filters(newCanvas, newBrush);

document.getElementById('filterSelect').addEventListener('click', function(){ showOptions('filters') });
document.getElementById('brushSelect').addEventListener('click', function(){ showOptions('brushes') });

// show options when clicking on filters or brushes 
function showOptions(category){
	var el = document.getElementById(category);
	var child = el.children[1]; // skip the p element and get the ul element
	if(child.style.display !== "block" ){
		child.style.display = "block";
	}else{
		child.style.display = "none";
		el.style.marginBottom  = 0;
	}
}

// update brush size display
function showSize(){
	document.getElementById('brushSizeValue').textContent = document.getElementById('brushSize').value;
}

// show some samples/demos!!
function getDemo(selectedDemo){

	// case for the blank option 
	if(selectedDemo.options[selectedDemo.selectedIndex].text === ""){
		return;
	}

	// get the selected demo from the dropbox
	// selectedDemo is the path to the demo to load 
	var selectedDemo = "demos/" + selectedDemo.options[selectedDemo.selectedIndex].text + ".json"; 

	var httpRequest = new XMLHttpRequest();

	if(!httpRequest){
		return;
	}
	
	// set request type
	httpRequest.open("GET", selectedDemo);
	
	// what to do when data comes back
	httpRequest.onload = function(){
		
		// parse the JSON using JSON.parse 
		var data = JSON.parse(httpRequest.responseText);

		if(!data[0] || (!data[0].name && !data[0].height && !data[0].width && !data[0].data)){
			console.log("it appears to not be a valid project! :<");
			return;
		}

		// clear existing project
		project.resetProject();
		// update UI 
		if(newToolbar.htmlCounter){
			// ideally if you use react or some library that can update the view based on the current state,
			// you shouldn't need this at all. hint hint.
			newToolbar.htmlCounter.textContent = "frame: " + (project.currentFrame+1) + ", layer: " + (project.frameList[project.currentFrame].currentIndex + 1);
		}
		
		// load saved project
		data.forEach(function(frame, index){
			if(index > 0){
				// add a new frame
				project.addNewFrame();
			}
			// overwrite existing frame
			// TODO: implement an updateFrame method 
			// animationProj.updateFrame(0, frame); // updateFrame takes an index of the existing frame to overwrite and takes a SuperCanvas object to update with as well
			var currFrame = project.frameList[index];
			console.log("need to add " + frame.layers.length + " layers for frame: " + (index+1));
			
			var currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
			var currFrameLayersFromCurrPrj = currFrame.canvasList;
			currFrameLayersFromImport.forEach(function(layer, layerIndex){
				if((layerIndex+1) > currFrameLayersFromCurrPrj.length){
					// add new layer to curr project as needed based on import
					console.log("need to add a new layer for frame: " + index);
					project.frameList[index].setupNewLayer();
				}
				var currLayer = project.frameList[index].canvasList[layerIndex];
				
				// is this part necessary? maybe, if you want the project to look exactly as when it was saved.
				currLayer.style.opacity = layer.opacity;
				currLayer.style.zIndex = layer.zIndex;  
				currLayer.height = layer.height;
				currLayer.width = layer.width;
				
				// add the image data 
				var newCtx = currLayer.getContext("2d");
				var img = new Image();
				
				(function(context, image){
					image.onload = function(){
							context.drawImage(image, 0, 0);
						}
					image.src = layer.imageData;
				})(newCtx, img);
				
			});
		});
						
	}
	
	// send the request 
	httpRequest.send();
}
