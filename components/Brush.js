/***
    brush class
    pass in an instance of the AnimationProject class as an argument
    the canvas argument will have a reference to the current canvas so that
    only the current canvas will be a target for the brush
***/
	
class Brush {
	constructor(animationProj){
		// pass in an animation project, from which you can access the current frame and the current canvas
		this.animationProject = animationProj;
		this.previousCanvas = undefined;
		this.currentCanvasSnapshots = []; // keep track of what the current canvas looks like after each mouseup
		this.currentEventListeners = {}; // keep track of current brush's event listeners so we can detach when switching
		this.selectedBrush = 'default'; // user-selected brush 
		this.currColor = 'rgb(0,0,0)';
		this.currColorArray = Uint8Array.from([0, 0, 0, 0]);
		this.currSize = 2;
		
		// keep track of the pixels drawn on by the mouse.
		// the redraw function uses this data to connect the dots 
		this.clickX = [];
		this.clickY = [];
		this.clickDrag = [];
		this.clickColor = [];
		this.clickSize = [];
		
		// hold the current image after mouseup. 
		// only put it in the currentCanvasSnapshots after user starts drawing again, creating a new snapshot
		this.tempSnapshot;
	}
	
    //collect info where each pixel is to be drawn on canvas
    _addClick(x, y, color, size, dragging){
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
        this.clickColor.push((color === null ? this.currColor : color));
        this.clickSize.push((size === null ? this.currSize : size));
    }
	
	
    _redraw(strokeFunction){
        let frame = this.animationProject.getCurrFrame();
        let context = frame.getCurrCanvas().getContext("2d");
        context.lineJoin = 'round';
		strokeFunction(context);
    }
	
    _clearClick() {
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.clickColor = [];
        this.clickSize = [];
    }
	
	_handleTouchEvent(evt){
		let rect = evt.target.getBoundingClientRect();
		let x = evt.touches[0].pageX - rect.left;
		let y = evt.touches[0].pageY - rect.top - window.pageYOffset;
		return {'x': x, 'y': y};
	}
	
    resetBrush(){
        const canvas = this.animationProject.getCurrFrame();
        const curCanvas = canvas.getCurrCanvas();
        //detach any events from mouse actions (reset the events connected with mouse events)
		for(let eventType in this.currentEventListeners){
			curCanvas.removeEventListener(eventType, this.currentEventListeners[eventType]);
			delete curCanvas[eventType];
		}
    }
	
	changeBrushSize(size){
        this.currSize = size;
    }
	
	applyBrush(){
		// pretty hacky but will refactor later...probably
		if(this.selectedBrush === 'default'){
			this.defaultBrush();
		}else if(this.selectedBrush === 'pen'){
			this.penBrush();
		}else if(this.selectedBrush === 'radial'){
			this.radialGradBrush();
		}else{
			// floodfill
			this.floodfillBrush();
		}
	}
	
