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
		it("test frame methods", () => {
			const frame1 = new Frame(containerId, 2);
			
			const frame1data = frame1.getMetadata();
			expect(frame1data.currentIndex).toBe(0);
			expect(frame1data.number).toBe(2);
			expect(frame1data.containerId).toBe(containerId);
			
			// add a new layer
			frame1.setupNewLayer();
			expect(frame1.count).toEqual(1);
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