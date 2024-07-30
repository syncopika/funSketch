import 'jest-canvas-mock';
import { BrushManager } from '../src/BrushManager.js';
import { AnimationProject } from '../src/AnimationProject.js';

describe("test BrushManager class", () => {
    
  const containerId = "containerId";
    
  beforeAll(() => {
    const container = document.createElement("div");
    container.className = containerId;
    container.style.height = "200px";
    container.style.width = "200px";
    document.body.appendChild(container);
  });
    
  it("test BrushManager object creation", () => {
    const container = document.querySelector('.' + containerId);
    const animProj = new AnimationProject(container);
    const brush = new BrushManager(animProj);
    expect(brush.animationProject).toEqual(animProj);
  });
    
  it("test change brush size", () => {
    const container = document.querySelector('.' + containerId);
    const animProj = new AnimationProject(container);
    const brush = new BrushManager(animProj);
    expect(brush.currSize).toEqual(2);
    brush.changeBrushSize(10);
    expect(brush.currSize).toEqual(10);
  });
    
  it("test change brush type", () => {
    const container = document.querySelector('.' + containerId);
    const animProj = new AnimationProject(container);
    const brush = new BrushManager(animProj);
    expect(brush.selectedBrush).toEqual("default");
    brush.setBrushType("radial");
    expect(brush.selectedBrush).toEqual("radial");
  });
});