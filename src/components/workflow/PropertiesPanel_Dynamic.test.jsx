
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PropertiesPanel from './PropertiesPanel';
import { nodesApi } from '../../services/NodeApiService';
import * as NodeLibraryService from '../../services/NodeLibraryService';

// Mock dependencies
vi.mock('../../services/NodeApiService');
vi.mock('../ui/Icon', () => ({
  default: ({ name }) => <div data-testid={`icon-${name}`}>{name}</div>
}));
vi.mock('./OutputPanel', () => ({
  default: () => <div data-testid="output-panel">Output Panel</div>
}));

// Mock getNodeSpec to return our test node schema
vi.mock('../../services/NodeLibraryService', () => {
  return {
    getNodeSpec: vi.fn(),
    createDefaultParametersForNode: vi.fn(),
  };
});

describe('PropertiesPanel Dynamic Loading', () => {
  const mockNode = {
    id: 'node_1',
    type: 'test_dynamic_node',
    parameters: {
      table_name: { value: '', type: 'select' }
    },
    data: {}
  };

  const mockResolvedFields = {
    basic: [
      {
        paramKey: 'table_name',
        name: 'Select Table',
        type: 'select',
        options: ['Users', 'Products'],
        reloadParams: true,
        loadMethod: 'getColumns'
      }
    ],
    advanced: []
  };

  const mockOnUpdate = vi.fn();
  const mockOnClose = vi.fn();
  const mockPan = { x: 0, y: 0 };
  const mockNodes = [];

  beforeEach(() => {
    vi.clearAllMocks();
    NodeLibraryService.getNodeSpec.mockReturnValue({
      resolvedFields: mockResolvedFields
    });
    NodeLibraryService.createDefaultParametersForNode.mockReturnValue({
      table_name: { value: '', type: 'select' }
    });
  });

  it('triggers dynamic parameter loading when reloadParams field changes', async () => {
    // Mock API response
    nodesApi.loadMethodNode.mockResolvedValue([
      { name: 'username', type: 'string', label: 'Username' },
      { name: 'email', type: 'string', label: 'Email' }
    ]);

    // Re-render with the new node state
    const { rerender } = render(
      <PropertiesPanel
        node={mockNode}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );
    
    // ... (rest of the test logic from previous block)
    // Actually I need to move rerender up or use the result from first render.


    // Find the select input
    const select = screen.getByRole('combobox');
    
    // Change value
    await act(async () => {
      fireEvent.change(select, { target: { value: 'Users' } });
    });

    // Check if API was called
    expect(nodesApi.loadMethodNode).toHaveBeenCalledWith(
      'test_dynamic_node',
      expect.objectContaining({
        loadMethod: 'getColumns',
        parameters: expect.objectContaining({
            table_name: expect.objectContaining({ value: 'Users' })
        })
      })
    );

    // Check if onUpdate was called with dynamicFields
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          dynamicFields: [
            { name: 'username', type: 'string', label: 'Username' },
            { name: 'email', type: 'string', label: 'Email' }
          ]
        })
      );
    });
  });

  it('renders dynamic fields when present in node', () => {
    const nodeWithDynamicFields = {
      ...mockNode,
      dynamicFields: [
        { name: 'username', type: 'string', label: 'Username' }
      ],
      parameters: {
        table_name: { value: 'Users', type: 'select' },
        username: { value: 'john_doe', type: 'string' }
      }
    };

    render(
      <PropertiesPanel
        node={nodeWithDynamicFields}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Check if dynamic field is rendered
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john_doe')).toBeInTheDocument();
  });

  it('renders dynamic array with dynamic schema', async () => {
    // Mock API to return an array field with specific schema
    nodesApi.loadMethodNode.mockResolvedValue([
      {
        name: 'dynamic_rows',
        type: 'array',
        label: 'Dynamic Rows',
        arrayParams: [
          { name: 'col_a', type: 'string', label: 'Column A' },
          { name: 'col_b', type: 'number', label: 'Column B' }
        ]
      }
    ]);

    const { rerender } = render(
      <PropertiesPanel
        node={mockNode}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'Products' } });
    });

    // Check if onUpdate was called
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          dynamicFields: expect.any(Array)
        })
      );
    });

    // Create node with dynamic fields populated
    const nodeWithDynamicArray = {
      ...mockNode,
      dynamicFields: [
        {
          name: 'dynamic_rows',
          type: 'array',
          label: 'Dynamic Rows',
          arrayParams: [
            { name: 'col_a', type: 'string', label: 'Column A' },
            { name: 'col_b', type: 'number', label: 'Column B' }
          ]
        }
      ],
      parameters: {
        table_name: { value: 'Products', type: 'select' },
        dynamic_rows: { value: [{ col_a: 'Val A', col_b: 123 }], type: 'array' }
      }
    };

    // Rerender
    rerender(
      <PropertiesPanel
        node={nodeWithDynamicArray}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Check if ArrayInput rendered the label
    const labels = screen.getAllByText('Dynamic Rows');
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toBeInTheDocument();
    
    // Check if array items are rendered (Column A, Column B labels)
    // ArrayInput renders field labels for each item
    // "Column A" might be rendered multiple times if multiple items, but here 1 item.
    // However, ArrayInput renders labels for fields.
    // Let's check for "Column A" text.
    expect(screen.getByText('Column A')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByDisplayValue('Val A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });

  it('overrides static array field with dynamic schema', async () => {
    // 1. Setup static schema with an empty 'rows' array
    NodeLibraryService.getNodeSpec.mockReturnValue({
      resolvedFields: {
        basic: [
            {
                paramKey: 'table_name',
                name: 'Select Table',
                type: 'select',
                options: ['Users', 'Products'],
                reloadParams: true,
                loadMethod: 'getColumns'
            },
            {
                paramKey: 'rows',
                name: 'Rows',
                type: 'array',
                arrayParams: [] // Empty static schema
            }
        ],
        advanced: []
      }
    });

    // 2. Mock API to return 'rows' with populated schema
    nodesApi.loadMethodNode.mockResolvedValue([
      {
        name: 'rows',
        type: 'array',
        label: 'Dynamic Rows', // Label change to verify override
        arrayParams: [
          { name: 'col_a', type: 'string', label: 'Column A' }
        ]
      }
    ]);

    const { rerender } = render(
      <PropertiesPanel
        node={mockNode}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // Initial check: Should show "Rows" (static label) and NO "Column A"
    const rowsLabels = screen.getAllByText('Rows');
    expect(rowsLabels.length).toBeGreaterThan(0);
    expect(screen.queryByText('Column A')).not.toBeInTheDocument();

    // 3. Trigger load
    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'Products' } });
    });

    // 4. Check onUpdate
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          dynamicFields: expect.arrayContaining([
            expect.objectContaining({ name: 'rows', label: 'Dynamic Rows' })
          ])
        })
      );
    });

    // 5. Rerender with dynamic fields
    const nodeWithOverride = {
      ...mockNode,
      dynamicFields: [
        {
          name: 'rows',
          type: 'array',
          label: 'Dynamic Rows',
          arrayParams: [
            { name: 'col_a', type: 'string', label: 'Column A' }
          ]
        }
      ],
      parameters: {
        table_name: { value: 'Products', type: 'select' },
        rows: { value: [{ col_a: 'Test' }], type: 'array' }
      }
    };

    rerender(
      <PropertiesPanel
        node={nodeWithOverride}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // 6. Verify override: Should show "Dynamic Rows" (dynamic label) and "Column A"
    // The static "Rows" label should be GONE (replaced by "Dynamic Rows")
    // Note: If both exist, getAllByText would return multiple.
    // If we filtered correctly, only "Dynamic Rows" should be present for this field.
    
    const dynamicLabels = screen.getAllByText('Dynamic Rows');
    expect(dynamicLabels.length).toBeGreaterThan(0);
    expect(screen.queryByText('Rows')).not.toBeInTheDocument(); // Assuming 'Rows' was the label for the static field
    expect(screen.getByText('Column A')).toBeInTheDocument();
  });

  it('handles file upload in dynamic array (Orders scenario)', async () => {
    // 1. Setup mock API for Orders table
    nodesApi.loadMethodNode.mockResolvedValue([
      {
        name: 'rows',
        type: 'array',
        label: 'Order Rows',
        description: 'Add orders dynamically',
        arrayParams: [
          { name: 'order_id', type: 'string', label: 'Order ID' },
          { name: 'invoice', type: 'file', label: 'Invoice File' }
        ]
      }
    ]);

    const { rerender } = render(
      <PropertiesPanel
        node={mockNode}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // 2. Select 'Orders'
    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'Orders' } });
    });

    // 3. Wait for update with dynamic fields
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          dynamicFields: expect.arrayContaining([
            expect.objectContaining({ name: 'rows', label: 'Order Rows' })
          ])
        })
      );
    });

    // 4. Rerender with dynamic fields and one item
    const nodeWithOrders = {
      ...mockNode,
      dynamicFields: [
        {
          name: 'rows',
          type: 'array',
          label: 'Order Rows',
          arrayParams: [
            { name: 'order_id', type: 'string', label: 'Order ID' },
            { name: 'invoice', type: 'file', label: 'Invoice File' }
          ]
        }
      ],
      parameters: {
        table_name: { value: 'Orders', type: 'select' },
        rows: { value: [{ order_id: 'ORD-123' }], type: 'array' }
      }
    };

    rerender(
      <PropertiesPanel
        node={nodeWithOrders}
        nodes={mockNodes}
        pan={mockPan}
        onUpdate={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    // 5. Verify fields exist
    const orderRowsLabels = screen.getAllByText('Order Rows');
    expect(orderRowsLabels.length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('ORD-123')).toBeInTheDocument();
    
    // 6. Verify File Input exists
    expect(screen.getByText('Invoice File')).toBeInTheDocument();
    // FileInput usually renders a "Choose a file..." text or similar if empty
    expect(screen.getByText(/Choose a file/i)).toBeInTheDocument();
  });
});
