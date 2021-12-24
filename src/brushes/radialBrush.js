import { BrushTemplate } from './BrushTemplate.js';

class RadialBrush extends BrushTemplate {
    
    constructor(brushManager){
        super(brushManager);
    }
    
    // event listener functions
    brushStart(evt){
        evt.preventDefault();
        if(evt.which === 1 || evt.pointerType === 'touch' || evt.pointerType === 'pen'){        
            this.paint = true;
            const brushWidth = this.calculateBrushWidth(evt);
            this.radialGrad(evt.offsetX, evt.offsetY, brushWidth);
            this.addClick(evt, true);
            this.redraw(this.brushStroke.bind(this));
        }            
    }
    
    brushMove(evt){
        evt.preventDefault();
        if(this.paint){
            const brushWidth = this.calculateBrushWidth(evt);
            this.radialGrad(evt.offsetX, evt.offsetY, brushWidth);
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
    
    brushStroke(context){
        for(let i = 0; i < this.clickX.length; i++){
            context.strokeStyle = this.clickColor[i];
            context.lineWidth = this.clickSize[i];
            
            context.beginPath();
            
            if(this.clickDrag[i] && i){
                context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
            }else{
                //the adding of 1 allows you to make a dot on click
                context.moveTo(this.clickX[i], this.clickY[i] + 1);
            }
            context.lineTo(this.clickX[i], this.clickY[i]);
            context.closePath();
            context.stroke();
        }
    }
    
    radialGrad(x, y, brushSize){
        const frame = this.brushManager.animationProject.getCurrFrame();    
        const currLayer = frame.getCurrCanvas();
        const context = currLayer.getContext("2d");
        const colorPicked = this.brushManager.getCurrColorArray();
        const currColor = this.brushManager.getCurrColor();
        const radGrad = context.createRadialGradient(x, y, brushSize, x, y, brushSize * 1.5);
        
        context.lineJoin = context.lineCap = 'round';
        radGrad.addColorStop(0, currColor);
        
        if(colorPicked !== undefined) {
            radGrad.addColorStop(.5, 'rgba(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ',.5)');
            radGrad.addColorStop(1, 'rgba(' + colorPicked[0] + ',' + colorPicked[1] + ',' + colorPicked[2] + ',0)');
        }else{
            radGrad.addColorStop(.5, 'rgba(0,0,0,.5)');
            radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }
        context.fillStyle = radGrad;
        context.fillRect(x - 20, y - 20, 40, 40);
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
    RadialBrush
};