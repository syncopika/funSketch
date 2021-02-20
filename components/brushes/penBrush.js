/***
	brush for making shapes
	inspired by mrdoob's work: https://github.com/mrdoob/harmony/
***/

import { BrushTemplate } from './BrushTemplate.js';

class PenBrush extends BrushTemplate {
	
	constructor(brushManager){
		super(brushManager);
	}
	
	// event listener functions
	brushStart(evt){
		evt.preventDefault();
		const frame = this.brushManager.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();
		if(evt.which === 1 || evt.type === 'touchstart'){ //when left click only
			this.paint = true;
			
			if(evt.type === 'touchstart'){
				let newCoords = this._handleTouchEvent(evt);
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
	
	brushStop(evt){
        const frame = this.brushManager.animationProject.getCurrFrame();
		const currLayer = frame.getCurrCanvas();
		evt.preventDefault();
		
		const w = currLayer.width;
		const h = currLayer.height;		
		frame.addSnapshot(currLayer.getContext("2d").getImageData(0, 0, w, h));
		
		this._clearClick();
		this.paint = false;
	}
	
	// this is for determining what the brush stroke looks like
	brushStroke(context){
		const frame = this.brushManager.animationProject.getCurrFrame();
		
		// connect current dot with previous dot
		context.strokeStyle = this.clickColor[this.clickColor.length - 1];
		context.beginPath();
		context.moveTo(this.clickX[this.clickX.length - 1], this.clickY[this.clickY.length - 1]);
		if(this.clickX.length > 1){
			context.lineTo(this.clickX[this.clickX.length - 2], this.clickY[this.clickY.length - 2]);
		}
		context.closePath();
		context.lineWidth = this.clickSize[this.clickSize.length - 1];
		context.stroke();
		
		// then add some extra strokes (and make them more faint than the main stroke line if pen pressure flag)
		if(this.brushManager.applyPressureColor()){
			const currColor = this.brushManager.getCurrColorArray();
			const extraStrokeColor = 'rgba(' + currColor[0] + ',' + currColor[1] + ',' + currColor[2] + ',' + (this.clickPressure[this.clickPressure.length-1] * 0.1) + ')';
			context.strokeStyle = extraStrokeColor;
		}
		
		if(this.clickX.length > 7){
			for(let i = this.clickX.length - 6; i < this.clickX.length; i++){
				// maybe we can do something neat like take into account the direction of the brush based on
				// the vector created by the current and previous coordinates?
				let prevIndex = Math.round((Math.random() * ((this.clickX.length-1) - (this.clickX.length - 6))) + (this.clickX.length - 6)); // get rand index from this.clickX.length - 6 to this.clickX.length - 1 
					const prevCoordX = this.clickX[prevIndex];
					const prevCoordY = this.clickY[prevIndex];
					context.beginPath();
					context.moveTo(prevCoordX + (Math.random() * 3), prevCoordY + (2 * Math.random()));
					context.lineTo(this.clickX[i] - (2 * Math.random()), this.clickY[i] - (Math.random() * 3));
					context.closePath();
					context.stroke();
			}
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
	PenBrush
};