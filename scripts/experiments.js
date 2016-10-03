//just some things I'm trying to figure out.
//for now (10/02/16), I'm trying to understand how I can rotate an image in canvas by any degree.
//the first function is great for 90 degrees, but any other angle is not so great. I'm not sure
//how I can rotate it in place.
//also, it's really slow. :< 

//the second one sort of accomplishes what I want, but the image after rotation seems to zoom in while
//getting cut off. 


//reference for image rotation: http://geekofficedog.blogspot.com/2013/04/hello-swirl-swirl-effect-tutorial-in.html
function experimental(pixels){

  var d = pixels.data;
  
	//copy of picture data
	var e = new Uint8ClampedArray(d);
	var total = 0;
	var colCounter = 0;
	var degree = 92;
	var width = canvas.width;
	var radius = canvas.width;
	
	var centerRow = Math.floor(canvas.width/2);
	var centerCol = Math.floor(canvas.height/2);
	
	//whiteout the canvas first
	for(var i = 0; i < d.length; i+=4){
		d[i] = 255;
		d[i+1] = 255;
		d[i+2] = 255;
		d[i+3] = 255;
	}
	
	var sourcePosition, r, alpha, degrees, newCol, newRow, destPosition;
	
	for(var row = -radius; row < radius; row++){
		for(var col = -radius; col < radius; col++){

		//convert current coordinates to polar coords
		sourcePosition = ((row)*canvas.width*4)+(col)*4;
		
		//distance from center
		r = Math.sqrt(row*row + col*col);
		
		//transform current x,y to polar coordinates
		alpha = Math.atan2(row, col);
			
		//change alpha to radians since it is in degrees
		degrees = (alpha * 180.0) / Math.PI;
			
		//shift angle
		degrees += -degree;
			
		//transform polar coords to cartesian
		alpha = (degrees * Math.PI) / 180.0;
			
		//calculate new coordinates for this current pixel
		//i.e. newX and newY is where this current pixel should be moved to after translation
		newCol = Math.floor(r*Math.cos(alpha));
		newRow = Math.floor(r*Math.sin(alpha));
		
		//destination pixel location
		destPosition = ((newRow)*canvas.width*4)+(newCol)*4;
		
		//now just replace the pixel at the new coordinate with the current pixel's color
		d[sourcePosition] = e[destPosition];
		d[sourcePosition + 1] = e[destPosition + 1];
		d[sourcePosition + 2] = e[destPosition + 2];
		d[sourcePosition + 3] = e[destPosition + 3];
    
    }
	}
	return pixels;
}


//second option
function experimental2(pixels){

	var d = pixels.data;
	var e = new Uint8ClampedArray(d);
	
	//http://homepages.inf.ed.ac.uk/rbf/HIPR2/rotate.htm
	//x0(col), y0(row) = center of rotation
	//x2 = Math.cos(angle) * (x1 - x0) - Math.sin(angle)*(y1 - y0) + x0
	//y2 = Math.sin(angle)*(x1 - x0) + Math.cos(angle)*(y1 - y0) + y0
	var centerX = canvas.width/2;
	var centerY = canvas.height/2;
	var angle = 90;
	
	for(var row = 0; row < canvas.height; row++){
		for(var col = 0; col < canvas.width; col++){
	
		//centerX - col   centerY - row  ||   col - centerX     row - centerY
		var newRow = Math.floor( Math.sin(angle)*(centerX - col) - Math.sin(angle)*(centerY - row) + centerY);
		var newCol = Math.floor( Math.cos(angle)*(centerX - col) + Math.cos(angle)*(centerY - row) + centerX); 
		
		//calculate where in pixels.data coordinate correponds to 
		var destPosition = ((newRow)*canvas.width*4)+(newCol)*4;
		var sourcePosition = ((row)*canvas.width*4)+(col)*4;
		
		d[sourcePosition] = e[destPosition];
		d[sourcePosition + 1] = e[destPosition + 1];
		d[sourcePosition + 2] = e[destPosition + 2];
		d[sourcePosition + 3] = e[destPosition + 3];
		}
	}
	
	return pixels;
	
}
