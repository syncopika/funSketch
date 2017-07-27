//library for picture import, filters
//use this library to set ALL new variables that only these functions will use. 

//reference: http://www.storminthecastle.com/2013/04/06/how-you-can-do-cool-image-effects-using-html5-canvas/

var img = new Image();

function fileHandler(){
	//initiate file choosing after button click
	var input = document.getElementById('fileInput');
	input.addEventListener('change', getFile, false);
	input.click();
}

function getFile(e){
	var reader = new FileReader();
	var file = e.target.files[0];
	if (!file.type.match(/image.*/)){
		console.log("not a valid image");
		return;
	}
	//when the image loads, put it on the canvas.
	img.onload = function(){
		context.drawImage(img, 0, 0, width, height);
		//log pixels of picture (this is for my drawing/animating app)
		storePixelData();
		//reset the value for the HTML input file thing so that you can use the same pic for consecutive frames!  
		document.querySelector("#fileInput").value = null;
		//reset contrast value every time a new pic is imported
		contrastVal = 0;
	}
	//after reader has loaded file, put the data in the image object.
	reader.onloadend = function(){
		img.src = reader.result;
	}
	//read teh file as a URL
	reader.readAsDataURL(file);
};

/**BEGIN FILTERS**/
//general filtering function. pass any kind of filter through this function.
//bind to onclick in html! 
function filterCanvas(filter){
	var imgData = context.getImageData(0, 0, width, height);
	filter(imgData);
	context.putImageData(imgData, 0, 0);
}

/**
* GRAYSCALE FILTER
*/
//grayscale filter using an arithmetic average of the color components
//the 'pixels' parameter will be the imgData variable. 
function grayscale(pixels){
var d = pixels.data;
for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i + 1];
      var b = d[i + 2];
	  //the value obtained by (r+g+b)/3 will be the value assigned to d[i], d[i+1], and d[i+2].  
      d[i] = d[i + 1] = d[i + 2] = (r+g+b)/3;
    }
    return pixels;
};

//sepia filter
function sepia(pixels){
	var d = pixels.data;
	for (var i = 0;i < d.length; i += 4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		d[i] = (r*.5) + (g*.2) + (b*.3); //red
		d[i+1] = (r*.2) + (g*.3) + (b*.5); //green
		d[i+2] = (r*.6) + (g*.3) + (b*.4); //blue
	}
	return pixels;
};


/**
* SATURATION FILTER
* source: http://www.qoncious.com/questions/changing-saturation-image-html5-canvas-using-javascript
*/
function saturate(pixels){
	var saturationValue = 2.5;
	var d = pixels.data;
	var lumR = .3086 //constant for determining luminance of red
	var lumG = .6094 //constant for determining luminance of green
	var lumB = .0820 //constant for determining luminance of blue
	
	//one of these equations per r,g,b
	var r1 = (1 - saturationValue) * lumR + saturationValue;
	var g1 = (1 - saturationValue) * lumG + saturationValue;
    var b1 = (1 - saturationValue) * lumB + saturationValue;	
	
	//then one of these for each
	var r2 = (1 - saturationValue) * lumR;
	var g2 = (1 - saturationValue) * lumG;
    var b2 = (1 - saturationValue) * lumB;	
	
	for(var i = 0; i < d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		d[i] = r*r1 + g*g2 + b*b2;
		d[i+1] = r*r2 + g*g1 + b*b2;
	    d[i+2] = r*r2 + g*g2 + b*b1;
	}
	return pixels;
}

/**
* COLOR SWAP FILTER
* this function swaps colors
*/
function swap(pixels){
	var d = pixels.data;
	for(var i=0;i<d.length;i+=4){
		var r = d[i];
		var g = d[i+1];
	    var b = d[i+2];
	
		d[i] = b;
		d[i+1] = r;
		d[i+2] = g
	}
	return pixels;
}

