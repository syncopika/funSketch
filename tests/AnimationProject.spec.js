import 'jest-canvas-mock';
import { AnimationProject } from '../components/utils/AnimationProject.js';

describe("test AnimationProject", () => {
	
	const containerId = "containerId";
	
	beforeAll(() => {
		const container = document.createElement("div");
		container.id = containerId;
		container.style.height = "200px";
		container.style.width = "200px";
		document.body.appendChild(container);
	});
	
	it("test setup", () => {
		const animProject = new AnimationProject(containerId);
		
		expect(animProject.getContainerId()).toEqual(containerId);
		expect(animProject.onionSkinFrame).not.toEqual(null);
		
		let frames = animProject.getFrames();
		expect(frames.length).toEqual(0);
		
		animProject.addNewFrame(false);
		frames = animProject.getFrames();
		expect(frames.length).toEqual(1);
		expect(frames[0].getLayers().length).toEqual(1);
		expect(frames[0].getLayers()[0].style.visibility).toEqual("hidden");
		expect(frames[0]).toEqual(animProject.getCurrFrame());
		expect(animProject.getCurrFrameIndex()).toEqual(0);
		
		animProject.addNewFrame(true);
		frames = animProject.getFrames();
		expect(frames.length).toEqual(2);
		expect(frames[1].getLayers()[0].style.visibility).toEqual("");
	});
	
	it("test delete frame", () => {
		const animProject = new AnimationProject(containerId);
		expect(animProject.deleteFrame(0)).toEqual(false);
		
		let frames = animProject.getFrames();
		expect(frames.length).toEqual(0);
		
		animProject.addNewFrame();
		frames = animProject.getFrames();
		expect(frames.length).toEqual(1);
		
		expect(animProject.deleteFrame(1)).toEqual(false);
		expect(animProject.deleteFrame(0)).toEqual(false); // should always have at least 1 frame
		
		animProject.addNewFrame();
		expect(animProject.deleteFrame(0)).toEqual(true);
		expect(animProject.getFrames().length).toEqual(1);
	});
	
	it("test resetProject", () => {
		const animProject = new AnimationProject(containerId);
		animProject.addNewFrame();
		animProject.addNewFrame();
		animProject.addNewFrame();
		animProject.getCurrFrame().setupNewLayer();
		animProject.getCurrFrame().setupNewLayer();
		animProject.resetProject();
		expect(animProject.getFrames().length).toEqual(1);
		expect(animProject.getCurrFrame().getLayers().length).toEqual(1);
		expect(animProject.getCurrFrame()).toEqual(animProject.getFrames()[0]);
	});
	
	it("test nextFrame", () => {
		const animProject = new AnimationProject(containerId);
		jest.spyOn(animProject, "updateOnionSkin").mockImplementation(() => {});
		
		expect(animProject.nextFrame()).toEqual(null);
		
		animProject.addNewFrame();
		expect(animProject.nextFrame()).toEqual(null);
		expect(animProject.getCurrFrameIndex()).toEqual(0);
		
		animProject.addNewFrame();
		expect(animProject.nextFrame()).toEqual(animProject.getCurrFrame());
		expect(animProject.getCurrFrameIndex()).toEqual(1);
	});
	
	it("test prevFrame", () => {
		const animProject = new AnimationProject(containerId);
		jest.spyOn(animProject, "updateOnionSkin").mockImplementation(() => {});
		
		expect(animProject.prevFrame()).toEqual(null);
		
		animProject.addNewFrame();
		animProject.addNewFrame();
		animProject.addNewFrame();
		expect(animProject.prevFrame()).toEqual(null); // still on first frame at this point
		
		animProject.nextFrame();
		expect(animProject.getCurrFrameIndex()).toEqual(1);
		
		expect(animProject.prevFrame()).toEqual(animProject.getCurrFrame());
		expect(animProject.prevFrame()).toEqual(null);
		expect(animProject.getCurrFrameIndex()).toEqual(0);
	});
	
});