import React from 'react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LayerOrder } from '../src/components/LayerOrder';

describe('testing LayerOrder component', () => {
    
  beforeAll(() => {
  });
    
  afterAll(() => {
  });
    
  it('is testing LayerOrder no show', () => {
    const { container } = render(
      <LayerOrder
        changingLayerOrder={false}
        updateParentStateFunction={() => {}}
        layers={[]}
      />
    );
    expect(container.innerHTML).toBe('<div></div>');
    expect(screen.queryByText('layer order')).not.toBeInTheDocument();
  });
    
  it('is testing LayerOrder show', () => {
    const { container } = render(
      <LayerOrder
        changingLayerOrder={true}
        updateParentStateFunction={() => {}}
        layers={[]}
      />
    );
    expect(container.innerHTML).not.toBe('<div></div>');
    expect(screen.getByText(new RegExp('layer order'))).toBeInTheDocument();        
  });
    
});