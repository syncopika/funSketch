import 'jest-canvas-mock';
import { BrushManager } from '../components/utils/BrushManager.js';
import { AnimationProject } from '../components/utils/AnimationProject.js';
import { BrushTemplate } from '../components/brushes/BrushTemplate.js';

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
		const animProj = new AnimationProject(containerId);
		const brushMan = new BrushManager(animProj);
		const brush = new BrushTemplate(brushMan);
		expect(brush.brushManager).toEqual(brushMan);
		expect(brush.paint).toEqual(false);
	});
	
	it("test _addClick and _clearClick", () => {
		const animProj = new AnimationProject(containerId);
		const brushMan = new BrushManager(animProj);
		const brush = new BrushTemplate(brushMan);
		
		brush._addClick(1, 5, "color", 5, true);
		expect(brush.clickX.length).toEqual(1);
		expect(brush.clickY.length).toEqual(1);
		expect(brush.clickDrag.length).toEqual(1);
		expect(brush.clickColor.length).toEqual(1);
		expect(brush.clickSize.length).toEqual(1);
		
		expect(brush.clickX[0]).toEqual(1);
		expect(brush.clickY[0]).toEqual(5);
		expect(brush.clickDrag[0]).toEqual(true);
		expect(brush.clickColor[0]).toEqual("color");
		expect(brush.clickSize[0]).toEqual(5);
		
		brush._addClick(1, 5, null, null, true);
		expect(brush.clickColor[1]).toEqual("rgb(0,0,0)");
		expect(brush.clickSize[1]).toEqual(2);
		
		brush._clearClick();
		expect(brush.clickX.length).toEqual(0);
		expect(brush.clickY.length).toEqual(0);
		expect(brush.clickDrag.length).toEqual(0);
		expect(brush.clickColor.length).toEqual(0);
		expect(brush.clickSize.length).toEqual(0);
	});
	
});