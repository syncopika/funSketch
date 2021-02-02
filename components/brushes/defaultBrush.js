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
		
			// TODO: refactor this so that we can just call a method from brushManager to do this stuff? this is to support undo functionality
			// update previousCanvas
			if(this.brushManager.previousCanvas !== currLayer){
				this.brushManager.previousCanvas = currLayer;
				// reset the snapshots array
				this.brushManager.currentCanvasSnapshots = [];
			}
			if(this.brushManager.tempSnapshot){
				this.brushManager.currentCanvasSnapshots.push(this.tempSnapshot);
			}
			
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
		
		// see if it's a new canvas or we're still on the same one as before the mousedown
		if(this.brushManager.previousCanvas === currLayer){
			// if it is, then log the current image data. this is important for the undo feature
			const w = currLayer.width;
			const h = currLayer.height;
			this.brushManager.tempSnapshot = currLayer.getContext("2d").getImageData(0, 0, w, h);
		}
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
	
	// equip the brush and set up the current canvas for using the brush
	attachBrush(){
		const frame = this.brushManager.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();

		// TODO: refactor this so that we can just call a method from brushManager to do this stuff?
		currLayer.addEventListener('mousedown', this.brushStart.bind(this));
		currLayer.addEventListener('touchstart', this.brushStart.bind(this));
		this.brushManager.currentEventListeners['mousedown'] = this.brushStart.bind(this);
		this.brushManager.currentEventListeners['touchstart'] = this.brushStart.bind(this);
		
		currLayer.addEventListener('mousemove', this.brushMove.bind(this));
		currLayer.addEventListener('touchmove', this.brushMove.bind(this));
		this.brushManager.currentEventListeners['mousemove'] = this.brushMove.bind(this);
		this.brushManager.currentEventListeners['touchmove'] = this.brushMove.bind(this);
		
		currLayer.addEventListener('mouseup', this.brushStop.bind(this));
		currLayer.addEventListener('touchend', this.brushStop.bind(this));
		this.brushManager.currentEventListeners['mouseup'] = this.brushStop.bind(this);
		this.brushManager.currentEventListeners['touchend'] = this.brushStop.bind(this);
		
        currLayer.addEventListener('mouseleave', (evt) => {
			this._clearClick();
            this.paint = false;
        });
	}
}


export {
	DefaultBrush
};