	/***
		default brush
	***/
    defaultBrush(){
        // reset mouse action functions first 
        this.resetBrush();
		
        const frame = this.animationProject.getCurrFrame();	
		const currCanvas = frame.getCurrCanvas();
		let paint;
		
		let defaultBrushStart = (evt) => {
			evt.preventDefault();
			if((evt.which === 1 && evt.type === 'mousedown') || evt.type === 'touchstart') { //when left click only
				const currLayer = frame.getCurrCanvas();
				// update previousCanvas
				if(this.previousCanvas !== currLayer){
					this.previousCanvas = currLayer;
					// reset the snapshots array
					this.currentCanvasSnapshots = [];
				}
				
				if(this.tempSnapshot){
					this.currentCanvasSnapshots.push(this.tempSnapshot);
				}
				
				paint = true;
				// offset will be different with mobile
				// use e.originalEvent because using jQuery
				// https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
				// https://stackoverflow.com/questions/11287877/how-can-i-get-e-offsetx-on-mobile-ipad
				// using rect seems to work pretty well
				if(evt.type === 'touchstart'){
					const newCoords = this._handleTouchEvent(evt);
					evt.offsetX = newCoords.x;
					evt.offsetY = newCoords.y;
				}
				this._addClick(evt.offsetX, evt.offsetY, null, null, true);
				this._redraw(this._defaultBrushStroke.bind(this));
			}
		}
		currCanvas.addEventListener('mousedown', defaultBrushStart);
		currCanvas.addEventListener('touchstart', defaultBrushStart);
		this.currentEventListeners['mousedown'] = defaultBrushStart;
		this.currentEventListeners['touchstart'] = defaultBrushStart;
		
        // draw the lines as mouse moves
		let defaultBrushMove = (evt) => {
			if(paint){
                if(evt.type === 'touchmove'){
                    const newCoords = this._handleTouchEvent(evt);
                    evt.offsetX = newCoords.x;
                    evt.offsetY = newCoords.y;
                    // prevent page scrolling when drawing 
                    evt.preventDefault();
                }
                this._addClick(evt.offsetX, evt.offsetY, null, null, true);
                this._redraw(this._defaultBrushStroke.bind(this));
            }
		}
		currCanvas.addEventListener('mousemove', defaultBrushMove);
		currCanvas.addEventListener('touchmove', defaultBrushMove);
		this.currentEventListeners['mousemove'] = defaultBrushMove;
		this.currentEventListeners['touchmove'] = defaultBrushMove;
		
        // stop drawing
		let defaultBrushStop = (evt) => {
			// see if it's a new canvas or we're still on the same one as before the mousedown
			const currLayer = frame.getCurrCanvas();
			if(this.previousCanvas === currLayer){
				// if it is, then log the current image data. this is important for the undo feature
				const w = currLayer.width;
				const h = currLayer.height;
				this.tempSnapshot = currLayer.getContext("2d").getImageData(0, 0, w, h);
			}
			this._clearClick();
			paint = false;
		}
		currCanvas.addEventListener('mouseup', defaultBrushStop);
		currCanvas.addEventListener('touchend', defaultBrushStop);
		this.currentEventListeners['mouseup'] = defaultBrushStop;
		this.currentEventListeners['touchend'] = defaultBrushStop;
		
        //stop drawing when mouse leaves
		// TODO: we really shouldn't have multiple instances of this
        currCanvas.addEventListener('mouseleave', (evt) => {
			this._clearClick();
            paint = false;
        });
    }
	
	_defaultBrushStroke(context){
		for(let i = 0; i < this.clickX.length; i++){
            context.beginPath();
            //this helps generate a solid line, rather than a line of dots. 
            //the subtracting of 1 from i means that the point at i is being connected
            //with the previous point
            if(this.clickDrag[i] && i){
                context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
            }else{
                //the adding of 1 allows you to make a dot on click
                context.moveTo(this.clickX[i], this.clickY[i] + 1);
            }
            context.lineTo(this.clickX[i], this.clickY[i]);
            context.closePath();
            context.strokeStyle = this.clickColor[i];
            context.lineWidth = this.clickSize[i];
            context.stroke();
        }
	}
	
