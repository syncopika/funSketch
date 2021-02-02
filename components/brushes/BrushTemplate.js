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
	}
	
	//collect info where each pixel is to be drawn on canvas
    _addClick(x, y, color, size, dragging){
		const currColor = this.brushManager.currColor; //'rgb(0,0,0)';
		const currSize = this.brushManager.currSize;
		
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
        this.clickColor.push((color === null ? currColor : color));
        this.clickSize.push((size === null ? currSize : size));
    }
	
	
    _redraw(strokeFunction){
        let frame = this.brushManager.animationProject.getCurrFrame();
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