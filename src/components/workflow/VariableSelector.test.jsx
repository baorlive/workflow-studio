import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import VariableSelector from './VariableSelector';

// Mock react-json-view
vi.mock('react-json-view', () => {
    return {
        default: ({ src, enableClipboard }) => {
            return (
                <div data-testid="json-view">
                    <button
                        data-testid="copy-btn-leaf"
                        onClick={() => {
                            // Simulate copying a leaf node "b": 1 inside "a"
                            enableClipboard({
                                src: 1,
                                namespace: ['a'],
                                name: 'b'
                            });
                        }}
                    >
                        Copy Leaf
                    </button>
                    <button
                        data-testid="copy-btn-root"
                        onClick={() => {
                            // Simulate copying the root object
                            enableClipboard({
                                src: { a: { b: 1 } },
                                namespace: [],
                                name: false
                            });
                        }}
                    >
                        Copy Root
                    </button>
                </div>
            );
        }
    };
});

// Mock Icon
vi.mock('../ui/Icon', () => ({
    default: ({ name, onClick, className }) => <span data-testid={`icon-${name}`} onClick={onClick} className={className}>{name}</span>
}));

describe('VariableSelector', () => {
    const mockNodes = [
        {
            id: 'node_1',
            data: {
                title: 'Test Node',
                outputResponses: {
                    output: {
                        a: {
                            b: 1
                        }
                    }
                }
            }
        },
        {
            id: 'current_node',
            data: { title: 'Current Node' }
        }
    ];

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        nodes: mockNodes,
        currentNodeId: 'current_node',
        onVariableSelected: vi.fn()
    };

    it('renders available nodes', () => {
        render(<VariableSelector {...defaultProps} />);
        expect(screen.getByText('Test Node')).toBeInTheDocument();
        // Current node should be filtered out
        expect(screen.queryByText('Current Node')).not.toBeInTheDocument();
    });

    it('expands node and shows JSON view', () => {
        render(<VariableSelector {...defaultProps} />);
        
        // Find the node button and click to expand
        const nodeButton = screen.getByText('Test Node').closest('button');
        fireEvent.click(nodeButton);
        
        // JSON view should be visible
        expect(screen.getByTestId('json-view')).toBeInTheDocument();
    });

    it('selects variable correctly for leaf node', () => {
        render(<VariableSelector {...defaultProps} />);
        
        // Expand node
        fireEvent.click(screen.getByText('Test Node').closest('button'));
        
        // Click copy button for leaf
        fireEvent.click(screen.getByTestId('copy-btn-leaf'));
        
        // Check if onVariableSelected was called with correct path
        // Expectation: node_1.a.b
        expect(defaultProps.onVariableSelected).toHaveBeenCalledWith('node_1.a.b');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('selects variable correctly for root node', () => {
        render(<VariableSelector {...defaultProps} />);
        
        // Expand node
        fireEvent.click(screen.getByText('Test Node').closest('button'));
        
        // Click copy button for root
        fireEvent.click(screen.getByTestId('copy-btn-root'));
        
        // Check if onVariableSelected was called with correct path
        // Expectation: node_1 (no trailing dot)
        expect(defaultProps.onVariableSelected).toHaveBeenCalledWith('node_1');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
