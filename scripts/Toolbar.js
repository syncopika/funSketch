// toolbar class
// assemble the common functions for the toolbar

// remove canvas param since you have animationProj
function Toolbar(canvas, brush, animationProj){

	// keep this variable for storing the most recent imported image
	// can be useful for resetting image
	var recentImage;
	
	// used as a counter for the animation playback features
	var play = null;

	// this will only work for the very first frame!!
	// when each method is called, the current canvas needs to be recalculated
	//var canvas = animationProj.frameList[animationProj.currentFrame];
	
	// used to hold user-indicated time (ms) per frame for animation playback and gif
	this.timePerFrame = 200; // set to 200 be default
	
	// should the keyboard keys be affecting the layer or the frame? 2 options only
	// this is useful for the arrow keys and space bar
	this.layerMode = true;
	
	this.htmlCounter = ""; // html element used as a counter specifying the current frame and layer
	
	this.setCounter = function(elementId){
		this.htmlCounter = document.getElementById(elementId);
	}
	
	this.up = function(){
		// this moves the current layer to the next one if exists
		var canvas = animationProj.getCurrFrame();
		if(canvas.currentIndex + 1 < canvas.canvasList.length){
			// move to next canvas
			canvas.currentCanvas.style.opacity = .92; // apply onion skin to current canvas 
			canvas.currentCanvas.style.zIndex = 0;
			
			// in the special case for when you want to go to the next canvas from the very first one, 
			// ignore the step where the opacity and z-index for the previous canvas get reset to 0.
			if(canvas.currentIndex > 0){
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
	}
	
	this.down = function(){	
		// this moves the current layer to the previous one if exists
		var canvas = animationProj.getCurrFrame();
		if(canvas.currentIndex - 1 >= 0){
			// move to previous canvas 
			// first make current canvas not visible anymore
			canvas.currentCanvas.style.opacity = 0;
			canvas.currentCanvas.style.zIndex = 0;
			
			// make previous canvas visible 
			canvas.canvasList[canvas.currentIndex - 1].style.opacity = .97;
			canvas.canvasList[canvas.currentIndex - 1].style.zIndex = 1;
			console.log("moving to frame: " + (canvas.number) + ", layer: " + (canvas.currentIndex-1));
			
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
	}
	
	this.nextFrame = function(){
		animationProj.updateOnionSkin();
		var curr = animationProj.getCurrFrame();
		var next = animationProj.nextFrame();
		if(next !== null){
			curr.hide(); // maybe do something else so as to not clutter the DOM?
			next.show();
			brush.defaultBrush();
			return true;
		}
		return false;
	}
	
	this.prevFrame = function(){
		animationProj.updateOnionSkin();
		var curr = animationProj.getCurrFrame();
		var prev = animationProj.prevFrame();
		if(prev !== null){
			curr.hide(); // maybe do something else so as to not clutter the DOM?
			prev.show();
			brush.defaultBrush();
			return true;
		}
		return false;
	}
	
	this.addPage = function(){
		var canvas = animationProj.getCurrFrame();
		canvas.setupNewLayer();
	}
	
	this.setKeyDown = function(doc){
		
		if(this.htmlCounter === ""){
			return;
		}
		
		var toolbar = this;
		var counterText = this.htmlCounter;
		
		$(doc).keydown(function(e){
			switch(e.which){
				case 37: //left arrow key
					if(toolbar.down()){
						var canvas = animationProj.getCurrFrame();
						counterText.textContent = "frame: " + (animationProj.currentFrame+1) + ", layer: " + (canvas.currentIndex + 1);
					}
				break;
				case 39: //right arrow key
					if(toolbar.up()){
						var canvas = animationProj.getCurrFrame();
						counterText.textContent = "frame: " + (animationProj.currentFrame+1) + ", layer: " + (canvas.currentIndex + 1);
					}
				break;
				case 32: //space bar
					if(toolbar.layerMode){
						toolbar.addPage();
					}else{
						toolbar.addNewFrame();
					}
				break;
				case 65: // a key 
					if(toolbar.prevFrame()){
						var canvas = animationProj.getCurrFrame();
						counterText.textContent = "frame: " + (animationProj.currentFrame+1) + ", layer: " + (canvas.currentIndex + 1);
					}
				break;
				case 68: // d key 
					if(toolbar.nextFrame()){
						var canvas = animationProj.getCurrFrame();
						counterText.textContent = "frame: " + (animationProj.currentFrame+1) + ", layer: " + (canvas.currentIndex + 1);
					}
				break;
				default:
				return;
			}
			e.preventDefault();
		});
	}
	
	/***
		insert a frame after the current frame 
	***/
	this.insertLayer = function(elementId){
		// not sure if better idea to add the container the layers go in as an instance variable 
		// or pass in elementId here? 
		$('#' + elementId).click(function(){

			var canvas = animationProj.getCurrFrame();
			
			// add a new canvas first 
			canvas.setupNewLayer();
			
			// then move it after the current canvas 
			var newestCanvas = canvas.canvasList.pop();
			canvas.canvasList.splice(canvas.currentIndex + 1, 0, newestCanvas);
		});
	}
	
	/***
		delete current frame
		shifts the current frame to the next one if there is one. 
		otherwise, the previous frame will become the current one.
		if there isn't a previous one either, then the frame will just be made blank.
	***/
	this.deleteLayer = function(elementId, counterId){
		// TODO: refactor to use the htmlCounter variable so no need to pass in counterId!
		// elementId here refers to the display that shows current frame and layer
			
			var toolbarReference = this;
			
			$('#' + elementId).click(function(){
				
				var canvas = animationProj.getCurrFrame();
				var oldCanvasIndex = canvas.currentIndex;
				var oldCanvasId = canvas.currentCanvas.id;
				var parentNode = document.getElementById(oldCanvasId).parentNode;
				
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
					if(counterId){
						document.getElementById(counterId).textContent = "frame: " + (animationProj.currentFrame+1) + ", layer:" + (canvas.currentIndex+1);
					}
					
				}else{
					// otherwise, just blank the canvas 
					var context = canvas.currentCanvas.getContext("2d");
					context.clearRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
					context.fillStyle = "#fff";
					context.fillRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
				}
			});
	}
	
	/***
		add a new frame 
		note that it's adding a supercanvas instance
	***/
	this.addNewFrameButton = function(elementId){
		var self = this;
		$('#' + elementId).click(function(){
			// each time you move to a new frame, 
			// merge all the layers of the previous frame and put it in the onion skin frame?
			// also cache frames maybe?
			self.addNewFrame();
		});
	}
	
	this.addNewFrame = function(){
		// TODO: why is this here? I think it should be Animation's responsibility to be able to add a new frame!
		var newFrame = new SuperCanvas(animationProj.container, animationProj.frameList.length);
		newFrame.setupNewLayer();
		newFrame.hide();
		animationProj.add(newFrame);
	}
	

	/***
		color wheel functions
	***/
	// pass in the elementId of the div where the color wheel should be 
	// pass in the size of the canvas of the color wheel 
	this.createColorWheel = function(elementId, size){
		
		var location = document.getElementById(elementId);
		
		var colorWheel = document.createElement('canvas');
		colorWheel.id = "colorWheel";
		colorWheel.setAttribute('width', size);
		colorWheel.setAttribute('height', size);
		
		var colorWheelContext = colorWheel.getContext('2d');

		var x = colorWheel.width / 2;
		var y = colorWheel.height / 2;
		var radius = 90;

		// why 5600??
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
		
		// make black a pickable color 
		colorWheelContext.fillStyle = "#000";
		colorWheelContext.fillRect(0, 0, 8, 8);
		// make white pickable too 
		colorWheelContext.fillRect(10, 0, 8, 8); // border around the white 
		colorWheelContext.fillStyle = "#fff";
		colorWheelContext.fillRect(11, 0, 6, 7);
		
		location.appendChild(colorWheel);
		
		// make the color wheel interactive and show picked color 
		var showColor = document.createElement('p'); // this element will show the color picked 
		showColor.style.textAlign = 'center';
		showColor.id = 'colorPicked';
		showColor.textContent = "pick a color! :)";
		location.appendChild(showColor);
		
		$('#' + colorWheel.id).mousedown(function(e){ 
			var x = e.offsetX;
			var y = e.offsetY;
			var colorPicked = (document.getElementById(colorWheel.id).getContext('2d')).getImageData(x, y, 1, 1).data;
			var colorPickedText = document.getElementById(showColor.id);
		
			//correct the font color if the color is really dark
			if(colorPicked[0] > 10 && colorPicked[1] > 200){
				$('#' + showColor.id).css("color", "#000");
			}else{
				$('#' + showColor.id).css("color", "#FFF");
			}
			
			colorPickedText.textContent = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
			$('#' + showColor.id).css({'background-color': colorPickedText.textContent});

			// update current color seleted in brush object as Uint8 clamped array where each index corresponds to r,g,b,a
			brush.currColorArray = colorPicked;
			brush.currColor = 'rgb(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ')';
		});	
	}
	
	/***
	
		attach floodfill function! 
	
		still a bit slow. also, maybe instead of matching only exact color,
		how about +/- 5 for r,g,b? 
		
		also, maybe disable drawing? what if someone has the radial brush on 
		and they want to floodfill? it should operate normally in that case too.
		might have to turn off the brush temporarily, then reconnect it?
	
	***/
	this.floodFill = function(elementId){

		$('#' + elementId).click(function(){

			var canvas = animationProj.getCurrFrame();
			
			var doFloodFill = function(e){
	
				// this is the color to change to!
				// need to parse the currColor because right now it looks like "rgb(x,y,z)". 
				// I want it to look like [x, y, z]
				var currColor = brush.currColor;	
				var currColorArray = currColor.substring(currColor.indexOf('(') + 1, currColor.length - 1).split(',');
				currColorArray = currColorArray.map(function(a){ return parseInt(a) });

				// get the coordinates of the selected pixel 
				var x = e.pageX - $('#' + canvas.currentCanvas.id).offset().left;
				var y = e.pageY - $('#' + canvas.currentCanvas.id).offset().top;
				console.log("x: " + x + ", y: " + y);
				
				/* debugging cursor/click position - if you scroll, that offsets the position and ruins everything :<
				var d = document.getElementById(canvas.currentCanvas.id).getContext("2d").getImageData(x, y, 10, 10);
				for(var i = 0; i < d.data.length; i+=4){
					d.data[i] = 100;
					d.data[i + 1] = 170;
					d.data[i + 2] = 200;
				}
				document.getElementById(canvas.currentCanvas.id).getContext("2d").putImageData(d, x, y);
				*/
				
				var colorData = document.getElementById(canvas.currentCanvas.id).getContext("2d").getImageData(x, y, 1, 1).data;
				var color = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';
				console.log(color)
				// create an object with the pixel data
				var pixel = {'x': Math.floor(x), 'y': Math.floor(y), 'color': color};
				
				// call the floodfill function!
				// currentCanvas is a canvas element
				floodfill(canvas.currentCanvas, currColorArray, pixel);
				
				// remove event listener 
				canvas.currentCanvas.removeEventListener('click', doFloodFill);
			}
			
			canvas.currentCanvas.addEventListener('click', doFloodFill); 
		});			
	}
	
	// the actual floodfill function 
	function floodfill(currentCanvas, newColor, pixelSelected){

		// create a stack 
		var stack = [];
		
		// create visited set 
		// the format of these entries will be like: {'xCoord,yCoord': 1}
		var visited = {};
		
		// the selectedPixel will have the color that needs to be targeted by floodfill 
		var targetColor = pixelSelected.color;
		
		// current canvas context 
		var ctx = document.getElementById(currentCanvas.id).getContext('2d');
		
		// get the image data of the entire canvas 
		// do the floodfill, then put the edited image data back 
		var imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
		var data = imageData.data;
	
		stack.push(pixelSelected);
		
		while(stack.length !== 0){
			
			// get a pixel
			var currPixel = stack.pop();
			// add to visited set 
			visited[currPixel.x + ',' + currPixel.y] = 1;
			
			// get left, right, top and bottom neighbors 
			var leftNeighborX = currPixel.x - 1;
			var rightNeighborX = currPixel.x + 1;
			var topNeighborY = currPixel.y - 1;
			var bottomNeighborY = currPixel.y + 1;
	
			var r,g,b;
			
			// top neighbor
			if(topNeighborY >= 0 && visited[currPixel.x + ',' + topNeighborY] === undefined){
				// index of r, g and b colors in imageData.data
				r = (topNeighborY * currentCanvas.width)*4 + ((currPixel.x + 1) * 4);
				g = r + 1;
				b = g + 1;
				if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
					// if the neighbor's color is the same as the targetColor, add it to the stack
					stack.push({'x': currPixel.x, 'y': topNeighborY, 'color': currPixel.color});
				}
			}
			
			// right neighbor 
			if(rightNeighborX < currentCanvas.width && visited[rightNeighborX + ',' + currPixel.y] === undefined){
				r = (currPixel.y * currentCanvas.width)*4 + ((rightNeighborX + 1) * 4);
				g = r + 1;
				b = g + 1;
				if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
					// if the neighbor's color is the same as the targetColor, add it to the stack
					stack.push({'x': rightNeighborX, 'y': currPixel.y, 'color': currPixel.color});
				}
			}
			
			// bottom neighbor
			if(bottomNeighborY < currentCanvas.height && visited[currPixel.x + ',' + bottomNeighborY] === undefined){
				r = (bottomNeighborY * currentCanvas.width)*4 + ((currPixel.x + 1) * 4);
				g = r + 1;
				b = g + 1;
				if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
					// if the neighbor's color is the same as the targetColor, add it to the stack
					stack.push({'x': currPixel.x, 'y': bottomNeighborY, 'color': currPixel.color});
				}
			}
			
			// left neighbor
			if(leftNeighborX >= 0 && visited[leftNeighborX + ',' + currPixel.y] === undefined){
				r = (currPixel.y * currentCanvas.width)*4 + ((leftNeighborX + 1) * 4);
				g = r + 1;
				b = g + 1;
				if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
					// if the neighbor's color is the same as the targetColor, add it to the stack
					stack.push({'x': leftNeighborX, 'y': currPixel.y, 'color': currPixel.color});
				}
			}
			
			// finally, update the color of the current pixel 
			r = (currPixel.y * currentCanvas.width)*4 + ((currPixel.x + 1) * 4);
			g = r + 1;
			b = g + 1;
			data[r] = newColor[0];
			data[g] = newColor[1];
			data[b] = newColor[2];
		}
		
		// put new edited image back on canvas 
		ctx.putImageData(imageData, 0, 0);
	}
	
	/***
		rotate image 
		pass in an element id that will rotate the current canvas image on click 
		
		currently buggy! after rotation, image becomes blurred. also, when attempting to draw on same canvas,
		coordinates get altered so on mousedown the drawing gets offset 
	***/
	this.rotateImage = function(elementId){
		//rotate image
		$('#' + elementId).click(function(){
			var canvas = animationProj.getCurrFrame();
			//using a promise to convert the initial image to a bitmap
			var width = canvas.currentCanvas.getAttribute("width");
			var height = canvas.currentCanvas.getAttribute("height");
			var context = canvas.currentCanvas.getContext("2d");
			Promise.all([
				createImageBitmap(canvas.currentCanvas, 0, 0, width, height)
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
	
	/***
		clear the current canvas
		pass in an element id that will execute clear canvas onclick 
	***/
	this.setClearCanvas = function(elementId){
		$('#' + elementId).click(function(){
			var canvas = animationProj.getCurrFrame();
			var context = canvas.currentCanvas.getContext("2d");
			context.clearRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
			context.fillStyle = "#FFFFFF";
			context.fillRect(0, 0, canvas.currentCanvas.getAttribute('width'), canvas.currentCanvas.getAttribute('height'));
		});
	}
	
	/***
		undo a previous drawing operation on the current canvas.
		still a little incorrect?
	***/
	this.undo = function(elementId){
		$('#' + elementId).click(function(){
			var canvas = animationProj.getCurrFrame();
			var context = canvas.currentCanvas.getContext("2d");
			var width = canvas.currentCanvas.getAttribute("width");
			var height = canvas.currentCanvas.getAttribute("height");
			
			// unshift to add to front of stack of snapshots. 
			brush.currentCanvasSnapshots.unshift(context.getImageData(0, 0, width, height));
			
			// clear first
			context.clearRect(0, 0, width, height);
			
			// then put back last image (ignore the one that had just been drawn)
			// snapshots is a temp variable that only holds all the images up to the 2nd to last image drawn. 
			// if you keep up to the last image drawn, then you have to click undo twice initially to get to the previous frame.
			if(brush.currentCanvasSnapshots.length >= 1){
				var mostRecentImage = brush.currentCanvasSnapshots.pop();
				context.putImageData(mostRecentImage, 0, 0);
			}
		});
	}
	
	/***
		import an image
	***/
	this.importImage = function(elementId){
		$('#' + elementId).click(function(){

			var canvas = animationProj.getCurrFrame();
			
			// call fileHandler here
			fileHandler();
		
			// define fileHandler 
			function fileHandler(){
				//initiate file choosing after button click
				var input = document.createElement('input');
				input.type = 'file';
				input.addEventListener('change', getFile, false);
				input.click();
			}

			function getFile(e){
				var img = new Image();
				var reader = new FileReader();
				var file = e.target.files[0];
				if (!file.type.match(/image.*/)){
					console.log("not a valid image");
					return;
				}
				//when the image loads, put it on the canvas.
				img.onload = function(){
					
					// change current canvas' width and height according to imported picture
					// to keep proportion 
					// i.e. if width is at least 100px more than height, scale the current canvas'
					// height back by multiplying .9 to 800. 
					var currentCanvas = canvas.currentCanvas;
					var context = currentCanvas.getContext("2d");
					var height = img.height;
					var width = img.width;
					
					if((img.width - img.height) >= 100){
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
					
					// assign recentImage variable the image 
					recentImage = img;
					
					// add the current image to snapshots 
					brush.currentCanvasSnapshots.push(context.getImageData(0, 0, width, height));
					
					//reset the value for the HTML input file thing so that you can use the same pic for consecutive frames!  
					//document.querySelector("#fileInput").value = null;
				}
				//after reader has loaded file, put the data in the image object.
				reader.onloadend = function(){
					img.src = reader.result;
				}
				//read the file as a URL
				reader.readAsDataURL(file);
			}			
		});
	}
	
	/***
		reset the canvas to most recent imported image 
	***/
	this.resetImage = function(){
		if(recentImage){
			var canvas = animationProj.getCurrFrame();
			var context = canvas.currentCanvas.getContext("2d");
			var height = canvas.currentCanvas.getAttribute("height");
			var width = canvas.currentCanvas.getAttribute("width");
			context.drawImage(recentImage, 0, 0, width, height);
		}
	}
	
	/***
		download a png file of the current canvas 
	***/
	this.download = function(elementId){
		$('#' + elementId).click(function(){
			// get image data from current canvas as blob
			var data = document.getElementById(canvas.currentCanvas.id).toBlob(function(blob){	
				var url = URL.createObjectURL(blob);
			
				var link = document.createElement('a');
				link.href = url;
				
				var name = prompt("please enter a name for the file");
				
				if(name === null){
					return;
				}else{
					link.download = name;
			
					//simulate a click on the blob's url to download it 
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
	var toolbar = this;
	var playFor = function(){
		if(toolbar.up()){
			var currNum = document.getElementById("count").textContent;
			document.getElementById("count").textContent = parseInt(currNum) + 1;
		}
	}
	
	var playBack = function(){
		if(toolbar.down()){
			var currNum = document.getElementById("count").textContent;
			document.getElementById("count").textContent = parseInt(currNum) - 1;
		}
	}

	this.playForward = function(){
		clearInterval(play);
		play = null;
		play = setInterval(playFor, this.timePerFrame);
	}

	this.playBackward = function(){	
		clearInterval(play);
		play = null;
	
		//canvas.currentCanvas = canvas.canvasList[canvas.canvasList.length - 1];
		canvas.currentCanvas.style.zIndex = 1;
		canvas.currentCanvas.style.opacity = .97;
		
		play = setInterval(playBack, this.timePerFrame);
	}

	this.stop = function(){
		clearInterval(play);
		play = null;
	}
	
	/***
	
		create a gif from the frames.
		using gif.js - https://github.com/jnordberg/gif.js
	
		elementId is for the loading message, 
		i.e. a <p> element that says "now loading..."
		
		this will need to be applied for FRAMES, not LAYERS of a frame.
	
	***/
	this.getGif = function(elementId){
		
		if(elementId){
			document.getElementById(elementId).textContent = "now loading...";
		}
		
		var gif = new GIF({
			workers: 2,
			quality: 10
		});
		
		// add frames
		for(var i = 0; i < canvas.canvasList.length; i++){
			gif.addFrame(canvas.canvasList[i], {delay: this.timePerFrame});
		}
		
		gif.on('finished', function(blob){
			document.getElementById(elementId).textContent = "";
			var newGif = URL.createObjectURL(blob);
			window.open( newGif );
		});
		
		gif.render();
		
	}
	
	/***
	
		save/export & import functions
		check this out: https://stackoverflow.com/questions/22329481/compressing-base64-data-uri-images
		
		don't think this is going to work without some sort of better compression. simply drawing a few lines on 
		a canvas produces a very large base64 string spanning many lines. not very practical for exporting a project
		that has several frames, especially if you take into account different colors and more detail 
		
	***/
	this.save = function(elementId){
		
		$('#' + elementId).click(function(){
			
			// prompt the user to name the file 
			var name = prompt("name of file: ");
			if(name === ""){
				name = "funSketch_saveFile";
			}else if(name === null){
				return;
			}
			
			var savedData = [];
			
			animationProj.frameList.forEach(function(frame){
				// get frame metadata
				var newFrame = frame.getMetadata();
				newFrame['layers'] = []; // list of objects
				frame.canvasList.forEach(function(layer){
					// get layer metadata
					var newLayer = {
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
			
			var json = "[\n";
			json += savedData.join(",\n"); // put a line break between each new object, which represents a frame
			json += "\n]";
			
			// make a blob so it can be downloaded 
			var blob = new Blob([json], {type: "application/json"});
			var url = URL.createObjectURL(blob);
			
			var link = document.createElement('a');
			link.href = url;
			link.download = name + ".json";
			link.click();
			
		});
	}
	
	this.importProject = function(elementId, counterId){
		
		var self = this;
		
		$('#' + elementId).click(function(){
			
			fileHandler();
			
			//import project json file
			function fileHandler(){
				var input = document.createElement('input');
				input.type = 'file';
				input.addEventListener('change', getFile, false);
				input.click();
			}
			
			function getFile(e){
				var reader = new FileReader();
				var file = e.target.files[0];
				
				//when the file loads, put it on the canvas.
				reader.onload = (function(theFile){
				
					return function(e){

						// parse the JSON using JSON.parse 
						// check if it can be parsed though first!
						var data;
						try{
							data = JSON.parse(e.target.result);
						}catch(e){
							// not valid json file 
							return;
						}
						
						// do some validation
						// if there is no canvas
						// or it's a valid json object but no fields correspond to a canvas, quit
						if(!data[0] || (!data[0].name && !data[0].height && !data[0].width && !data[0].data)){
							console.log("it appears to not be a valid project! :<");
							return;
						}
						
						// everything checks out so far, so reset the canvas before loading the project 
						//canvas.resetCanvas(counterId);
						//console.log(data);
						
						// clear existing project
						animationProj.resetProject();
						// update UI 
						if(self.htmlCounter){
							// ideally if you use react or some library that can update the view based on the current state,
							// you shouldn't need this at all. hint hint.
							self.htmlCounter.textContent = "frame: " + (animationProj.currentFrame+1) + ", layer: " + (canvas.currentIndex + 1);
						}
						
						// load saved project
						data.forEach(function(frame, index){
							if(index > 0){
								// add a new frame
								self.addNewFrame();
							}
							// overwrite existing frame
							// TODO: implement an updateFrame method 
							// animationProj.updateFrame(0, frame); // updateFrame takes an index of the existing frame to overwrite and takes a SuperCanvas object to update with as well
							var currFrame = animationProj.frameList[index];
							console.log("need to add " + frame.layers.length + " layers for frame: " + (index+1));
							
							var currFrameLayersFromImport = frame.layers; // looking at data-to-import's curr frame's layers
							var currFrameLayersFromCurrPrj = currFrame.canvasList;
							currFrameLayersFromImport.forEach(function(layer, layerIndex){
								if((layerIndex+1) > currFrameLayersFromCurrPrj.length){
									// add new layer to curr project as needed based on import
									console.log("need to add a new layer for frame: " + index);
									animationProj.frameList[index].setupNewLayer();
								}
								var currLayer = animationProj.frameList[index].canvasList[layerIndex];
								
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
				})(file);
				
				reader.readAsText(file);
			}
			
		});
		
	}
	
} // end of Toolbar 


