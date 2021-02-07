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
		if((evt.which === 1 && evt.type === 'mousedown') || evt.type === 'touchstart') { //when left click only
			this.paint = true;
			// offset will be different with mobile
			// https://stackoverflow.com/questions/17130940/retrieve-the-same-offsetx-on-touch-like-mouse-event
			// https://stackoverflow.com/questions/11287877/how-can-i-get-e-offsetx-on-mobile-ipad
			if(evt.type === 'touchstart'){
				const newCoords = this.brushManager._handleTouchEvent(evt);
				evt.offsetX = newCoords.x;
				evt.offsetY = newCoords.y;
				evt.preventDefault();
			}
			this._addClick(evt.offsetX, evt.offsetY, null, null, true);
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
			this._addClick(evt.offsetX, evt.offsetY, null, null, true);
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
	brushStroke(){
		const frame = this.brushManager.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();
		const context = currLayer.getContext("2d");
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
		currLayer.addEventListener('mousedown', start);
		currLayer.addEventListener('touchstart', start);
		this.brushManager.currentEventListeners['mousedown'] = start;
		this.brushManager.currentEventListeners['touchstart'] = start;
		
		let move = this.brushMove.bind(this);
		currLayer.addEventListener('mousemove', move);
		currLayer.addEventListener('touchmove', move);
		this.brushManager.currentEventListeners['mousemove'] = move;
		this.brushManager.currentEventListeners['touchmove'] = move;
		
		let stop = this.brushStop.bind(this);
		currLayer.addEventListener('mouseup', stop);
		currLayer.addEventListener('touchend', stop);
		this.brushManager.currentEventListeners['mouseup'] = stop;
		this.brushManager.currentEventListeners['touchend'] = stop;
		
		let leave = this.brushLeave.bind(this);
		currLayer.addEventListener('mouseleave', leave);
		this.brushManager.currentEventListeners['mouseleave'] = leave;
	}
}


export {
	DefaultBrush
};