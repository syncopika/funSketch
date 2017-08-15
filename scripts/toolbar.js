// toolbar class
// assemble the common functions for the toolbar

// pass in a super canvas and brush object
function Toolbar(canvas, brush){

	this.up = function(){
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
			brush.defaultBrush(canvas);
			return true;
		}
		return false;
	}
	
	this.down = function(){	
		if(canvas.currentIndex - 1 >= 0){
			// move to previous canvas 
			// first make current canvas not visible anymore
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
			brush.defaultBrush(canvas);
			return true;
		}
		return false;
	}
	
	this.addPage = function(){
		canvas.setupNewCanvas();
	}
	
	/***
		add an optional second argument (an element id) for an element to function like a counter to
		show what canvas number is curently shown 
	***/
	this.setKeyDown = function(doc, elementId){
		var toolbar = this;
		//keymapping
		$(doc).keydown(function(e){
			switch(e.which){
				case 37: //left arrow key
				if(toolbar.down() && elementId){
					var currNum = document.getElementById(elementId).textContent;
					document.getElementById(elementId).textContent = parseInt(currNum) - 1;
				}
				break;
				case 39: //right arrow key
				if(toolbar.up() && elementId){
					var currNum = document.getElementById(elementId).textContent;
					document.getElementById(elementId).textContent = parseInt(currNum) + 1;
				}
				break;
				case 32: //space bar
				toolbar.addPage();
				break;
				default:
				return;
			}
			e.preventDefault();
		});
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
		
		colorWheelContext.fillStyle = "#000";
		colorWheelContext.fillRect(0, 0, 8, 8);
		
		
		location.appendChild(colorWheel);
		
		// make the color wheel interactive and show picked color 
		var showColor = document.createElement('p'); // this eleemnt will show the color picked 
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
		rotate image 
		pass in an element id that will rotate the current canvas image on click 
		buggy! after rotation, image becomes blurred. also, when attempting to draw on same canvas,
		coordinates get altered so on mousedown the drawing gets offset 
	***/
	this.rotateImage = function(elementId){
		//rotate image
		$('#' + elementId).click(function(){
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
					var height;
					var width;
					
					if((img.width - img.height) >= 100){
						currentCanvas.setAttribute('height', Math.floor(800 * .9));
						currentCanvas.setAttribute('width', Math.floor(800 * 1.1));
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
	
	
	/******** this section controls the animation playback features *********/
	// use canvas.play as a counter 
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
	
}