    /***
        radial gradient brush
    ***/
    radialGradBrush(){
		
        // reset mouse action functions first 
        this.resetBrush();
        
		const frame = this.animationProject.getCurrFrame();
		const curCanvas = frame.getCurrCanvas();
		const context = frame.getCurrCanvas().getContext("2d");
		context.lineJoin = context.lineCap = 'round';
		
        let paint;
		
		let radGradBrushStart = (evt) => {
            if((evt.which === 1 && evt.type === 'mousedown') || evt.type === 'touchstart'){
				// update previousCanvas
                if(this.previousCanvas !== curCanvas){
                    this.previousCanvas = curCanvas;
                    // reset the snapshots array
                    this.currentCanvasSnapshots = [];
                }
				
                if(this.tempSnapshot){
                    this.currentCanvasSnapshots.push(this.tempSnapshot);
                }
				
                paint = true;
				
				if(evt.type === 'touchstart'){
                    const newCoords = this._handleTouchEvent(evt);
                    evt.offsetX = newCoords.x;
                    evt.offsetY = newCoords.y;
                    // prevent page scrolling when drawing 
                    evt.preventDefault();
                }
				
				this._radialGrad(evt.offsetX, evt.offsetY)
				this._addClick(evt.offsetX, evt.offsetY, null, null, true);
				this._redraw(this._defaultBrushStroke.bind(this));
            }
		}
		curCanvas.addEventListener('mousedown', radGradBrushStart);
		curCanvas.addEventListener('touchstart', radGradBrushStart);
		this.currentEventListeners['mousedown'] = radGradBrushStart;
		this.currentEventListeners['touchstart'] = radGradBrushStart;
		
		let radGradBrushMove = (evt) => {
			if(paint){
				if(evt.type === 'touchmove'){
                    const newCoords = this._handleTouchEvent(evt);
                    evt.offsetX = newCoords.x;
                    evt.offsetY = newCoords.y;
                    // prevent page scrolling when drawing 
                    evt.preventDefault();
                }
				
				this._radialGrad(evt.offsetX, evt.offsetY)
				this._addClick(evt.offsetX, evt.offsetY, null, null, true);
				this._redraw(this._defaultBrushStroke.bind(this));
            }
		}
		curCanvas.addEventListener('mousemove', radGradBrushMove);
		curCanvas.addEventListener('touchmove', radGradBrushMove);
		this.currentEventListeners['mousemove'] = radGradBrushMove;
		this.currentEventListeners['touchmove'] = radGradBrushMove;
		
		// this function seems to be shared among all brushes for stopping. TODO: just have one of these functions
		let radGradBrushStop = (evt) => {
			const currLayer = frame.getCurrCanvas();
            if(this.previousCanvas === currLayer){
                // if it is, then log the current image data. this is important for the undo feature
                const w = currLayer.width;
                const h = currLayer.height;
                this.currentCanvasSnapshots.push(currLayer.getContext("2d").getImageData(0, 0, w, h));
            }
			this._clearClick();
			paint = false;
		}
		curCanvas.addEventListener('mouseup', radGradBrushStop);
		curCanvas.addEventListener('touchend', radGradBrushStop);
		this.currentEventListeners['mouseup'] = radGradBrushStop;
		this.currentEventListeners['touchend'] = radGradBrushStop;
		
        //stop drawing when mouse leaves
		curCanvas.addEventListener('mouseleave', (evt) => {
			this._clearClick();
            paint = false;			
		});
    }
	
