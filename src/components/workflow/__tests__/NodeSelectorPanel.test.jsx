import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NodeSelectorPanel from '../NodeSelectorPanel';
import { getNodeLibrary } from '../../../services/NodeLibraryService';

// Mock dependencies
vi.mock('../../ui/Icon', () => ({
    default: ({ name }) => <span data-testid={`icon-${name}`}>{name}</span>
}));

vi.mock('../../../services/NodeLibraryService', () => ({
    getNodeLibrary: vi.fn(),
}));

describe('NodeSelectorPanel', () => {
    const mockOnClose = vi.fn();
    const mockOnDragStart = vi.fn();

    const mockLibrary = {
        categories: [
            {
                id: 'cat_social',
                title: 'Social & Messaging',
                icon: 'messageSquare',
                nodes: [
                    { id: 'discord', title: 'Discord', type: 'action', summary: 'Discord node' },
                    { id: 'slack', title: 'Slack', type: 'trigger', summary: 'Slack node' }
                ]
            },
            {
                id: 'cat_google',
                title: 'Google',
                icon: 'sparkles',
                nodes: [
                    { id: 'gmail', title: 'Gmail', type: 'action', summary: 'Gmail node' }
                ]
            },
            {
                id: 'cat_other',
                title: 'Uncategorised',
                icon: 'box',
                nodes: [
                    { id: 'random', title: 'Random Node', type: 'action', summary: 'Random node' }
                ]
            }
        ]
    };

    beforeEach(() => {
        getNodeLibrary.mockReturnValue(mockLibrary);
    });

    it('renders tabs correctly based on categories', () => {
        render(<NodeSelectorPanel isOpen={true} onClose={mockOnClose} onDragStart={mockOnDragStart} />);

        // Should show 'All' tab
        expect(screen.getByTestId('tab-all')).toBeInTheDocument();
        
        // Should show 'Social' tab (mapped from Social & Messaging)
        expect(screen.getByTestId('tab-social')).toBeInTheDocument();
        
        // Should show 'Google' tab
        expect(screen.getByTestId('tab-google')).toBeInTheDocument();
        
        // Should show 'Others' tab (mapped from Uncategorised)
        expect(screen.getByTestId('tab-others')).toBeInTheDocument();

        // Should NOT show the removed assistant-provider category
        expect(screen.queryByTestId('tab-ai')).not.toBeInTheDocument();
    });

    it('filters nodes when clicking tabs', () => {
        render(<NodeSelectorPanel isOpen={true} onClose={mockOnClose} onDragStart={mockOnDragStart} />);

        // Check tabs exist
        const socialTab = screen.getByTestId('tab-social');
        
        // Default is 'All', should show all nodes from all categories
        expect(screen.getAllByText('Discord').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Gmail').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Random Node').length).toBeGreaterThan(0);

        // Click 'Social' tab
        fireEvent.click(socialTab);
        
        // Should show Social nodes
        expect(screen.getAllByText('Discord').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Slack').length).toBeGreaterThan(0);
        
        // Should NOT show nodes from other categories
        expect(screen.queryByText('Gmail')).not.toBeInTheDocument();
        expect(screen.queryByText('Random Node')).not.toBeInTheDocument();
    });

    it('search works across tabs', () => {
        render(<NodeSelectorPanel isOpen={true} onClose={mockOnClose} onDragStart={mockOnDragStart} />);

        const searchInput = screen.getByPlaceholderText('Search nodes by name or ID...');
        fireEvent.change(searchInput, { target: { value: 'Gmail' } });

        // 'All' tab should still be active and show Gmail
        expect(screen.getAllByText('Gmail').length).toBeGreaterThan(0);
        
        // Other nodes should be filtered out
        expect(screen.queryByText('Discord')).not.toBeInTheDocument();
        expect(screen.queryByText('Random Node')).not.toBeInTheDocument();
    });
});
