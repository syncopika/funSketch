import React from 'react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
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
		
		//screen.debug();
		expect(screen.getByText(new RegExp(frameNum))).toBeInTheDocument();
		expect(screen.getByText(new RegExp(layerNum))).toBeInTheDocument();
	});
	
	it("testing PresentationWrapper rendering", () => {
		render(<PresentationWrapper />);
		
		// we expect that the layer and frame should be shown as 1 initially somewhere on the page
		const initialFrameNum = 1;
		const initialLayerNum = 1;
		expect(screen.getByText(new RegExp(initialFrameNum))).toBeInTheDocument();
		expect(screen.getByText(new RegExp(initialLayerNum))).toBeInTheDocument();
		
		// add a new layer and go to it
		//const rightClick = {button: 2};
		//fireEvent.click(screen.getByRole('button', {name: 'add new layer'}), rightClick);
	});
	
});