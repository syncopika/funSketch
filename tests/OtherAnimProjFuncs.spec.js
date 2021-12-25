// test other util functions in animationproject

import 'jest-canvas-mock';
import { createOnionSkinFrame, setCanvas } from '../src/utils/AnimationProject.js';

describe("test other utility functions in AnimationProject", () => {
    
    const containerId = "containerId";
    
    beforeAll(() => {
        const container = document.createElement("div");
        container.className = containerId;
        container.style.height = "200px";
        container.style.width = "200px";
        document.body.appendChild(container);
    });

    it("test setCanvas", () => {
        const canvas = document.createElement('canvas');
        const prefill = true;
        setCanvas(prefill, canvas);
        
        const expectedParams = {
            position: "absolute",
            border: "1px solid #000",
            zIndex: "0",
            opacity: "0",
        };
        
        for(let param in expectedParams){
            expect(canvas.style[param]).toEqual(expectedParams[param]);
        }
    });
    
    it("test createOnionSkinFrame", () => {
        const container = document.querySelector('.' + containerId);
        const oskinFrame = createOnionSkinFrame(container);
        expect(oskinFrame.id).toEqual("onionSkinCanvas");
        expect(oskinFrame.parentNode).toEqual(container);
        expect(oskinFrame.style.opacity).toEqual("0.97");
    });
    
});