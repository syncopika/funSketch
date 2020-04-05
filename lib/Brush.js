/***
    brush class
    pass in an instance of the SuperCanvas class as an argument
    the canvas argument will have a reference to the current canvas so that
    only the current canvas will be a target for the brush
***/
function Brush(animationProject) {
    // pass in an animation project, from which you can access the current frame and the current canvas
	this.animationProject = animationProject;
    this.previousCanvas = undefined;
    this.currentCanvasSnapshots = []; // keep track of what the current canvas looks like after each mouseup
    this.selectedBrush = 'default'; // user-selected brush 
    this.currColor = 'rgb(0,0,0)';
    this.currColorArray = Uint8Array.from([0, 0, 0, 0]);
    this.currSize = 2;
    // these letiables keep track of the pixels drawn on by the mouse.
    // the redraw function uses this data to connect the dots 
    let clickX = [];
    let clickY = [];
    let clickDrag = [];
    let clickColor = [];
    let clickSize = [];
    // hold the current image after mouseup. 
    // only put it in the currentCanvasSnapshots after user starts drawing again, creating a new snapshot
    let tempSnapshot;
    // pass in an instance of the SuperCanvas class as an argument
    // the canvas argument will have a reference to the current canvas so that
    // only the current canvas will be a target for the brush
    // note that a new letiable, "thisBrushInstance", is assigned this (I want the brush object instance). 
    // that is because when you go inside another function (i.e. mousedown), 
    // using "this" doesn't refer to the object you're in, but that other function itself. 
    let thisBrushInstance = this;
	
    this.changeBrushSize = function(size){
        this.currSize = size;
    };
	
	/***
	
		default brush
	
	***/
    this.defaultBrush = function(){
		
        // reset mouse action functions first 
        thisBrushInstance.resetBrush();
		
        let canvas = thisBrushInstance.animationProject.getCurrFrame();
        let paint;
		
        $('#' + canvas.currentCanvas.id).on('mousedown touchstart', (e) => {
            if((e.which === 1 && e.type === 'mousedown') || e.type === 'touchstart') { //when left click only
                // update previousCanvas
                if(thisBrushInstance.previousCanvas !== canvas.currentCanvas) {
                    thisBrushInstance.previousCanvas = canvas.currentCanvas;
                    // reset the snapshots array
                    thisBrushInstance.currentCanvasSnapshots = [];
                }
				
                if(tempSnapshot) {
                    thisBrushInstance.currentCanvasSnapshots.push(tempSnapshot);
                }
				
                paint = true;
                // offset will be different with mobile
                // use e.originalEvent because using jQuery
                // https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
                // https://stackoverflow.com/questions/11287877/how-can-i-get-e-offsetx-on-mobile-ipad
                // using rect seems to work pretty well
                if(e.type === 'touchstart') {
                    let rect = e.target.getBoundingClientRect();
                    e.offsetX = e.originalEvent.touches[0].pageX - rect.left;
                    e.offsetY = e.originalEvent.touches[0].pageY - rect.top;
                }
                addClick(e.offsetX, e.offsetY, true);
                redraw();
            }
        });
		
        //draw the lines as mouse moves
        $('#' + canvas.currentCanvas.id).on('mousemove touchmove', (e) => {
            if(paint) {
                if(e.type === 'touchmove') {
                    let rect = e.target.getBoundingClientRect();
                    e.offsetX = e.originalEvent.touches[0].pageX - rect.left;
                    e.offsetY = e.originalEvent.touches[0].pageY - rect.top;
                    // prevent page scrolling when drawing 
                    e.preventDefault();
                }
                addClick(e.offsetX, e.offsetY, true);
                redraw();
            }
        });
		
        //stop drawing
        $('#' + canvas.currentCanvas.id).on('mouseup touchend', (e) => {
            // see if it's a new canvas or we're still on the same one as before the mousedown
            if(thisBrushInstance.previousCanvas === canvas.currentCanvas) {
                // if it is, then log the current image data. this is important for the undo feature
                let c = canvas.currentCanvas;
                let w = c.width;
                let h = c.height;
                tempSnapshot = canvas.currentCanvas.getContext("2d").getImageData(0, 0, w, h);
            }
            clearClick();
            paint = false;
        });
		
        //stop drawing when mouse leaves
        $('#' + canvas.currentCanvas.id).mouseleave((e) => {
			clearClick();
            paint = false;
        });
    };
	
    /***
	
        radial gradient brush
		
    ***/
    this.radialGradBrush = function(){
		
        // reset mouse action functions first 
        thisBrushInstance.resetBrush();
        let canvas = this.animationProject.getCurrFrame();
        let curCanvas = canvas.currentCanvas.id;
        let context = canvas.currentCanvas.getContext("2d");
        let paint;
        context.lineJoin = context.lineCap = 'round';
		
        $('#' + curCanvas).mousedown((e) => {
            if(e.which === 1){
                paint = true;
                radialGrad(e.offsetX, e.offsetY);
            }
        });
		
        $('#' + curCanvas).mousemove((e) => {
            if(paint){
                radialGrad(e.offsetX, e.offsetY);
            }
        });
		
        $('#' + curCanvas).mouseup((e) => {
            paint = false;
            if(thisBrushInstance.previousCanvas === canvas.currentCanvas) {
                // if it is, then log the current image data. this is important for the undo feature
                let c = canvas.currentCanvas;
                let w = c.width;
                let h = c.height;
                thisBrushInstance.currentCanvasSnapshots.push(canvas.currentCanvas.getContext("2d").getImageData(0, 0, w, h));
            }
        });
		
        //stop drawing when mouse leaves
        $('#' + curCanvas).mouseleave((e) => {
			clearClick();
            paint = false;
        });
    };
	
    function radialGrad(x, y){
        let canvas = thisBrushInstance.animationProject.getCurrFrame();
        let context = canvas.currentCanvas.getContext("2d");
        let radGrad = context.createRadialGradient(x, y, thisBrushInstance.currSize, x, y, thisBrushInstance.currSize * 1.5);
        let colorPicked = thisBrushInstance.currColorArray;
        radGrad.addColorStop(0, thisBrushInstance.currColor);
        if(colorPicked !== undefined) {
            radGrad.addColorStop(.5, 'rgba(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ',.5)');
            radGrad.addColorStop(1, 'rgba(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ',0)');
        }else{
            radGrad.addColorStop(.5, 'rgba(0,0,0,.5)');
            radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }
        context.fillStyle = radGrad;
        context.fillRect(x - 20, y - 20, 40, 40);
    }
	
	/***
	
		floodfill brush
		
		not really a brush, but should be considered a separate brush so its mousedown action 
		won't conflict with the other brushes (i.e. no painting at the same time of a floodfill)
	
	***/
	this.floodfillBrush = function(){
		// reset mouse action functions first 
        thisBrushInstance.resetBrush();
		
        let frame = thisBrushInstance.animationProject.getCurrFrame();
		
        $('#' + frame.currentCanvas.id).on('mousedown touchstart', (e) => {
            if((e.which === 1 && e.type === 'mousedown') || e.type === 'touchstart'){ //when left click only
                // update previousCanvas
                if(thisBrushInstance.previousCanvas !== frame.currentCanvas) {
                    thisBrushInstance.previousCanvas = frame.currentCanvas;
                    // reset the snapshots array
                    thisBrushInstance.currentCanvasSnapshots = [];
                }
				
                if(tempSnapshot) {
                    thisBrushInstance.currentCanvasSnapshots.push(tempSnapshot);
                }

                if(e.type === 'touchstart') {
                    let rect = e.target.getBoundingClientRect();
                    e.offsetX = e.originalEvent.touches[0].pageX - rect.left;
                    e.offsetY = e.originalEvent.touches[0].pageY - rect.top;
                }
                
				// do floodfill
                // need to parse the currColor because right now it looks like "rgb(x,y,z)". 
                // I want it to look like [x, y, z]
				let currColor = thisBrushInstance.currColor;
                let currColorArray = currColor.substring(currColor.indexOf('(') + 1, currColor.length - 1).split(',');
                currColorArray = currColorArray.map(function(a){ return parseInt(a); });
				
                // get the coordinates of the selected pixel
				let rect = frame.currentCanvas.getBoundingClientRect();
				let scaleX = frame.currentCanvas.width / rect.width;
				let scaleY = frame.currentCanvas.width / rect.height;
				let x = (e.clientX - rect.left) * scaleX;
				let y = (e.clientY - rect.top) * scaleY;

                let colorData = document.getElementById(frame.currentCanvas.id).getContext("2d").getImageData(x, y, 1, 1).data;
                let color = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';
 
                // create an object with the pixel data
                let pixel = { 'x': Math.floor(x), 'y': Math.floor(y), 'color': color };

                floodfill(frame.currentCanvas, currColorArray, pixel);
            }
        });
	}
	
	// the actual floodfill function 
    function floodfill(currentCanvas, newColor, pixelSelected){
        // create a stack 
        let stack = [];
        // create visited set 
        // the format of these entries will be like: {'xCoord,yCoord': 1}
        let visited = {};
        // the selectedPixel will have the color that needs to be targeted by floodfill 
        let targetColor = pixelSelected.color;
        // current canvas context 
        let ctx = document.getElementById(currentCanvas.id).getContext('2d');
        // get the image data of the entire canvas 
        // do the floodfill, then put the edited image data back 
        let imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
        let data = imageData.data;
        stack.push(pixelSelected);
        while(stack.length !== 0){
            // get a pixel
            let currPixel = stack.pop();
            // add to visited set 
            visited[currPixel.x + ',' + currPixel.y] = 1;
            // get left, right, top and bottom neighbors 
            let leftNeighborX = currPixel.x - 1;
            let rightNeighborX = currPixel.x + 1;
            let topNeighborY = currPixel.y - 1;
            let bottomNeighborY = currPixel.y + 1;
            let r, g, b;
            // top neighbor
            if (topNeighborY >= 0 && visited[currPixel.x + ',' + topNeighborY] === undefined) {
                // index of r, g and b colors in imageData.data
                r = (topNeighborY * currentCanvas.width) * 4 + ((currPixel.x + 1) * 4);
                g = r + 1;
                b = g + 1;
                if (targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')') {
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': currPixel.x, 'y': topNeighborY, 'color': currPixel.color });
                }
            }
            // right neighbor 
            if (rightNeighborX < currentCanvas.width && visited[rightNeighborX + ',' + currPixel.y] === undefined) {
                r = (currPixel.y * currentCanvas.width) * 4 + ((rightNeighborX + 1) * 4);
                g = r + 1;
                b = g + 1;
                if (targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')') {
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': rightNeighborX, 'y': currPixel.y, 'color': currPixel.color });
                }
            }
            // bottom neighbor
            if (bottomNeighborY < currentCanvas.height && visited[currPixel.x + ',' + bottomNeighborY] === undefined) {
                r = (bottomNeighborY * currentCanvas.width) * 4 + ((currPixel.x + 1) * 4);
                g = r + 1;
                b = g + 1;
                if (targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')') {
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': currPixel.x, 'y': bottomNeighborY, 'color': currPixel.color });
                }
            }
            // left neighbor
            if (leftNeighborX >= 0 && visited[leftNeighborX + ',' + currPixel.y] === undefined) {
                r = (currPixel.y * currentCanvas.width) * 4 + ((leftNeighborX + 1) * 4);
                g = r + 1;
                b = g + 1;
                if (targetColor === 'rgb(' + data[r] + ',' + data[g] + ',' + data[b] + ')') {
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': leftNeighborX, 'y': currPixel.y, 'color': currPixel.color });
                }
            }
            // finally, update the color of the current pixel 
            r = (currPixel.y * currentCanvas.width) * 4 + ((currPixel.x + 1) * 4);
            g = r + 1;
            b = g + 1;
            data[r] = newColor[0];
            data[g] = newColor[1];
            data[b] = newColor[2];
        }
        // put new edited image back on canvas 
        ctx.putImageData(imageData, 0, 0);
    }
	
    this.resetBrush = function(){
        let canvas = thisBrushInstance.animationProject.getCurrFrame();
        let curCanvas = canvas.getCurrCanvas().id; //canvas.currentCanvas.id;
        //detach any events from mouse actions (reset the events connected with mouse events)
        $('#' + curCanvas).off("mousedown");
        $('#' + curCanvas).off("mouseup");
        $('#' + curCanvas).off("mousemove");
    }
	
    //collect info where each pixel is to be drawn on canvas
    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(thisBrushInstance.currColor);
        clickSize.push(thisBrushInstance.currSize);
    }
	
    function redraw(){
        let canvas = thisBrushInstance.animationProject.getCurrFrame();
        let context = canvas.currentCanvas.getContext("2d");
        context.lineJoin = 'round';
        for(let i = 0; i < clickX.length; i++) {
            context.beginPath();
            //this helps generate a solid line, rather than a line of dots. 
            //the subtracting of 1 from i means that the point at i is being connected
            //with the previous point
            if(clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            }else{
                //the adding of 1 allows you to make a dot on click
                context.moveTo(clickX[i], clickY[i] + 1);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.strokeStyle = clickColor[i];
            context.lineWidth = clickSize[i];
            context.stroke();
        }
    }
	
    function clearClick() {
        clickX = [];
        clickY = [];
        clickDrag = [];
        clickColor = [];
        clickSize = [];
    }
}

export {
	Brush
};
