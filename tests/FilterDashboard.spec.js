import React from 'react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterDashboard } from '../src/components/FilterDashboard';

describe("testing FilterDashboard component", () => {
    
  beforeAll(() => {
  });
    
  afterAll(() => {
  });
    
  it("is testing FilterDashboard", () => {
    render(
      <FilterDashboard
        filterManager={null}
      />
    );
    expect(screen.queryByText("apply filter")).toBeInTheDocument();
  });
    
});