import { BrushTemplate } from './BrushTemplate.js';

class DefaultBrush extends BrushTemplate {
	
	constructor(brushManager){
		super(brushManager);
	}
	
	// event listener functions
	brushStart(evt){
		evt.preventDefault();
		const frame = this.brushManager.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();
		const currCtx = currLayer.getContext('2d');
		
		// if using a color with alpha != 255 (so some transparency), change globalAlpha
		if(this.brushManager.currColorArray[3] !== 255){
			// fortunately this doesn't affect things already drawn on the canvas
			// so we can toggle it when we need to draw semi-opaque things
			console.log("got a transparent color!");
			currCtx.globalAlpha = this.brushManager.currColorArray[3]/255; // needs to be between 0 and 1
			console.log(currCtx.globalAlpha);
		}else{
			currCtx.globalAlpha = 1.0;
		}
		
		if(evt.which === 1 || evt.type === 'touchstart'){ //when left click only
			this.paint = true;
			// offset will be different with mobile
			// https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
			// https://stackoverflow.com/questions/11287877/how-can-i-get-e-offsetx-on-mobile-ipad
			if(evt.type === 'touchstart'){
				const newCoords = this._handleTouchEvent(evt);
				evt.offsetX = newCoords.x;
				evt.offsetY = newCoords.y;
				evt.preventDefault();
			}
			this._addClick(evt, true);
			this._redraw(this.brushStroke.bind(this));
		}
	}
	
	brushMove(evt){
		evt.preventDefault();
		if(this.paint){
			if(evt.type === 'touchmove'){
				const newCoords = this._handleTouchEvent(evt);
				evt.offsetX = newCoords.x;
				evt.offsetY = newCoords.y;
				// prevent page scrolling when drawing 
				evt.preventDefault();
			}
			this._addClick(evt, true);
			this._redraw(this.brushStroke.bind(this));
		}
	}
	
	modifyAlphas(currCanvas){
		// make a temp canvas and redraw the current stroke on it (black on white background)
		// go through the temp canvas image data and look for the black pixels.
		// wherever we see a black pixel we look in the same index in the current layer image data
		// and manually set its alpha to whatever it should be based on current color
        const currCtx = currCanvas.getContext("2d");
		
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext("2d");
		tempCanvas.width = currCanvas.width;
		tempCanvas.height = currCanvas.height;
		tempCtx.fillStyle = "#fff";
		tempCtx.strokeStyle = "#000";
		tempCtx.fillRect(0, 0, currCanvas.width, currCanvas.height);
		
		this.brushStroke(tempCtx, "#000");
		
		const tmpImgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
		
		const currLayerImgData = currCtx.getImageData(0, 0, currCanvas.width, currCanvas.height);
		const imgData = currLayerImgData.data;
		
		for(let i = 0; i <= tmpImgData.length-4; i += 4){
			const r = tmpImgData[i];
			const g = tmpImgData[i+1];
			const b = tmpImgData[i+2];
			if(r == 0 && g == 0 && b == 0){
				imgData[i+3] = 128; // set alpha value in the original image data
			}
		}
		
		currCtx.putImageData(currLayerImgData, 0, 0);
	}
	
	brushStop(evt){
        const frame = this.brushManager.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();
		const currCtx = currLayer.getContext("2d");
		evt.preventDefault();

		const w = currLayer.width;
		const h = currLayer.height;
		
		// idea: if we want to have transparency with white, let's try manipulating the alpha channel manually
		// for the pixels via image data (since strokeStyle with an alpha value set does not seem to change the image data :/)
		// this kinda gets me what I want but it's still not good
		if(this.brushManager.currColorArray[3] !== 255){
			// we need to apply some transparency via alpha
			this.modifyAlphas(currLayer);
		}
		
		frame.addSnapshot();
		
		this._clearClick();
		this.paint = false;
	}
	
	// this is for determining what the brush stroke looks like
	brushStroke(context, strokeColor=null){
		for(let i = 0; i < this.clickX.length; i++){
			context.strokeStyle = strokeColor ? strokeColor : this.clickColor[i];
            context.lineWidth = this.clickSize[i];
			
            context.beginPath();
			
            // this helps generate a solid line, rather than a line of dots.
            if(this.clickDrag[i] && i){
                context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
            }else{
                // the adding of 1 allows you to make a dot on click
                context.moveTo(this.clickX[i], this.clickY[i] + 1);
            }
			
            context.lineTo(this.clickX[i], this.clickY[i]);
            context.closePath();
            context.stroke();
        }
	}
	
	brushLeave(){
		this._clearClick();
		this.paint = false;
	}
	
	// equip the brush and set up the current canvas for using the brush
	attachBrush(){
		const frame = this.brushManager.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();
		currLayer.style.cursor = this.cursorType;

		// TODO: refactor this so that we can just call a method from brushManager to do this stuff?
		let start = this.brushStart.bind(this);
		currLayer.addEventListener('pointerdown', start);
		currLayer.addEventListener('touchstart', start);
		this.brushManager.currentEventListeners['pointerdown'] = start;
		this.brushManager.currentEventListeners['touchstart'] = start;
		
		let move = this.brushMove.bind(this);
		currLayer.addEventListener('pointermove', move);
		currLayer.addEventListener('touchmove', move);
		this.brushManager.currentEventListeners['pointermove'] = move;
		this.brushManager.currentEventListeners['touchmove'] = move;
		
		let stop = this.brushStop.bind(this);
		currLayer.addEventListener('pointerup', stop);
		currLayer.addEventListener('touchend', stop);
		this.brushManager.currentEventListeners['pointerup'] = stop;
		this.brushManager.currentEventListeners['touchend'] = stop;
		
		let leave = this.brushLeave.bind(this);
		currLayer.addEventListener('pointerleave', leave);
		this.brushManager.currentEventListeners['pointerleave'] = leave;
	}
}


export {
	DefaultBrush
};