/***
	web brush 
	thanks to mrdoob: https://github.com/mrdoob/harmony/blob/master/src/js/brushes/web.js
***/

import { BrushTemplate } from './BrushTemplate.js';

class WebBrush extends BrushTemplate {
	
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
		
		// connect the dots
		for(let i = 0; i < this.clickX.length; i++){
			context.strokeStyle = this.clickColor[i];
            context.lineWidth = this.clickSize[i];
			
            context.beginPath();
			
            if(this.clickDrag[i] && i){
                context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
            }else{
                context.moveTo(this.clickX[i], this.clickY[i] + 1);
            }
			
            context.lineTo(this.clickX[i], this.clickY[i]);
            context.closePath();
            context.stroke();
        }
		
		// then add some extra strokes (and make them more faint than the main stroke line if pen pressure flag)
		if(this.brushManager.applyPressureColor()){
			const currColor = this.brushManager.getCurrColorArray();
			const extraStrokeColor = 'rgba(' + currColor[0] + ',' + currColor[1] + ',' + currColor[2] + ',' + (this.clickPressure[this.clickPressure.length-1] * 0.1) + ')';
			context.strokeStyle = extraStrokeColor;
		}
		
		for(let i = 0; i < this.clickX.length; i++){
			const dx = this.clickX[i] - this.clickX[this.clickX.length - 1];
			const dy = this.clickY[i] - this.clickY[this.clickY.length - 1];
			const d = dx*dx + dy*dy;
			
			if(d < 2500 && Math.random() > 0.9){
				context.beginPath();
				context.moveTo(this.clickX[this.clickX.length-1], this.clickY[this.clickY.length-1]);
				context.lineTo(this.clickX[i], this.clickY[i]);
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
	WebBrush
};