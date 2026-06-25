import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BackgroundAnimation from '../BackgroundAnimation';

describe('BackgroundAnimation', () => {
  it('renders without crashing', () => {
    const { container } = render(<BackgroundAnimation />);
    expect(container.firstChild).toHaveClass('absolute');
    expect(container.firstChild).toHaveClass('pointer-events-none');
  });

  it('contains animated elements', () => {
    const { container } = render(<BackgroundAnimation />);
    const animatedElements = container.querySelectorAll('.animate-flow-beam');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});
