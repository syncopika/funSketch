/***
    brush manager class
    pass in an instance of the AnimationProject class as an argument
	
	the current canvas element will be the target for the brush
***/
import { DefaultBrush } from '../brushes/defaultBrush.js';
import { EraserBrush } from '../brushes/eraserBrush.js';
import { RadialBrush } from '../brushes/radialBrush.js';
import { SketchyBrush } from '../brushes/sketchyBrush.js';
import { WebBrush } from '../brushes/webBrush.js';
import { ShapeBrush } from '../brushes/shapeBrush.js';
import { PenBrush } from '../brushes/penBrush.js';
import { FloodfillBrush } from '../brushes/floodfillBrush.js';
import { ColorPickerBrush } from '../brushes/colorPickerBrush.js';

class BrushManager {
	constructor(animationProj){
		// pass in an animation project, from which you can access the current frame and the current canvas
		this.animationProject = animationProj;
		this.currentEventListeners = {}; // keep track of current brush's event listeners so we can detach when switching
		this.selectedBrush = 'default'; // user-selected brush 
		this.currColor = 'rgba(0,0,0,255)';
		this.currColorArray = Uint8Array.from([0, 0, 0, 255]);
		this.currSize = 2;
		this.pressureColorFlag = false; // whether brush color should depend on pen pressure
		
		// brushes map
		this.brushesMap = {};
		this.brushesMap["default"] = new DefaultBrush(this);
		this.brushesMap["radial"] = new RadialBrush(this);
		this.brushesMap["sketchy"] = new SketchyBrush(this);
		this.brushesMap["web"] = new WebBrush(this);
		this.brushesMap["shape"] = new ShapeBrush(this);
		this.brushesMap["pen"] = new PenBrush(this);
		this.brushesMap["floodfill"] = new FloodfillBrush(this);
		this.brushesMap["colorpicker"] = new ColorPickerBrush(this);
		this.brushesMap["eraser"] = new EraserBrush(this);
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
	
	changeBrushColor(colorArray){
		this.currColor = 'rgba(' + colorArray.join(",") + ')';
		this.currColorArray = colorArray;
	}
	
	getBrushType(){
		return this.selectedBrush;
	}
	
	getCurrColor(){
		return this.currColor;
	}
	
	getCurrColorArray(){
		return this.currColorArray;
	}
	
	getCurrSize(){
		return this.currSize;
	}
	
	applyPressureColor(){
		return this.pressureColorFlag;
	}
	
	setBrushType(brushType){
		this.selectedBrush = brushType;
	}
	
	togglePressureColorFlag(){
		this.pressureColorFlag = !this.pressureColorFlag;
	}
	
	applyBrush(){
		this.brushesMap[this.selectedBrush].attachBrush();
	}

}

export {
	BrushManager
};
