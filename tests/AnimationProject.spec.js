import 'jest-canvas-mock';
import { AnimationProject, Frame } from '../components/AnimationProject.js';

describe("test AnimationProject classes", () => {
	
	const containerId = "containerId";
	
	beforeAll(() => {
		const container = document.createElement("div");
		container.id = containerId;
		container.style.height = "200px";
		container.style.width = "200px";
		document.body.appendChild(container);
	});
	
	describe("test Frame class", () => {
		it("test frame creation and layer setup", () => {
			const frame1 = new Frame(containerId, 2);
			
			// check metadata
			const frame1data = frame1.getMetadata();
			expect(frame1data.currentIndex).toBe(0);
			expect(frame1data.number).toBe(2);
			expect(frame1data.containerId).toBe(containerId);
			expect(frame1.getContainerId()).toBe(containerId);
			
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
			const frame = new Frame(containerId, 0);
			frame.setupNewLayer();
			frame.setupNewLayer();
			frame.setupNewLayer();
			expect(frame.getCurrCanvas()).toEqual(frame.canvasList[0]);
			
			// no onion skin first
			frame.setToLayer(1, false);
			let currCanvas = frame.getCurrCanvas();
			expect(currCanvas).toEqual(frame.canvasList[1]);
			expect(currCanvas.style.opacity).toEqual("0.97");
			expect(currCanvas.style.zIndex).toEqual("1");
			
			// go to next layer with onion skin
			frame.setToLayer(2, true);
			currCanvas = frame.getCurrCanvas();
			expect(currCanvas).toEqual(frame.canvasList[2]);
			expect(currCanvas.style.opacity).toEqual("0.97");
			expect(currCanvas.style.zIndex).toEqual("1");
			
			// make sure onion skin worked
			let prevCanvas = frame.canvasList[1];
			expect(prevCanvas.style.opacity).toEqual("0.92");
			expect(prevCanvas.style.zIndex).toEqual("0");
		});
		
		it("test getLayers", () => {
			const frame = new Frame(containerId, 0);
			expect(frame.getLayers().length).toEqual(0);
			frame.setupNewLayer();
			expect(frame.getLayers().length).toEqual(1);
		});
		
		it("test setLayers", () => {
			const frame = new Frame(containerId, 0);
			frame.setupNewLayer();
			frame.setupNewLayer();
			expect(frame.getLayers().length).toEqual(2);
			
			const layer2 = frame.getLayers()[1];
			frame.setLayers([layer2]);
			expect(frame.getLayers().length).toEqual(1);
			expect(frame.getLayers()[0]).toEqual(layer2);
		});
		
		it("test setCurrIndex", () => {
			const frame = new Frame(containerId, 0);
			frame.setupNewLayer();
			frame.setupNewLayer();
			expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[0]);
			frame.setCurrIndex(1);
			expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[1]);
			frame.setCurrIndex(100); // should not change anything
			expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[1]);
		});
		
		/*
		it("test frame copyCanvas", () => {
			// TODO: figure out how to get this working? 
			// putImageData is difficult to have: https://github.com/hustcc/jest-canvas-mock/issues/60
			// manually set width and height canvas values
			const width = 10;
			const height = 10;
			
			const frame = new Frame(containerId, 0);
			frame.setupNewLayer();
		
			const currCanvas = frame.getCurrCanvas();
			currCanvas.height = height;
			currCanvas.width = width;
			frame.width = width;
			frame.height = height;
			
			// 'taint' the current canvas by coloring 1 pixel (4 elements in image data, which represent RGBA)
			const currCanvasCtx = frame.getCurrCanvas().getContext("2d");
			const currCanvasData = currCanvasCtx.getImageData(0,0,10,10);
			for(let i = 0; i < 4; i++){
				currCanvasData.data[i] = 100;
			}
			currCanvasCtx.putImageData(currCanvasData, 0, 0);
			
			// make a copy
			frame.copyCanvas();
			
			// verify
			expect(frame.canvasList.length).toEqual(2);
			expect(frame.canvasList[0]).toEqual(frame.getCurrCanvas());
			expect(frame.canvasList[1].style.opacity).toEqual("0.97");
			let copyCtx = frame.canvasList[1].getContext("2d");
			let copyCtxData = copyCtx.getImageData(0,0,10,10).data;
			for(let i = 0; i < 4; i++){
				expect(copyCtxData[i]).toEqual(100);
			}
		});*/
		
		/*
		it("test frame clearCurrentLayer", () => {
			// TODO: figure out how to get this working?
			// relies on putImageData
			const frame = new Frame(containerId, 0);
			frame.setupNewLayer();
		});*/
	});
	
	describe("test AnimationProject class", () => {
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
	
});