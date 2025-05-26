import React from 'react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimationProject } from '../src/AnimationProject.js';
import { Toolbar } from '../src/Toolbar.js';
import { BrushManager } from '../src/BrushManager.js';
import { App, FrameCounterDisplay } from '../src/App.js';

describe('testing App component', () => {
    
  beforeAll(() => {
    jest.spyOn(AnimationProject.prototype, 'updateOnionSkin').mockImplementation(() => undefined);
    jest.spyOn(Toolbar.prototype, 'mergeFrameLayers').mockImplementation(() => {
      return {
        toDataURL: function(){
          return 'something';
        }
      };
    });
  });
    
  afterAll(() => {
    jest.restoreAllMocks();
  });
    
  it('testing FrameCounterDisplay rendering', () => {
    const frameNum = 0;
    const layerNum = 1;
        
    render(
      <FrameCounterDisplay 
        currFrame={frameNum}
        currLayer={layerNum}
      />
    );
        
    expect(screen.getByText(new RegExp(frameNum))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(layerNum))).toBeInTheDocument();
  });
    
  it('testing App rendering', () => {
    render(<App />);
        
    // we expect that the layer and frame should be shown as 1 initially somewhere on the page        
    const initialFrameNum = 1;
    const initialLayerNum = 1;
    expect(screen.getByText(new RegExp('frame: ' + initialFrameNum))).toBeInTheDocument();
    expect(screen.getByText(new RegExp('layer: ' + initialLayerNum))).toBeInTheDocument();
  });
    
  it('testing adding a layer', () => {
    const presentation = render(<App />);
        
    // add a new layer
    const leftClick = {button: 0};
    fireEvent.click(screen.getByRole('button', {name: 'add new layer after'}), leftClick);
        
    // check that we have 2 canvas elements with id like 'frame:_canvas:_'
    // this isn't advisable, but I'm not sure how else to make sure I have the right number
    // of canvases in the DOM.
    //screen.debug();
    expect(presentation.container.querySelectorAll('canvas[id^="frame"]').length).toEqual(2);
  });
    
  it('testing adding a frame', () => {
    const presentation = render(<App />);
        
    // add a new frame
    const leftClick = {button: 0};
    fireEvent.click(screen.getByRole('button', {name: 'add new layer after'}), leftClick);
        
    expect(presentation.container.querySelectorAll('canvas[id^="frame"]').length).toEqual(2);
  });
    
  it('making sure brush-related event listeners get removed from canvas when switching canvases', () => {
    const brushReset = jest.spyOn(BrushManager.prototype, 'resetBrush');
    const presentation = render(<App />);
        
    // add a new layer
    const leftClick = {button: 0};
    fireEvent.click(screen.getByRole('button', {name: 'add new layer after'}), leftClick);
        
    // move to the next layer
    fireEvent.click(screen.getByRole('heading', {name: '>'}), leftClick);
    expect(brushReset).toHaveBeenCalledTimes(1);
  });
    
  it('testing deleting the initial layer (no key down)', () => {
    const presentation = render(<App />);
        
    const leftClick = {button: 0};
        
    // delete the layer (nothing should happen since there's only one layer)
    const initialLayerNum = 1;
    fireEvent.click(screen.getByRole('button', {name: 'delete current layer'}), leftClick);
        
    expect(screen.getByText(new RegExp('layer: ' + initialLayerNum))).toBeInTheDocument();
    expect(presentation.container.querySelectorAll('canvas[id^="frame"]').length).toEqual(1);
  });
    
  it('testing adding a layer and then deleting (no key down)', () => {
    const presentation = render(<App />);
        
    // add a new layer
    const leftClick = {button: 0};
    fireEvent.click(screen.getByRole('button', {name: 'add new layer after'}), leftClick);
        
    // move to the next layer
    fireEvent.click(screen.getByRole('heading', {name: '>'}), leftClick);
    const nextLayerNum = 2;
    expect(screen.getByText(new RegExp('layer: ' + nextLayerNum))).toBeInTheDocument();
        
    // delete the layer
    const initialLayerNum = 1;
    fireEvent.click(screen.getByRole('button', {name: 'delete current layer'}), leftClick);
        
    expect(screen.getByText(new RegExp('layer: ' + initialLayerNum))).toBeInTheDocument();
        
    // confirm only 1 layer exists now
    expect(presentation.container.querySelectorAll('canvas[id^="frame"]').length).toEqual(1);
  });
    
  it('testing adding a frame and then deleting (no key down)', () => {
    const presentation = render(<App />);
        
    // add a new frame
    const leftClick = {button: 0};
    fireEvent.click(screen.getByRole('button', {name: 'add new frame'}), leftClick);
        
    // move to the next frame
    fireEvent.click(screen.getByRole('heading', {name: '▶'}), leftClick);
    const nextFrameNum = 2;
    expect(screen.getByText(new RegExp('frame: ' + nextFrameNum))).toBeInTheDocument();
        
    // delete the frame
    const firstFrameNum = 1;
    fireEvent.click(screen.getByRole('button', {name: 'delete current frame'}), leftClick);
    expect(screen.getByText(new RegExp('frame: ' + firstFrameNum))).toBeInTheDocument();
        
    // confirm only 1 frame exists now
    expect(presentation.container.querySelectorAll('canvas[id^="frame"]').length).toEqual(1);
  });
    
    
  /*
    // having difficulty currently with simulating keydown
    it("testing adding a frame and then deleting (key down)", () => {
        render(<App />);
        
        // add a new frame
        const leftClick = {button: 0};
        fireEvent.click(screen.getByRole('button', {name: 'add new frame'}), leftClick);        
        fireEvent.keyDown(document, {key: 'd', code: 'KeyD', charCode: 68});
        //fireEvent.keyDown(screen.getByText(new RegExp('frame:.*layer:.*')), {key: 'ArrowRight', code: 'ArrowRight', charCode: 39});
        //const rightArrowEvent = new KeyboardEvent('keypress', {'keyCode': 68}); // d key
        //document.dispatchEvent(rightArrowEvent);
        
        // move to the next frame
        //const currFrameNum = 2;
        //waitFor(() => expect(screen.getByText(new RegExp("frame: " + 1))).toBeInTheDocument());
        
        // delete the frame
        //const initialFrameNum = 1;
        //fireEvent.click(screen.getByRole('button', {name: 'delete current frame'}), leftClick);
        //waitFor(() => expect(screen.getByText(new RegExp("frame: " + initialFrameNum))).toBeInTheDocument());
    });
    */
    
});