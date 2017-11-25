// this is the worker script
// give each worker a 'quadrant' to take care of 


onmessage = function(e){

	// e holds the data. access by e.data[index]
	var start = e.data[0];	// the pixel to start at ({x: , y: , color:})
	var data = e.data[1];	// the original image data
	var width = e.data[2];
	var height = e.data[3];
	var direction = e.data[4];	// upRight, upLeft, downRight, downLeft
	var color = e.data[5];		// this is not needed here 

	// just return the coordinates looked at.
	// coordinates that have a value of 1 will have their color changed 
	var result = floodfill(width, height, start, direction, data);
	
	return result;
}


// floodfill function 
// width = width of canvas, height = height of canvas, newColor = color to change to, pixelSelected = start pixel, direction = upRight, downRight, upLeft, or upRight
// data = the original context data
function floodfill(width, height, pixelSelected, direction, data){

	// create a stack 
	var stack = [];
	
	// create visited set 
	// the format of these entries will be like: {'xCoord,yCoord': 1}
	var visited = {};
	
	// the selectedPixel will have the color that needs to be targeted by floodfill 
	var targetColor = pixelSelected.color;

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
		if((direction === 'upRight' || direction === 'upLeft') && topNeighborY >= 0 && visited[currPixel.x + ',' + topNeighborY] === undefined){
			// index of r, g and b colors in imageData.data
			r = (topNeighborY * width)*4 + ((currPixel.x + 1) * 4);
			g = r + 1;
			b = g + 1;
			if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
				// if the neighbor's color is the same as the targetColor, add it to the stack
				stack.push({'x': currPixel.x, 'y': topNeighborY});
			}
		}
		
		// right neighbor 
		if((direction === 'upRight' || direction === 'downRight') && rightNeighborX < width && visited[rightNeighborX + ',' + currPixel.y] === undefined){
			r = (currPixel.y * width)*4 + ((rightNeighborX + 1) * 4);
			g = r + 1;
			b = g + 1;
			if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
				// if the neighbor's color is the same as the targetColor, add it to the stack
				stack.push({'x': rightNeighborX, 'y': currPixel.y});
			}
		}
		
		// bottom neighbor
		if((direction === 'downLeft' || direction === 'downRight') && bottomNeighborY < height && visited[currPixel.x + ',' + bottomNeighborY] === undefined){
			r = (bottomNeighborY * width)*4 + ((currPixel.x + 1) * 4);
			g = r + 1;
			b = g + 1;
			if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
				// if the neighbor's color is the same as the targetColor, add it to the stack
				stack.push({'x': currPixel.x, 'y': bottomNeighborY});
			}
		}
		
		// left neighbor
		if((direction === 'downLeft' || direction === 'upLeft') && leftNeighborX >= 0 && visited[leftNeighborX + ',' + currPixel.y] === undefined){
			r = (currPixel.y * width)*4 + ((leftNeighborX + 1) * 4);
			g = r + 1;
			b = g + 1;
			if(targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')'){
				// if the neighbor's color is the same as the targetColor, add it to the stack
				stack.push({'x': leftNeighborX, 'y': currPixel.y});
			}
		}
	}
	
	// the visited associative array will only contain the pixel coordinates whose color should change!!
	// do the color changing in the main thread 
	postMessage(visited);
}
