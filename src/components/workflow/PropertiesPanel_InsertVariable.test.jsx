
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertiesPanel from './PropertiesPanel';

// Mock dependencies
vi.mock('../ui/Icon', () => ({
    default: ({ name, onClick }) => <div data-testid={`icon-${name}`} onClick={onClick} />
}));

vi.mock('../../services/NodeLibraryService', () => ({
    createDefaultParametersForNode: vi.fn(() => null),
    getNodeSpec: vi.fn(() => ({
        resolvedFields: {
            basic: [
                { 
                    name: 'Items Array', 
                    paramKey: 'array_field', 
                    type: 'array',
                    arrayParams: [
                        { name: 'itemName', type: 'string', label: 'Item Name' }
                    ]
                },
            ],
            advanced: []
        },
    })),
}));

vi.mock('./VariableSelector', () => ({
    default: ({ isOpen, onVariableSelected }) => (
        isOpen ? (
            <div data-testid="mock-variable-selector">
                <button onClick={() => onVariableSelected('some.variable')}>Select Variable</button>
            </div>
        ) : null
    )
}));

vi.mock('./OutputPanel', () => ({
    default: () => <div data-testid="mock-output-panel">Output Panel</div>
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('PropertiesPanel - Variable Insertion', () => {
    const mockNode = {
        id: 'node-1',
        type: 'test_inputs',
        title: 'Test Node',
        parameters: {
            array_field: {
                type: 'array',
                value: [
                    { itemName: 'Existing Item' }
                ]
            }
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

    it('inserts variable at cursor position in nested ArrayInput', async () => {
        render(<PropertiesPanel {...defaultProps} />);

        // 1. Find the array item input
        const input = screen.getByDisplayValue('Existing Item');
        expect(input).toBeInTheDocument();

        // 2. Set cursor position (Selection Start)
        // We simulate user interaction: focus, select, click
        fireEvent.focus(input);
        
        // Setting selectionStart/End directly on the element before firing events
        input.selectionStart = 9;
        input.selectionEnd = 9;
        
        // Fire select event which triggers handleInputContextChange
        fireEvent.select(input, { target: { value: 'Existing Item', selectionStart: 9, selectionEnd: 9 } });
        
        // Fire click as backup since code binds onClick too
        fireEvent.click(input, { target: { value: 'Existing Item', selectionStart: 9, selectionEnd: 9 } });

        // 3. Open Variable Selector
        // The button is in the top toolbar, title "Select Variable"
        // Note: Icon component is mocked, but the button has title attribute
        const selectorBtn = screen.getByTitle('Select Variable');
        fireEvent.click(selectorBtn);

        // 4. Select variable from mock selector
        const selectVarBtn = await screen.findByText('Select Variable');
        fireEvent.click(selectVarBtn);

        // 5. Verify onUpdate is called with the correct new value
        await waitFor(() => {
            expect(defaultProps.onUpdate).toHaveBeenCalled();
        });

        // Check the last call to onUpdate
        const calls = defaultProps.onUpdate.mock.calls;
        const lastCallArgs = calls[calls.length - 1][0];
        
        // Verify the structure: parameters -> array_field -> value -> [0] -> itemName
        // Using optional chaining to be safe, but expecting structure to exist
        const newItemName = lastCallArgs?.parameters?.array_field?.value?.[0]?.itemName;
        
        // The expected value is "Existing {{some.variable}}Item" (inserted at index 9, before "Item")
        expect(newItemName).toBe('Existing {{some.variable}}Item');
    });
});
