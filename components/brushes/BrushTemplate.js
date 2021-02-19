// template for brushes
class BrushTemplate {

	constructor(brushManager){
		this.brushManager = brushManager; // a brush will need to use some things the brush manager has
		this.paint = false; // boolean for knowing when brush is active or not
		
		// keep track of the pixels drawn on by the mouse.
		// the redraw function uses this data to connect the dots 
		this.clickX = [];
		this.clickY = [];
		this.clickDrag = [];
		this.clickColor = [];
		this.clickSize = [];
		this.clickPressure = [];
		
		// cursor type
		this.cursorType = "crosshair";
	}
	
	// assuming a PointerEvent, calculate the brush width based on stylus pressure
	_calculateBrushWidth(pointerEvt){
		let brushWidth = this.brushManager.getCurrSize();
		if(pointerEvt.pressure){
			brushWidth = (pointerEvt.pressure*2) * brushWidth;
		}
		return brushWidth;
	}
	
	// collect info where each pixel is to be drawn on canvas
    _addClick(pointerEvt, dragging){
		const x = pointerEvt.offsetX;
		const y = pointerEvt.offsetY;
		const pressure = pointerEvt.pressure;
		let currSize = this.brushManager.getCurrSize();
		let currColor = this.brushManager.getCurrColorArray();
		let penPressure = 1;
		
		// take into account pen pressure for color if needed (as well as for brush size)
		if(this.brushManager.applyPressureColor() && pressure){
			const alpha = pressure * 0.5;
			currColor = 'rgba(' + currColor[0] + ',' + currColor[1] + ',' + currColor[2] + ',' + alpha + ')';
			currSize = this._calculateBrushWidth(pointerEvt);
			penPressure = pressure;
		}else{
			currColor = 'rgba(' + currColor[0] + ',' + currColor[1] + ',' + currColor[2] + ',255)';
		}
		
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
        this.clickColor.push(currColor);
        this.clickSize.push(currSize);
		this.clickPressure.push(penPressure);
    }
	
	
    _redraw(strokeFunction){
        const frame = this.brushManager.animationProject.getCurrFrame();
		const context = frame.getCurrCanvas().getContext("2d");
        context.lineJoin = 'round'; //TODO: make this a brushmanager variable?
		strokeFunction(context);
    }
	
    _clearClick(){
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.clickColor = [];
        this.clickSize = [];
		this.clickPressure = [];
    }
	
	_handleTouchEvent(evt){
		let rect = evt.target.getBoundingClientRect();
		let x = evt.touches[0].pageX - rect.left;
		let y = evt.touches[0].pageY - rect.top - window.pageYOffset;
		return {'x': x, 'y': y};
	}
	
	// event listener functions
	brushStart(evt){
		evt.preventDefault();
	}
	
	brushMove(evt){
		evt.preventDefault();
	}
	
	brushStop(evt){
		evt.preventDefault();
	}
	
	brushLeave(evt){
		evt.preventDefault();
	};
	
	// this is for determining what the brush stroke looks like
	brushStroke(){
	}
	
	// equip the brush and set up the current canvas for using the brush
	attachBrush(){
	}


}

export {
	BrushTemplate
};