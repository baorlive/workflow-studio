import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkflowControls from './WorkflowControls';

// Mock Icon component
vi.mock('../ui/Icon', () => ({
    default: ({ name }) => <div data-testid={`icon-${name}`}>Icon-{name}</div>,
    Icon: ({ name }) => <div data-testid={`icon-${name}`}>Icon-{name}</div>
}));

describe('WorkflowControls', () => {
    const defaultProps = {
        zoom: 1,
        setZoom: vi.fn(),
        onFitView: vi.fn(),
        onAutoLayout: vi.fn(),
        isPanning: false,
        setIsPanning: vi.fn(),
        onUndo: vi.fn(),
        onRedo: vi.fn(),
        canUndo: true,
        canRedo: true
    };

    it('renders all control groups', () => {
        render(<WorkflowControls {...defaultProps} />);
        
        // Undo/Redo icons
        expect(screen.getByTestId('icon-rotateCcw')).toBeInTheDocument();
        expect(screen.getByTestId('icon-rotateCw')).toBeInTheDocument();
        
        // Pan/Layout/Fit icons
        expect(screen.getByTestId('icon-move')).toBeInTheDocument();
        expect(screen.getByTestId('icon-workflow')).toBeInTheDocument();
        expect(screen.getByTestId('icon-maximize')).toBeInTheDocument();
        
        // Zoom icons
        expect(screen.getByTestId('icon-minus')).toBeInTheDocument();
        expect(screen.getByTestId('icon-plus')).toBeInTheDocument();
    });

    it('calls undo/redo handlers', () => {
        render(<WorkflowControls {...defaultProps} />);
        
        fireEvent.click(screen.getByRole('button', { name: /Undo/i }));
        expect(defaultProps.onUndo).toHaveBeenCalled();
        
        fireEvent.click(screen.getByRole('button', { name: /Redo/i }));
        expect(defaultProps.onRedo).toHaveBeenCalled();
    });

    it('disables undo/redo buttons when not available', () => {
        render(<WorkflowControls {...defaultProps} canUndo={false} canRedo={false} />);
        
        const undoBtn = screen.getByRole('button', { name: /Undo/i });
        const redoBtn = screen.getByRole('button', { name: /Redo/i });
        
        expect(undoBtn).toBeDisabled();
        expect(redoBtn).toBeDisabled();
        expect(undoBtn).toHaveClass('cursor-not-allowed');
    });

    it('handles zoom controls', () => {
        render(<WorkflowControls {...defaultProps} />);
        
        fireEvent.click(screen.getByTitle('Zoom In'));
        // setZoom calls functional update, so we can't easily check the new value without more complex mocking,
        // but we can check if it was called.
        expect(defaultProps.setZoom).toHaveBeenCalled();
    });
});
