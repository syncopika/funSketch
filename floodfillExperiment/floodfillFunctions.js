
function getRandomCoord(height, width, canvasId){
	var data = {};
	
	// Math.random() * (max - min) + min;
	var randX = Math.random() * (width); // from 0 to width, get random num
	var randY = Math.random() * (height);
	
	data['x'] = Math.floor(randX);
	data['y'] = Math.floor(randY);
	
	var colorData = document.getElementById(canvasId).getContext("2d").getImageData(data['x'], data['y'], 1, 1).data;
	var color = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';
	
	data['color'] = color;
	
	return data;
}

function floodFill(canvasId, selectedPixel, resultTableId){

	// clear the canvas
	var currentCanvas = document.getElementById(canvasId);
	var ctx = currentCanvas.getContext('2d');
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);

	// this is the color to change to!
	// need to parse the currColor because right now it looks like "rgb(x,y,z)". 
	// I want it to look like [x, y, z]
	var currColor = 'rgb(135,206,235)';	// sky blue 
	var currColorArray = currColor.substring(currColor.indexOf('(') + 1, currColor.length - 1).split(',');
	currColorArray = currColorArray.map(function(a){ return parseInt(a) });
	
	// call the floodfill function!
	// post the result on the page 
	var results = document.getElementById(resultTableId);
	var newResult = document.createElement('li');
	newResult.textContent = floodfillHelper(currentCanvas, currColorArray, selectedPixel) + " s";
	results.appendChild(newResult);
	
}

// the actual floodfill function 
function floodfillHelper(currentCanvas, newColor, pixelSelected){

	// create a stack 
	var stack = [];
	
	// create visited set 
	// the format of these entries will be like: {'xCoord,yCoord': 1}
	var visited = {};
	
	// the selectedPixel will have the color that needs to be targeted by floodfill 
	var targetColor = pixelSelected.color;
	//console.log(targetColor);
	
	// current canvas context 
	var ctx = document.getElementById(currentCanvas.id).getContext('2d');
	//console.log(ctx);
	
	// get the image data of the entire canvas 
	// do the floodfill, then put the edited image data back 
	var imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
	//console.log(imageData);
	var data = imageData.data;

	stack.push(pixelSelected);
	
	// start the timer here!
	var startTime = new Date();
	
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
		//console.log("rgb: " + newColor[0] + "," + newColor[1] + "," + newColor[2])
	}
	
	// put new edited image back on canvas 
	ctx.putImageData(imageData, 0, 0);
	//console.log(imageData);
	
	// get end time!
	var endTime2 = new Date();
	
	// return time it took to complete 
	return (endTime2.getTime() - startTime.getTime()) / 1000;
	//console.log("time it took: " + (endTime.getTime() - startTime.getTime()) / 1000);
}

function floodfillWorkers(canvasId, selectedPixel, resultTableId){

	// do floodfill with web workers!
	if(window.Worker){
		
		// clear the canvas 
		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// new color 
		var currColor = 'rgb(135,206,235)';	// sky blue 
		
		// get the image data of the entire canvas 
		// do the floodfill, then put the edited image data back 
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var data = imageData.data;
	
		var workerTopRight = new Worker("worker.js");
		var workerTopLeft = new Worker("worker.js");
		var workerBottomRight = new Worker("worker.js");
		var workerBottomLeft = new Worker("worker.js");
		
		// start the timer here!
		var startTime2 = new Date();
		
		workerTopRight.postMessage([selectedPixel, data, canvas.width, canvas.height, 'upRight', currColor]);
		workerBottomRight.postMessage([selectedPixel, data, canvas.width, canvas.height, 'downRight', currColor]);
		workerTopLeft.postMessage([selectedPixel, data, canvas.width, canvas.height, 'upLeft', currColor]);
		workerBottomLeft.postMessage([selectedPixel, data, canvas.width, canvas.height, 'downLeft', currColor]);
		
		var counter = 0;
		
		workerTopRight.onmessage = function(e){
			repaint(data, e.data, canvas.width, canvas.height, currColor);
			counter++;
			if(counter === 4){
				getResult(startTime2, ctx, imageData, resultTableId);
			}
		}
		
		workerTopLeft.onmessage = function(e){
			repaint(data, e.data, canvas.width, canvas.height, currColor);
			counter++;
			if(counter === 4){
				getResult(startTime2, ctx, imageData, resultTableId);
			}
		}
		
		workerBottomRight.onmessage = function(e){
			repaint(data, e.data, canvas.width, canvas.height, currColor);
			counter++;
			if(counter === 4){
				getResult(startTime2, ctx, imageData, resultTableId);
			}
		}
		
		workerBottomLeft.onmessage = function(e){
			repaint(data, e.data, canvas.width, canvas.height, currColor);
			counter++;
			if(counter === 4){
				getResult(startTime2, ctx, imageData, resultTableId);
			}
		}
		
	}else{
		console.log("web workers not available!");
	}
}

// resultsId = the id of the element to append the results 
function getResult(startTime, context, imageData, resultsId){

	context.putImageData(imageData, 0, 0);
			
	// get end time!
	var endTime = new Date();

	var res = (endTime.getTime() - startTime.getTime()) / 1000;
	
	var resultTable = document.getElementById(resultsId);
	
	var newResult = document.createElement('li');
	newResult.textContent = res + " s";
	resultTable.appendChild(newResult);
	
	//console.log((endTime.getTime() - startTime.getTime()) / 1000)
	//console.log("time it took (floodfill w/ web workers: " + (endTime.getTime() - startTime.getTime()) / 1000);
}

// assign new color given a coordinate, the original data, and the new information about what pixels to color (paintData)
function repaint(ctxData, paintData, width, height, newColor){

	var currColorArray = newColor.substring(newColor.indexOf('(') + 1, newColor.length - 1).split(',');
	currColorArray = currColorArray.map(function(a){ return parseInt(a) });

	var xCoord, yCoord;

	for(pixel in paintData){
	
		xCoord = parseInt(pixel.split(',')[0]);
		yCoord = parseInt(pixel.split(',')[1]);

		// based on width and height of canvas, calculate there in the data array the rgb values are for this coordinate
		var pixelIndex = (width*4*(yCoord)) + ((xCoord+1)*4);
	
		ctxData[pixelIndex] = currColorArray[0];
		ctxData[pixelIndex + 1] = currColorArray[1];
		ctxData[pixelIndex + 2] = currColorArray[2];
	}
}