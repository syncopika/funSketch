import React from 'react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColorPicker } from '../src/components/ColorPicker';
import { AnimationProject } from '../src/AnimationProject.js';
import { BrushManager } from '../src/BrushManager.js';

describe("testing ColorPicker component", () => {
    
  beforeAll(() => {
    const container = document.createElement("div");
    container.className = "canvasArea";
    container.style.height = "200px";
    container.style.width = "200px";
    document.body.appendChild(container);
  });
    
  afterAll(() => {
  });
    
  it("is testing ColorPicker with no brush", () => {
    render(
      <ColorPicker
        brush={null}
      />
    );
    expect(screen.queryByText("save color to palette")).toBeInTheDocument();
    expect(screen.queryByText("pick a color!")).toBeInTheDocument();
    expect(document.getElementById("colorWheel")).toBeNull();
  });
    
  it("is testing ColorPicker with brush", () => {
    const animationProj = new AnimationProject(document.querySelector('.canvasArea'));
    const newBrush = new BrushManager(animationProj);  
        
    render(
      <ColorPicker
        brush={newBrush}
      />
    );
    expect(screen.queryByText("save color to palette")).toBeInTheDocument();
    expect(document.getElementById("colorWheel")).not.toBeNull();
        
    // TODO: test saving color to palette
  });
    
});