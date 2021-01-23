import React from 'react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresentationWrapper, FrameCounterDisplay } from '../components/PresentationWrapper.js';

describe("testing PresentationWrapper component", () => {
	
	it("testing FrameCounterDisplay rendering", () => {
		
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
	
	it("testing PresentationWrapper rendering", () => {
		render(<PresentationWrapper />);
		
		// we expect that the layer and frame should be shown as 1 initially somewhere on the page		
		const initialFrameNum = 1;
		const initialLayerNum = 1;
		expect(screen.getByText(new RegExp("frame: " + initialFrameNum))).toBeInTheDocument();
		expect(screen.getByText(new RegExp("layer: " + initialLayerNum))).toBeInTheDocument();
	});
	
	it("testing adding a layer and then deleting", () => {
		render(<PresentationWrapper />);
		
		// we expect that the layer and frame should be shown as 1 initially somewhere on the page		
		const initialFrameNum = 1;
		const initialLayerNum = 1;
		expect(screen.getByText(new RegExp("frame: " + initialFrameNum))).toBeInTheDocument();
		expect(screen.getByText(new RegExp("layer: " + initialLayerNum))).toBeInTheDocument();
		
		// add a new layer and go to it
		const leftClick = {button: 0};
		fireEvent.click(screen.getByRole('button', {name: 'add new layer after'}), leftClick);		
		//fireEvent.keyDown(document, {key: 'ArrowRight', code: 'ArrowRight', charCode: 39});
		const rightArrowEvent = new KeyboardEvent('keypress', {'keyCode': 39});
		document.dispatchEvent(rightArrowEvent);
		
		const currLayerNum = 2;
		waitFor(() => expect(screen.getByText(new RegExp("layer: " + currLayerNum))).toBeInTheDocument());
	});
	
	it("testing PresentationWrapper rendering", () => {
		render(<PresentationWrapper />);
		
		// we expect that the layer and frame should be shown as 1 initially somewhere on the page		
		const initialFrameNum = 1;
		const initialLayerNum = 1;
		expect(screen.getByText(new RegExp("frame: " + initialFrameNum))).toBeInTheDocument();
		expect(screen.getByText(new RegExp("layer: " + initialLayerNum))).toBeInTheDocument();
		
		// add a new layer and go to it
		//const rightClick = {button: 2};
		//fireEvent.click(screen.getByRole('button', {name: 'add new layer'}), rightClick);
	});
	
});