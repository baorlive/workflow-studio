
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertiesPanel from './PropertiesPanel';

// Mock Icon
vi.mock('../ui/Icon', () => ({
    default: () => <div data-testid="icon" />
}));

vi.mock('../../services/NodeLibraryService', () => ({
    createDefaultParametersForNode: vi.fn(() => null),
    getNodeSpec: vi.fn(() => ({
        resolvedFields: {
            basic: [
                { name: 'Foo', paramKey: 'foo', placeholder: 'Foo placeholder', type: 'string' },
            ],
            advanced: [
                { name: 'Bar', paramKey: 'bar', placeholder: 'Bar placeholder', type: 'string' },
            ],
        },
    })),
}));

describe('PropertiesPanel', () => {
    const mockNode = {
        id: 'node-1',
        type: 'action',
        title: 'Test Node',
        x: 100,
        y: 300,
        parameters: {
            foo: { value: 'val1', type: 'string', label: 'Foo' },
            bar: { value: 'val2', type: 'string', label: 'Bar' }
        }
    };

    const defaultProps = {
        node: mockNode,
        nodes: [],
        edges: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
        onClose: vi.fn(),
        onUpdate: vi.fn(),
        onUpdatePaths: vi.fn(),
        onDuplicate: vi.fn(),
        onDelete: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Panel Dimensions
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 320,
            height: 400,
            top: 0, left: 0, bottom: 400, right: 320,
            x: 0, y: 0,
            toJSON: () => { }
        }));
    });

    describe('Positioning', () => {
        it('Scenario 1: Defaults to Right', () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200 });
            Object.defineProperty(window, 'innerHeight', { value: 800 });

            const { container } = render(<PropertiesPanel {...defaultProps} />);
            const panel = container.children[1];
            expect(panel.style.left).toBe('366px');
        });
    });

    describe('Basic/Advanced Toggle', () => {
        it('shows only basic fields by default', () => {
            render(<PropertiesPanel {...defaultProps} />);

            // Foo should be visible
            expect(screen.getByText('Foo')).toBeInTheDocument();
            // Bar should NOT be visible
            expect(screen.queryByText('Bar')).not.toBeInTheDocument();
        });

        it('shows advanced fields when toggled', () => {
            render(<PropertiesPanel {...defaultProps} />);

            // Click Advanced
            const advancedBtn = screen.getByText('Advanced');
            fireEvent.click(advancedBtn);

            // Advanced field should be visible, Basic should NOT be visible
            expect(screen.queryByText('Foo')).not.toBeInTheDocument();
            expect(screen.getByText('Bar')).toBeInTheDocument();
        });

        it('switches back to basic correctly', () => {
            render(<PropertiesPanel {...defaultProps} />);

            // Toggle to Advanced
            fireEvent.click(screen.getByText('Advanced'));
            expect(screen.getByText('Bar')).toBeInTheDocument();

            // Toggle back to Basic
            fireEvent.click(screen.getByText('Basic'));
            expect(screen.getByText('Foo')).toBeInTheDocument();
            expect(screen.queryByText('Bar')).not.toBeInTheDocument();
        });
    });
});