/**
* this function creates bands
*/
function banded(pixels){
	var d = pixels.data;
	for(var i=0; i<d.length;i+=12){
		var r = d[i];
		var g = d[i+1];
	    var b = d[i+2];
		
		d[i] = "#FFFFFF";
		d[i+1] = "#FFFFFF";
		d[i+2] = "#FFFFFF";
	}
}

/**
* PURPLE CHROME FILTER
* this function creates a light purplish 'chrome' effect
*/
function purpleChrome(pixels){
	var d = pixels.data;
	for(var i=0; i<d.length;i++){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		d[i+1] = b;
		d[i+2] = g;
		d[i] = r;
	}
	return pixels;
}

/**
* this filter turns any white spots purple
*/
function purplizer(pixels){
	//aka purplefier - all pixels with green=red or green>red become purple
	var d = pixels.data;
	for(var i=0; i<d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		var a = d[i+3];
		
		if(g >= r){
			d[i+2] = d[i+2]*2;
			d[i+1] = d[i+2]/2;
		}
	}
	return pixels;
}

/**
* SCARY(?) FILTER
* this filter turns everything dark 
*/
function scary(pixels){
	var saturationValue = 2.5;
	var d = pixels.data;
	
	//making the lumR,G,andB values nearly the same is equivalent to blacking out the picture i.e. 255,255,255 = black
	var lumR = .6020//constant for determining luminance of red
	var lumG = .6094 //constant for determining luminance of green
	var lumB = .6086////constant for determining luminance of blue
	
	//one of these equations per r,g,b
	var r1 = (1 - saturationValue) * lumR + saturationValue;
	var g1 = (1 - saturationValue) * lumG + saturationValue;
    var b1 = (1 - saturationValue) * lumB + saturationValue;	
	
	//then one of these for each
	var r2 = (1 - saturationValue) * lumR;
	var g2 = (1 - saturationValue) * lumG;
    var b2 = (1 - saturationValue) * lumB;	
	
	for(var i = 0; i < d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		d[i] = r*r1 + g*g2 + b*b2;
		d[i+1] = r*r2 + g*g1 + b*b2;
	    d[i+2] = r*r2 + g*g2 + b*b1;
	}
	return pixels;
}

/**
* 'HEATWAVE' FILTER
* this filter saturates and darkens some colors and produces an interesting palette
*/
function heatwave(pixels){
	var d = pixels.data;
	for(var i=0; i < d.length; i++){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		if(g > 100 && g < 200){
			d[i+1] = 0;
		}
		if(r < 100){
			d[i] = d[i]*2;
		}
	}
	return pixels;
}

/**
* NOISE FILTER
* I think this function should have been called 'noise'. it pretty much just shifts all the pixels around.
*/
function randomize(pixels){
	var d = pixels.data;
	
	for(var i=0; i < d.length; i+=4){
		
		var rand = Math.floor(Math.random()*5 + 1); //random from 1 to 5
		
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		var a = d[i+3];
		
		//if there is a pixel that is not white (not 255,255,255)
		if(r !== 255 || g !== 255 || b !== 255){
			//then move the pixel in a random direction (up, down, left, or right)
			//depending on the random number
			//1 = up, 2 = down, 3 = left, 4 = right, 5 = no movement
			switch(rand){
				case 1: 
					if(i <= 2400){
						//move down
						d[i+2400] = r;
						d[i+2401] = g;
						d[i+2402] = b;
						d[i+2403] = a;
					} else {
						d[i-2403] = r;
						d[i-2402] = g;
						d[i-2401] = b;
						d[i-2400] = a;
					}
					break;
				case 2:
					//move down 
					d[i+2400] = r;
					d[i+2401] = g;
					d[i+2402] = b;
					d[i+2403] = a;
					break;
				case 3:
				    d[i-4] = r;
					d[i-3] = g;
					d[i-2] = b;
					d[i-1] = a;
					break;
				case 4:
					d[i+4] = r;
					d[i+5] = g;
					d[i+6] = b;
					d[i+7] = a;
					break;
				case 5:
					//do nothing
					break;
			}
		}
	}
	return pixels;
}

