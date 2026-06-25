import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NodeSelectorPanel from './NodeSelectorPanel';

// Mock Icon component
vi.mock('../ui/Icon', () => ({
    default: ({ name }) => <div data-testid={`icon-${name}`}>Icon-{name}</div>,
    Icon: ({ name }) => <div data-testid={`icon-${name}`}>Icon-{name}</div>
}));

vi.mock('../../services/NodeLibraryService', () => ({
    getNodeLibrary: () => ({
        nodesById: {},
        categories: [
            {
                id: 'process',
                title: 'Process',
                icon: 'box',
                nodes: [{ id: 'action', title: 'Action', type: 'action', summary: 'Perform a generic action' }],
            },
            {
                id: 'logic',
                title: 'Logic & Flow',
                icon: 'gitBranch',
                nodes: [
                    {
                        id: 'if_else',
                        title: 'If / Else',
                        type: 'conditional',
                        summary: 'Branch based on conditions',
                    },
                ],
            },
        ],
    }),
}));

describe('NodeSelectorPanel', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onDragStart: vi.fn()
    };

    it('renders All tab with nodes initially', () => {
        render(<NodeSelectorPanel {...defaultProps} />);

        expect(screen.getByText('Node Library')).toBeInTheDocument();
        // All tab lists nodes directly
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('If / Else')).toBeInTheDocument();
    });

    it('lists nodes in All tab', () => {
        render(<NodeSelectorPanel {...defaultProps} />);

        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Perform a generic action')).toBeInTheDocument();
    });

    it('searches nodes across categories', () => {
        render(<NodeSelectorPanel {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Search nodes by name or ID...');
        fireEvent.change(searchInput, { target: { value: 'if' } });

        expect(screen.getByText('If / Else')).toBeInTheDocument();
        expect(screen.queryByText('Action')).not.toBeInTheDocument();
    });

    it('calls onDragStart when dragging an item', () => {
        render(<NodeSelectorPanel {...defaultProps} />);

        const actionNode = screen.getByText('Action').closest('div[draggable="true"]');
        
        // Mock drag event
        const dragEvent = { dataTransfer: { setData: vi.fn(), effectAllowed: '' } };
        fireEvent.dragStart(actionNode, dragEvent);
        
        expect(defaultProps.onDragStart).toHaveBeenCalled();
        // Check if called with correct item structure (partial match)
        expect(defaultProps.onDragStart).toHaveBeenCalledWith(
            expect.anything(), 
            expect.objectContaining({ title: 'Action', type: 'action' })
        );
    });

    it('resets state when closed and reopened', () => {
        const { rerender } = render(<NodeSelectorPanel {...defaultProps} />);
        
        rerender(<NodeSelectorPanel {...defaultProps} isOpen={false} />);
        
        rerender(<NodeSelectorPanel {...defaultProps} isOpen={true} />);

        // Resets to All tab and empty search
        expect(screen.getByTestId('tab-all')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
    });
});
