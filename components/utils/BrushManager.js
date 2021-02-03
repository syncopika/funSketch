/***
    brush manager class
    pass in an instance of the AnimationProject class as an argument
	
	the current canvas element will be the target for the brush
***/
import { DefaultBrush } from '../brushes/defaultBrush.js';
import { EraserBrush } from '../brushes/eraserBrush.js';
import { RadialBrush } from '../brushes/radialBrush.js';
import { PenBrush } from '../brushes/penBrush.js';
import { FloodfillBrush } from '../brushes/floodfillBrush.js';

class BrushManager {
	constructor(animationProj){
		// pass in an animation project, from which you can access the current frame and the current canvas
		this.animationProject = animationProj;
		this.previousCanvas = null;
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
		this.tempSnapshot = null;
		
		// brushes map
		this.brushesMap = {};
		this.brushesMap["default"] = new DefaultBrush(this);
		this.brushesMap["eraser"] = new EraserBrush(this);
		this.brushesMap["radial"] = new RadialBrush(this);
		this.brushesMap["pen"] = new PenBrush(this);
		this.brushesMap["floodfill"] = new FloodfillBrush(this);
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
		// detach any events from mouse actions (reset the events connected with mouse events) from previous layer worked on
		const frame = this.animationProject.getCurrFrame();	
		const currLayer = frame.getCurrCanvas();
		
		for(let eventType in this.currentEventListeners){
			currLayer.removeEventListener(eventType, this.currentEventListeners[eventType]);
			delete this.currentEventListeners[eventType];
		}
    }
	
	changeBrushSize(size){
        this.currSize = size;
    }
	
	getBrushType(){
		return this.selectedBrush;
	}
	
	setBrushType(brushType){
		this.selectedBrush = brushType;
	}
	
	applyBrush(){
		this.brushesMap[this.selectedBrush].attachBrush();
	}

}

export {
	BrushManager
};