/**
* COLOR INVERTER
* this function inverts colors
*/
function invert(pixels){
	
	var d = pixels.data;
	var r,g,b,x,y,z;
	
	for(var i = 0; i < d.length; i+=4){		
		r = d[i];
		g = d[i+1];
		b = d[i+2];
		
		d[i] = 255 - r;
		d[i+1] = 255 - g;
		d[i+2] = 255 - b;	
	}
	return pixels;
}

/**
* BLUR FILTER
* this function causes a blurring effect. It takes the pixel itself and 
* its left, right, above and below neighbors (if it has them)
* and calculates the average of their total R, G, B, and A channels respectively.
*/
function blurry(pixels){

	var d = pixels.data;
	var maximum = 4*width;

	for(i = 0; i < d.length; i+=4){
		//if these conditions are not undefined, then that pixel must exist.
		//right pixel (check if 4 pixel radius ok)
		//also, the 2800 comes from the width and height of my canvas being 700, multiplied by 4.
		var cond1 = (d[i+4] == undefined);
		//left pixel
		var cond2 = (d[i-4] == undefined);
		//pixel below
		var cond3 = (d[i+(maximum)] == undefined);
		//pixel above
		var cond4 = (d[i-(maximum)] == undefined);
		
		if(!cond1 && !cond2 && !cond3 && !cond4){
		
			var newR = (d[i+4]*.2 + d[i-4]*.2 + d[i+(maximum)]*.2 + d[i-(maximum)]*.2 + d[i]*.2);
			var newG = (d[i+5]*.2 + d[i-3]*.2 + d[i+(maximum+1)]*.2 + d[i-(maximum-1)]*.2 + d[i+1]*.2);
			var newB = (d[i+6]*.2 + d[i-2]*.2 + d[i+(maximum+2)]*.2 + d[i-(maximum-2)]*.2 + d[i+2]*.2);
			var newA = (d[i+7]*.2 + d[i-1]*.2 + d[i+(maximum+3)]*.2 + d[i-(maximum-3)]*.2 + d[i+3]*.2);
		
			d[i] = newR;
			d[i+1] = newG;
			d[i+2] = newB;
			d[i+3] = newA;
		}
	}
return pixels;
}

/**
* OUTLINE FILTER
* gets the 'outline' of the main parts of the picture
* it finds the pixels whose above neighbor is a different color/
* then a line is drawn from the location of that pixel to the above pixel,
* forming a small, slightly angled line. all these lines then make up an outline.
*/
function outline(){
	var imgData = context.getImageData(0, 0, width, height);
	var d = imgData.data;
	var colCounter = 0;
	var rowCounter = 0;
	var count = 0;
	var maximum = 4*width;
	
	context.clearRect(0, 0, width, height);
	context.fillStyle = "#FFF";
	context.fillRect(0, 0, width, height);
	
	for(var i = 0; i < d.length; i+=4){
	
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		context.lineJoin = 'round';
		context.lineWidth = 2;
			
		var tnr = d[i-(maximum)];
		var tng = d[i-(maximum - 1)];
		var tnb = d[i-(maximum - 2)];
		
		//withinRange function is defined with the FISHEYE function
		if(d[i-(maximum)] !== undefined && !withinRange(r, g, b, tnr, tng, tnb, 5)){
			if(count < 100){
				//console.log('colCounter: ' + colCounter + ", rowCounter: " + rowCounter);
				count++;
			}
			makePath(colCounter, rowCounter);
		}
		if(i%(maximum) == 0){
			rowCounter++;
		}
		if(colCounter >= width){
			colCounter = 0;
		}
		colCounter++;
	}
}

function makePath(col, row){
	context.lineJoin = 'round';
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(col, row);
	context.lineTo(col+2, row+1);
	context.closePath();
	context.strokeStyle = '#000';
	context.stroke();
}			