    _radialGrad(x, y){
        const canvas = this.animationProject.getCurrFrame();
        const context = canvas.currentCanvas.getContext("2d");
        const radGrad = context.createRadialGradient(x, y, this.currSize, x, y, this.currSize * 1.5);
        const colorPicked = this.currColorArray;
        radGrad.addColorStop(0, this.currColor);
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
		pen-like brush 
		thanks to mrdoob: https://github.com/mrdoob/harmony/blob/master/src/js/brushes/sketchy.js
	***/
	penBrush(){
		this.resetBrush();
        
		const canvas = this.animationProject.getCurrFrame();
        const currCanvas = canvas.currentCanvas;
		let paint;
		
		let penBrushStart = (evt) => {
            if((evt.which === 1 && evt.type === 'mousedown') || evt.type === 'touchstart') { //when left click only
                // update previousCanvas
                if(this.previousCanvas !== canvas.currentCanvas){
                    this.previousCanvas = canvas.currentCanvas;
                    // reset the snapshots array
                    this.currentCanvasSnapshots = [];
                }
				
                if(this.tempSnapshot){
                    this.currentCanvasSnapshots.push(this.tempSnapshot);
                }
				
                paint = true;
				
                if(evt.type === 'touchstart'){
                    let newCoords = this._handleTouchEvent(e);
                    evt.offsetX = newCoords.x;
                    evt.offsetY = newCoords.y;
                }
                this._addClick(evt.offsetX, evt.offsetY, null, null, true);
                this._redraw(this._penBrushStroke.bind(this));
            }
		}
		currCanvas.addEventListener("mousedown", penBrushStart);
		currCanvas.addEventListener("touchstart", penBrushStart);
		this.currentEventListeners['mousedown'] = penBrushStart;
		this.currentEventListeners['touchstart'] = penBrushStart;
		
        //draw the lines as mouse moves
		let penBrushMove = (evt) => {
            if(paint){
                if(evt.type === 'touchmove'){
                    let newCoords = this._handleTouchEvent(evt);
                    evt.offsetX = newCoords.x;
                    evt.offsetY = newCoords.y;
                    evt.preventDefault();
                }
                this._addClick(evt.offsetX, evt.offsetY, null, null, true);
                this._redraw(this._penBrushStroke.bind(this));
            }
		}
		currCanvas.addEventListener('mousemove', penBrushMove);
		currCanvas.addEventListener('touchmove', penBrushMove);
		this.currentEventListeners['mousemove'] = penBrushMove;
		this.currentEventListeners['touchmove'] = penBrushMove;
		
        //stop drawing
		let penBrushStop = (evt) => {
            // see if it's a new canvas or we're still on the same one as before the mousedown
            if(this.previousCanvas === canvas.currentCanvas){
                // if it is, then log the current image data. this is important for the undo feature
                let w = canvas.currentCanvas.width;
                let h = canvas.currentCanvas.height;
                this.tempSnapshot = canvas.currentCanvas.getContext("2d").getImageData(0, 0, w, h);
            }
            this._clearClick();
            paint = false;
		}
		currCanvas.addEventListener('mouseup', penBrushStop);
		currCanvas.addEventListener('touchend', penBrushStop);
		this.currentEventListeners['mouseup'] = penBrushStop;
		this.currentEventListeners['touchend'] = penBrushStop;
		
        //stop drawing when mouse leaves
        currCanvas.addEventListener('mouseleave', (evt) => {
			this._clearClick();
            paint = false;
        });
	}
	
	_penBrushStroke(context){
		let clickX = this.clickX;
		let clickY = this.clickY;
		let clickColor = this.clickColor;
		let clickSize = this.clickSize;
		
		// connect current dot with previous dot
		context.beginPath();
		context.moveTo(clickX[clickX.length - 1], clickY[clickY.length - 1]);
		if(clickX.length > 1){
			context.lineTo(clickX[clickX.length - 2], clickY[clickY.length - 2]);
		}
		context.closePath();
		context.strokeStyle = clickColor[clickColor.length-1];
		context.lineWidth = clickSize[clickSize.length - 1];
		context.stroke();
		
		// then add some extra strokes
		for(let i = 0; i < clickX.length; i++){
			let dx = clickX[i] - clickX[clickX.length - 1];
			let dy = clickY[i] - clickY[clickY.length - 1];
			let d = dx*dx + dy*dy;
			
			if(d < 2000 && Math.random() > (d / 1000)){
				context.beginPath();
				context.moveTo(clickX[clickX.length-1] + (dx * 0.3), clickY[clickY.length-1] + (dy * 0.3));
				context.lineTo(clickX[clickX.length-1] - (dx * 0.3), clickY[clickY.length-1] - (dy * 0.3));
				context.closePath();
				context.stroke();
			}
        }
	}
	
	/***
	
		floodfill brush
		
		not really a brush, but should be considered a separate brush so its mousedown action 
		won't conflict with the other brushes (i.e. no painting at the same time of a floodfill)
	
	***/
	floodfillBrush(){
		// reset mouse action functions first 
        this.resetBrush();
		
        const frame = this.animationProject.getCurrFrame();
		const curCanvas = frame.currentCanvas;
		
		let floodfillEvt = (evt) => {
			if((evt.which === 1 && evt.type === 'mousedown') || evt.type === 'touchstart'){ //when left click only
                // update previousCanvas
                if(this.previousCanvas !== frame.currentCanvas){
                    this.previousCanvas = frame.currentCanvas;
                    // reset the snapshots array
                    this.currentCanvasSnapshots = [];
                }
				
                if(this.tempSnapshot){
                    this.currentCanvasSnapshots.push(this.tempSnapshot);
                }

                if(evt.type === 'touchstart'){
                    let newCoords = this._handleTouchEvent(evt);
                    evt.offsetX = newCoords.x;
                    evt.offsetY = newCoords.y;
                }
                
				// do floodfill
                // need to parse the currColor because right now it looks like "rgb(x,y,z)". 
                // I want it to look like [x, y, z]
				let currColor = this.currColor;
                let currColorArray = currColor.substring(currColor.indexOf('(')+1, currColor.length-1).split(',');
                currColorArray = currColorArray.map(function(a){ return parseInt(a); });
				
				let x = evt.offsetX;
				let y = evt.offsetY;

                let colorData = document.getElementById(frame.currentCanvas.id).getContext("2d").getImageData(x, y, 1, 1).data;
                let color = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';
 
                // create an object with the pixel data
                let pixel = {'x': Math.floor(x), 'y': Math.floor(y), 'color': color};

                this.floodfill(curCanvas, currColorArray, pixel);
            }
		}
		curCanvas.addEventListener('mousedown', floodfillEvt);
		curCanvas.addEventListener('touchstart', floodfillEvt);
		this.currentEventListeners['mousedown'] = floodfillEvt;
		this.currentEventListeners['touchstart'] = floodfillEvt;
	}
	
	// the actual floodfill function 
    floodfill(currentCanvas, newColor, pixelSelected){
        // create a stack 
        let stack = [];
        // create visited set 
        // the format of these entries will be like: {'xCoord,yCoord': 1}
        let visited = new Set();
        // the selectedPixel will have the color that needs to be targeted by floodfill 
        let targetColor = pixelSelected.color;
        // current canvas context 
        let ctx = document.getElementById(currentCanvas.id).getContext('2d');
        // get the image data of the entire canvas 
        // do the floodfill, then put the edited image data back 
        let imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
        let data = imageData.data;
		let originalData = new Uint8ClampedArray(imageData.data);
        stack.push(pixelSelected);
        while(stack.length !== 0){
            // get a pixel
            let currPixel = stack.pop();
            // add to visited set 
            visited.add(currPixel.x + ',' + currPixel.y);
            // get left, right, top and bottom neighbors 
            let leftNeighborX = currPixel.x - 1;
            let rightNeighborX = currPixel.x + 1;
            let topNeighborY = currPixel.y - 1;
            let bottomNeighborY = currPixel.y + 1;
            let r, g, b;
            // top neighbor
            if(topNeighborY >= 0 && !visited.has(currPixel.x + ',' + topNeighborY)){
                // index of r, g and b colors in imageData.data
                r = (topNeighborY * currentCanvas.width * 4) + ((currPixel.x + 1) * 4);
                g = r + 1;
                b = g + 1;
                if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')'){
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': currPixel.x, 'y': topNeighborY, 'color': currPixel.color });
                }
            }
            // right neighbor 
            if(rightNeighborX < currentCanvas.width && !visited.has(rightNeighborX + ',' + currPixel.y)){
                r = (currPixel.y * currentCanvas.width * 4) + ((rightNeighborX + 1) * 4);
                g = r + 1;
                b = g + 1;
                if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')'){
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': rightNeighborX, 'y': currPixel.y, 'color': currPixel.color });
                }
            }
            // bottom neighbor
            if(bottomNeighborY < currentCanvas.height && !visited.has(currPixel.x + ',' + bottomNeighborY)){
                r = (bottomNeighborY * currentCanvas.width * 4) + ((currPixel.x + 1) * 4);
                g = r + 1;
                b = g + 1;
                if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')') {
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': currPixel.x, 'y': bottomNeighborY, 'color': currPixel.color });
                }
            }
            // left neighbor
            if(leftNeighborX >= 0 && !visited.has(leftNeighborX + ',' + currPixel.y)){
                r = (currPixel.y * currentCanvas.width * 4) + ((leftNeighborX + 1) * 4);
                g = r + 1;
                b = g + 1;
                if(targetColor === 'rgb(' + originalData[r] + ',' + originalData[g] + ',' + originalData[b] + ')') {
                    // if the neighbor's color is the same as the targetColor, add it to the stack
                    stack.push({ 'x': leftNeighborX, 'y': currPixel.y, 'color': currPixel.color });
                }
            }
            // finally, update the color of the current pixel 
            r = (currPixel.y * currentCanvas.width * 4) + ((currPixel.x + 1) * 4);
            g = r + 1;
            b = g + 1;
            data[r] = newColor[0];
            data[g] = newColor[1];
            data[b] = newColor[2];
        }
        // put new edited image back on canvas
        ctx.putImageData(imageData, 0, 0);
    }
}

export {
	Brush
};
