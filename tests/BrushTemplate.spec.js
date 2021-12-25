import 'jest-canvas-mock';
import { BrushManager } from '../src/utils/BrushManager.js';
import { AnimationProject } from '../src/utils/AnimationProject.js';
import { BrushTemplate } from '../src/brushes/BrushTemplate.js';

describe("test brush template", () => {
    
    const containerId = "containerId";
    
    beforeAll(() => {
        const container = document.createElement("div");
        container.id = containerId;
        container.style.height = "200px";
        container.style.width = "200px";
        document.body.appendChild(container);
    });

    it("test creation", () => {
        const container = document.querySelector('.' + containerId);
        const animProj = new AnimationProject(container);
        const brushMan = new BrushManager(animProj);
        const brush = new BrushTemplate(brushMan);
        expect(brush.brushManager).toEqual(brushMan);
        expect(brush.paint).toEqual(false);
    });
    
    // TODO: need to mock pointer events!
    it("test addClick and clearClick", () => {
        const container = document.querySelector('.' + containerId);
        const animProj = new AnimationProject(container);
        const brushMan = new BrushManager(animProj);
        const brush = new BrushTemplate(brushMan);
        
        const mockEvt = {
            offsetX: 1,
            offsetY: 5,
        }
        
        brush.addClick(mockEvt, true);
        expect(brush.clickX.length).toEqual(1);
        expect(brush.clickY.length).toEqual(1);
        expect(brush.clickDrag.length).toEqual(1);
        expect(brush.clickColor.length).toEqual(1);
        expect(brush.clickSize.length).toEqual(1);
        
        expect(brush.clickX[0]).toEqual(1);
        expect(brush.clickY[0]).toEqual(5);
        expect(brush.clickDrag[0]).toEqual(true);
        expect(brush.clickColor[0]).toEqual("rgba(0,0,0,255)");
        expect(brush.clickSize[0]).toEqual(2);
        expect(brush.clickPressure[0]).toEqual(1);
        
        brush.addClick(mockEvt, true);
        expect(brush.clickColor[1]).toEqual("rgba(0,0,0,255)");
        expect(brush.clickSize[1]).toEqual(2);
        
        brush.clearClick();
        expect(brush.clickX.length).toEqual(0);
        expect(brush.clickY.length).toEqual(0);
        expect(brush.clickDrag.length).toEqual(0);
        expect(brush.clickColor.length).toEqual(0);
        expect(brush.clickSize.length).toEqual(0);
        
        // now add the pressure field to the evt and activate pressure sensitivity
        mockEvt.pressure = 0.5;
        brushMan.togglePressureColorFlag();
        
        brush.addClick(mockEvt, true);
        expect(brush.clickX.length).toEqual(1);
        expect(brush.clickColor[0]).toEqual("rgba(0,0,0,255)");
        expect(brush.clickPressure[0]).toEqual(.5);
        expect(brush.clickSize[0]).toEqual(2);
        
        // change color
        brushMan.changeBrushColor([120,120,255,255]);
        brush.addClick(mockEvt, true);
        expect(brush.clickX.length).toEqual(2);
        expect(brush.clickColor[1]).toEqual("rgba(60,60,255,255)");
    });
    
});