/**
* FISHEYE DISTORTION FILTER
* this function creates fisheye distortion! 
* source: http://popscan.blogspot.com/2012/04/fisheye-lens-equation-simple-fisheye.html
* http://paulbourke.net/dome/fisheye/
*/
function fisheye(imgData, xPos, yPos, rad){
	
	//this is the array you edit with the translated pixels
	var data = imgData.data;
	
	var height = Math.sqrt(data.length/4);
	var width = Math.sqrt(data.length/4);
	
	//this is the original data set you want to refer to
	//to put the correctly colored pixels in the right place
	//remember to make a deep copy so that any editing to 'data' will not
	//alter the elements in this array!
	var oldData = new Uint8ClampedArray(data);

	var pixelCounter = 0;
	
	//rows
	for(var y = 0; y < height; y++){
	
		//normalize y coordinate to -1...+1
		var normY = (2*y)/(height) - 1;
		
		//calculate normY squared
		var normY2 = normY * normY;
		
		//columns
		for(var x =0; x < width; x++){

			//this counter will make sure that 
			//the right index for each pixel's color is
			//being looked at 
			var start = pixelCounter*4;
			
			//normalize x coordinate to -1...+1
			var normX = (2*x)/(width) - 1;
			
			//calculate normX squared
			var normX2 = normX * normX;
			
			//calculate distance from center (the center is always 0,0)
			var dist = Math.sqrt(normX2 + normY2);

			//only alter pixels inside of radius
			//changing the dist range affects the scope of the lens. i.e. less range (.5 => .6) gives you a 'telescoping' lens. 
			//a larger range (0 => 1) gives you a full circle.
			if( (0 <= dist) && (dist <= 1) ){
		
				var newR = Math.sqrt(1 - dist*dist);
				
				//new distance between 0 and 1
				newR = (dist + (1 - newR)) / 2;
				
				//discard any radius greater than 1
				if(newR <= 1){
					
					//calculate angle for polar coordinates
					var theta = Math.atan2(normY, normX);
					
					//calculate new X position with new distance in same angle
					var newX = newR * Math.cos(theta);
					
					//calculate new Y position with new distance in same angle
					var newY = newR * Math.sin(theta);
					
					//get the location of where the pixels should be moved FROM.
					var x2 = Math.floor(( (newX + 1)*(width) ) / 2);
					var y2 = Math.floor(( (newY + 1)*(height) ) / 2);

					srcPos = ((width)*(y2))+x2;
				    srcPos *= 4;
					
					data[start] = oldData[srcPos];
					data[start + 1] = oldData[srcPos + 1];
					data[start+ 2] = oldData[srcPos + 2];
					data[start + 3] = oldData[srcPos + 3];		
				}
			}
			pixelCounter++;
		}//end inner for loop
	}//end outer for loop
	//yPos and xPos are the coordinates of the center of the area of interest
	context.putImageData(imgData, xPos-rad, yPos-rad);
}

//the above function can be used like so below:
//first, a default fisheye that encompasses the canvas:
function defaultFisheye(){
	var data = context.getImageData(0, 0, theCanvas.width, theCanvas.height);
	fisheye(data, 0, 0, 0);
}

//this one is a mobile one, in which the user should be able to specify a 
//a radius and can click anywhere on the canvas to generate a fisheye distortion within the 
//specified radius.
//It works by making a new image data array with only the pixels from the area specified by the user (after an image has been imported),
//doing the distortion function on that array, and then putting the results in the same location it came from onto the canvas.
function mobileFisheye(radius, xPos, yPos){
	
	//xPos and yPos are the coordinates of the center of the area of interest
	var diameter = radius*2;

	//xPos-radius = the x coordinate of the upper left corner of the area of interest!
	var data = context.getImageData(xPos-radius, yPos-radius, diameter, diameter);
	
	fisheye(data, xPos, yPos, radius);
}
/**** END FISHEYE *****/


