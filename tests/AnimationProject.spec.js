import 'jest-canvas-mock';
import { AnimationProject, Frame } from '../components/AnimationProject.js';

describe("test AnimationProject classes", () => {
	
	const containerId = "containerId";
	
	beforeAll(() => {
		const container = document.createElement("div");
		container.id = containerId;
		document.body.appendChild(container);
	});
	
	describe("test Frame class", () => {
		it("test frame creation and setup", () => {
			const frame1 = new Frame(containerId, 2);
			
			// check metadata
			const frame1data = frame1.getMetadata();
			expect(frame1data.currentIndex).toBe(0);
			expect(frame1data.number).toBe(2);
			expect(frame1data.containerId).toBe(containerId);
			
			// add a new layer
			frame1.setupNewLayer();
			expect(frame1.count).toEqual(1);
			
			let currCanvas = frame1.getCurrCanvas();
			expect(currCanvas.style.opacity).toEqual("0.97");
			expect(currCanvas.style.zIndex).toEqual("1");
			expect(currCanvas.style.cursor).toEqual("crosshair");
			expect(currCanvas.parentNode).toBe(document.getElementById(containerId));
			
			// add a new layer
			frame1.setupNewLayer();
			currCanvas = frame1.getCurrCanvas();
			
			expect(frame1.count).toEqual(2);
			expect(currCanvas).toEqual(frame1.canvasList[0]);
			expect(currCanvas).not.toEqual(frame1.canvasList[1]);
			expect(frame1.canvasList[0].style.opacity).toEqual("0.97");
			expect(frame1.canvasList[1].style.opacity).toEqual("0");
		});
		
		
		it("test frame hide and show", () => {
			const frame = new Frame(containerId, 0);
			frame.setupNewLayer();
			frame.setupNewLayer();
			frame.setupNewLayer();
			expect(frame.canvasList.length).toEqual(3);
			
			// hide the frame
			frame.hide();
			
			frame.canvasList.forEach((layer) => {
				expect(layer.style.zIndex).toEqual("-1");
				expect(layer.style.visibility).toEqual("hidden");
				expect(layer.style.cursor).toEqual("");
			});
			
			// show frame
			frame.show();
			
			for(let i = 0; i < frame.canvasList.length; i++){
				let layer = frame.canvasList[i];
				
				// expect first layer to be topmost
				if(i === 0){
					expect(layer.style.zIndex).toEqual("1");
				}else{
					expect(layer.style.zIndex).toEqual("0");
				}
				
				expect(layer.style.visibility).toEqual("");
				expect(layer.style.cursor).toEqual("crosshair");				
			}
		});
		
		it("test frame setToLayer", () => {
		});
		
		it("test frame copyCanvas", () => {
		});
		
		it("test frame clearCurrentLayer", () => {
		});
	});
	
	describe("test AnimationProject class", () => {
		it("testAnimationProject methods", () => {
			const animProject = new AnimationProject(containerId);
			
			expect(animProject.container).toEqual(containerId);
			expect(animProject.frameList.length).toEqual(0);
			
			animProject.addNewFrame(false);
			expect(animProject.frameList.length).toEqual(1);
			expect(animProject.frameList[0].canvasList.length).toEqual(1);
			expect(animProject.frameList[0].canvasList[0].style.visibility).toEqual("hidden");
		});
	});
	
});