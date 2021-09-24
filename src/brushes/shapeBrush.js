/***
	brush for making shapes
	inspired by mrdoob's work: https://github.com/mrdoob/harmony/
***/

import { BrushTemplate } from './BrushTemplate.js';

class ShapeBrush extends BrushTemplate {
	
	constructor(brushManager){
		super(brushManager);
	}
	
	// event listener functions
	brushStart(evt){
		evt.preventDefault();
		if(this.isStartBrush(evt)){
			this.paint = true;
			this.addClick(evt, true);
			this.redraw(this.brushStroke.bind(this));
		}		
	}
	
	brushMove(evt){
		evt.preventDefault();
		if(this.paint){
			this.addClick(evt, true);
			this.redraw(this.brushStroke.bind(this));
		}
	}
	
	brushStop(evt){
		evt.preventDefault();
		this.brushManager.saveSnapshot();
		this.clearClick();
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
		
		for(let i = 0; i < this.clickX.length; i++){
			context.beginPath();
			context.moveTo(this.clickX[this.clickX.length-1] + (Math.random() * 0.1), this.clickY[this.clickY.length-1] + (0.1 * Math.random()));
			context.lineTo(this.clickX[i] - (0.1 * Math.random()), this.clickY[i] - (Math.random() * 0.1));
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
	ShapeBrush
};