/******

AREA COLOR (more like 'painter?')

the idea is to find an area of pixels that are similarly colored, 
and then making that area one solid color
it also tends to remove dark outlines so that there aren't any 
distinct boundaries
it is supposed to give a sort of 'painted' look to it. 
still not perfect right now, but it's definitely in the right direction

*****/
//helper function
//this function is also used for the OUTLINE filter
function withinRange(r, g, b, or, og, ob, rangeVal){
	
	var red = Math.abs(r-or) <= rangeVal;
	var green = Math.abs(g-og) <= rangeVal;
	var blue = Math.abs(b-ob) <= rangeVal;
	
	if(red && green && blue){
		return true;
	}
	return false;
}

//the idea is to find an area of pixels that are similarly colored, 
//and then making that area one solid color
function areaColor(pixels){
	
	var d = pixels.data;
	var copy = new Uint8ClampedArray(d);
	var maximum = 4*width;

	for(var i = 0; i < d.length; i+=4){
		//current pixel
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		//left neighbor's color
		var lnr = copy[i-4];
		var lng = copy[i-3];
		var lnb = copy[i-2];
		//right neighbor's color
		var rnr = copy[i+4];
		var rng = copy[i+5];
		var rnb = copy[i+6];
		//top neighbor's color
		var tnr = copy[i-(maximum)];
		var tng = copy[i-(maximum-1)];
		var tnb = copy[i-(maximum-2)];
		//bottom neighbor's color
		var bnr = copy[i+(maximum)];
		var bng = copy[i+(maximum+1)];
		var bnb = copy[i+(maximum+2)];
		//top right
		var trr = copy[i-(maximum-4)];
		var trg = copy[i-(maximum-5)];
		var trb = copy[i-(maximum-6)];
		//top left
		var tlr = copy[i-(maximum+4)];
		var tlg = copy[i-(maximum+3)];
		var tlb = copy[i-(maximum+2)];
		//below left
		var blr = copy[i+(maximum-4)];
		var blg = copy[i+(maximum-3)];
		var blb = copy[i+(maximum-2)];
		//below right
		var brr = copy[i+(maximum+4)];
		var brg = copy[i+(maximum+5)];
		var brb = copy[i+(maximum+6)];

		//right pixel
		var cond1 = (d[i+4] === undefined);
		//left pixel
		var cond2 = (d[i-4] === undefined);
		//pixel below
		var cond3 = (d[i+(maximum)] === undefined);
		//pixel above
		var cond4 = (d[i-(maximum)] === undefined);
		//top left
		var cond5 = (d[i-(maximum+4)] === undefined);
		//top right
		var cond6 = (d[i-(maximum-4)] === undefined);
		//below right
		var cond7 = (d[i+(maximum+4)] === undefined);
		//below left
		var cond8 = (d[i+(maximum-4)] === undefined);
			
		if(!cond1 && !cond2 && !cond3 && !cond4 && !cond5 && !cond6 && !cond7 && !cond8){		
			//if next neighbor over is a completely different color, stop and move on
			var nnr = copy[i+8];
			var nng = copy[i+9];
			var nnb = copy[i+10];		
			//next neighbor over (top right)
			//using the current data, instead of the copy which holds the original color data,
			//seems to provide closer to my desired effect
			var trrr = d[i-(maximum-8)];
			var trrg = d[i-(maximum-9)];
			var trrb = d[i-(maximum-10)];
			/*
			//next neighbor over (bottom right)
			var brrr = d[i+2808];
			var brrg = d[i+2809];
			var brrb = d[i+2810];
			*/		
			if(!withinRange(r, g, b, nnr, nng, nnb, 18)||
			 !withinRange(r, g, b, trrr, trrg, trrb, 16)||
			//!withinRange(r, g, b, brrr, brrg, brrb, 15)||
			    (rnr >= 210 && rng >= 210 && rnb >= 200)
			){	
				continue;
			}		
			var range = 50;
			//check neighbors' colors
			if(withinRange(r, g, b, lnr, lng, lnb, range) &&
			   withinRange(r, g, b, rnr, rng, rnb, range) &&
			   withinRange(r, g, b, tnr, tng, tnb, range) &&
			   withinRange(r, g, b, bnr, bng, bnb, range) &&
			   withinRange(r, g, b, trr, trg, trb, range) &&
			   withinRange(r, g, b, tlr, tlg, tlb, range) &&
			   withinRange(r, g, b, blr, blg, blb, range) &&
			   withinRange(r, g, b, brr, brg, brb, range)
			   ){
			   //make all the neighbors the same color
				   //right
				   d[i+4] = r;
				   d[i+5] = g;
				   d[i+6] = b; 
				   //left
				   d[i-4] = r;
				   d[i-3] = g;
				   d[i-2] = b;
				   //above
				   d[i-(maximum)] = r;
				   d[i-(maximum-1)] = g;
				   d[i-(maximum-2)] = b;
				   //below
				   d[i+(maximum)] = r;
				   d[i+(maximum+1)] = g;
				   d[i+(maximum+2)] = b;	   
				   //above left
				   d[i-(maximum-4)] = r;
				   d[i-(maximum-5)] = g;
				   d[i-(maximum-6)] = b;	  
				  //above right
				   d[i-(maximum+4)] = r;
				   d[i-(maximum+3)] = g;
				   d[i-(maximum+2)] = b;	  
				   //below right
				   d[i+(maximum+4)] = r;
				   d[i+(maximum+5)] = g;
				   d[i+(maximum+6)] = b;
				   //below left
				   d[i+(maximum-4)] = r;
				   d[i+(maximum-3)] = g;
				   d[i+(maximum-2)] = b;
			   }
		}
	}
	return pixels;
}

