import { BrushTemplate } from './BrushTemplate.js';

class DefaultBrush extends BrushTemplate {
	
	constructor(brushManager){
		super(brushManager);
	}
	
	// event listener functions
	brushStart(evt){
		if(this.isStartBrush(evt)){ //when left click only == (which === 1)
			evt.preventDefault();
			this.paint = true;
			// offset will be different with mobile
			// https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
			// https://stackoverflow.com/questions/11287877/how-can-i-get-e-offsetx-on-mobile-ipad
			//if(evt.type === 'touchstart'){
			//	const newCoords = this._handleTouchEvent(evt);
			//	evt.offsetX = newCoords.x;
			//	evt.offsetY = newCoords.y;
			//	evt.preventDefault();
			//}
			this.addClick(evt, true);
			this.redraw(this.brushStroke.bind(this));
		}
	}
	
	brushMove(evt){
		if(this.paint){
			evt.preventDefault();
			this.addClick(evt, true);
			this.redraw(this.brushStroke.bind(this));
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
		tempCtx.lineJoin = "round";
		tempCtx.fillStyle = "rgba(255, 255, 255, 1)";
		tempCtx.fillRect(0, 0, currCanvas.width, currCanvas.height);
		
		this.brushStroke(tempCtx, "rgba(0,0,0,1)");
		
		const tmpImgData = tempCtx.getImageData(0, 0, currCanvas.width, currCanvas.height).data;
		
		const currLayerImg = currCtx.getImageData(0, 0, currCanvas.width, currCanvas.height);
		const imgData = currLayerImg.data;
		
		for(let i = 0; i <= tmpImgData.length-4; i += 4){
			const r = tmpImgData[i];
			const g = tmpImgData[i+1];
			const b = tmpImgData[i+2];
			if(!(r === 255 && g === 255 && b === 255)){
				imgData[i+3] = 128; // set alpha value in the original image data
			}
		}
		
		currCtx.putImageData(currLayerImg, 0, 0);
	}
	
	brushStop(evt){
		evt.preventDefault();
        this.brushManager.saveSnapshot();
		
		// idea: if we want to have transparency with white, let's try manipulating the alpha channel manually
		// for the pixels via image data (since strokeStyle with an alpha value set does not seem to change the image data :/)
		if(this.brushManager.currColorArray[3] !== 255){
			// we need to apply some transparency via alpha
			this.modifyAlphas(currLayer);
		}
		
		this.clearClick();
		this.paint = false;
	}
	
	// this is for determining what the brush stroke looks like
	brushStroke(context){
		for(let i = 0; i < this.clickX.length; i++){
			//this.clickColor[i] = this.clickColor[i].replace("128", "0.5"); // alpha needs to be between 0 and 1 for strokeStyle!
			context.strokeStyle = this.clickColor[i];
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
		this.clearClick();
		this.paint = false;
	}
	
	// equip the brush and set up the current canvas for using the brush
	attachBrush(){
		let start = this.brushStart.bind(this);
		let move = this.brushMove.bind(this);
		let stop = this.brushStop.bind(this);
		let leave = this.brushLeave.bind(this);
		this.brushManager.updateEventListeners(start, move, stop, leave, this.cursorType);
	}
}


export {
	DefaultBrush
};