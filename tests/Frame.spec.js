import 'jest-canvas-mock';
import { Frame } from '../src/utils/AnimationProject.js';

describe("test Frame class", () => {
    
    const containerId = "containerId";
    
    beforeAll(() => {
        const container = document.createElement("div");
        container.className = containerId;
        container.style.height = "200px";
        container.style.width = "200px";
        document.body.appendChild(container);
    });
    
    it("test frame creation and layer setup", () => {
        const container = document.querySelector('.' + containerId);
        const frame1 = new Frame(container, 2);
        
        // check metadata
        const frame1data = frame1.getMetadata();
        expect(frame1data.currentIndex).toBe(0);
        expect(frame1data.number).toBe(2);
        
        expect(frame1.getContainer()).toEqual(container);
        
        // add a new layer
        frame1.setupNewLayer();
        expect(frame1.count).toEqual(1);
        
        let currCanvas = frame1.getCurrCanvas();
        expect(currCanvas.style.opacity).toEqual("0.97");
        expect(currCanvas.style.zIndex).toEqual("1");
        expect(currCanvas.style.cursor).toEqual("");
        expect(currCanvas.style.touchAction).toEqual("none");
        
        expect(currCanvas.parentNode).toEqual(container);
        
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
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
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
            expect(layer.style.cursor).toEqual("");                
        }
    });
    
    it("test frame setToLayer", () => {
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
        frame.setupNewLayer();
        frame.setupNewLayer();
        frame.setupNewLayer();
        expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[0]);
        
        // no onion skin first
        frame.setToLayer(1, false);
        let currCanvas = frame.getCurrCanvas();
        expect(currCanvas).toEqual(frame.getLayers()[1]);
        expect(currCanvas.style.opacity).toEqual("0.97");
        expect(currCanvas.style.zIndex).toEqual("1");
        
        // go to next layer with onion skin
        frame.setToLayer(2, true);
        currCanvas = frame.getCurrCanvas();
        expect(currCanvas).toEqual(frame.getLayers()[2]);
        expect(currCanvas.style.opacity).toEqual("0.97");
        expect(currCanvas.style.zIndex).toEqual("1");
        
        // make sure onion skin worked
        let prevCanvas = frame.getLayers()[1];
        expect(prevCanvas.style.opacity).toEqual("0.92");
        expect(prevCanvas.style.zIndex).toEqual("0");
    });
    
    it("test getLayers", () => {
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
        expect(frame.getLayers().length).toEqual(0);
        frame.setupNewLayer();
        expect(frame.getLayers().length).toEqual(1);
    });
    
    it("test setLayers", () => {
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
        frame.setupNewLayer();
        frame.setupNewLayer();
        expect(frame.getLayers().length).toEqual(2);
        
        const layer2 = frame.getLayers()[1];
        frame.setLayers([layer2]);
        expect(frame.getLayers().length).toEqual(1);
        expect(frame.getLayers()[0]).toEqual(layer2);
    });
    
    it("test setCurrIndex", () => {
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
        frame.setupNewLayer();
        frame.setupNewLayer();
        expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[0]);
        frame.setCurrIndex(1);
        expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[1]);
        frame.setCurrIndex(100); // should not change anything
        expect(frame.getCurrCanvas()).toEqual(frame.getLayers()[1]);
    });
    
    it("test nextLayer", () => {
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
        frame.setupNewLayer();
        expect(frame.nextLayer()).toEqual(false);
        
        frame.setupNewLayer();
        expect(frame.nextLayer()).toEqual(true);
        
        // check onion skin functionality
        expect(frame.getLayers()[0].style.opacity).toEqual("0.92");
        expect(frame.getLayers()[1].style.opacity).toEqual("0.97");
    });
    
    it("test prevLayer", () => {
        const container = document.querySelector('.' + containerId);
        const frame = new Frame(container, 0);
        frame.setupNewLayer();
        expect(frame.prevLayer()).toEqual(false);
        
        frame.setupNewLayer();
        frame.nextLayer();
        expect(frame.prevLayer()).toEqual(true);
        
        // check onion skin functionality
        expect(frame.getLayers()[0].style.opacity).toEqual("0.97");
        expect(frame.getLayers()[1].style.opacity).toEqual("0");
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