/**
*	control brightness - increase
*/
function incBright(pixels){
	
	var d = pixels.data;
	
	for(var i = 0; i < d.length; i+=4){
			
			d[i] += 5;
			d[i+1] += 5;
			d[i+2] += 5;
			//d[i+3] += 5;
	}
	return pixels;
}

//control brightness - decrease
function decBright(pixels){
	
	var d = pixels.data;
	
	for(var i = 0; i < d.length; i+=4){
			
			d[i] -= 5;
			d[i+1] -= 5;
			d[i+2] -= 5;
			//d[i+3] -= 5;
	}
	return pixels;
}

/**change contrast
*set range -128 to 128 for now
*I don't think it's working quite right...
*basically, all dark colors should get darker, and light colors should get lighter right?
*/
//this var is reset when importing a new picture
var contrastVal = 0;

function inContrast(pixels){
	
	var d = pixels.data;
	
	if(contrastVal < 128){
		contrastVal++;
	}
	
	var contrastFactor = Math.max( ((128 + contrastVal) / 128), 0 )
		
	for(var i = 0; i < d.length; i+=4){		
		
		d[i] = d[i]*contrastFactor;
		d[i+1] = d[i+1]*contrastFactor;
		d[i+2] = d[i+2]*contrastFactor;
		d[i+3] = d[i+3]*contrastFactor;
			
	}
	return pixels;
}

function deContrast(pixels){
	
	var d = pixels.data;
	
	if(contrastVal > -128){
		contrastVal--;
	}
	
	var contrastFactor = Math.max( ((128 + contrastVal) / 128), 0 )
		
	for(var i = 0; i < d.length; i+=4){		
		
		d[i] = d[i]*contrastFactor;
		d[i+1] = d[i+1]*contrastFactor;
		d[i+2] = d[i+2]*contrastFactor;
		d[i+3] = d[i+3]*contrastFactor;
			
	}
	return pixels;
}

//RESET PICTURE
function reset(){
	context.clearRect(0, 0, width, height);
	context.drawImage(img, 0, 0, width, height);
}





