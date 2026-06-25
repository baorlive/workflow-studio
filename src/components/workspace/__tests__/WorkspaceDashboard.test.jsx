import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkspaceDashboard from '../WorkspaceDashboard';

// Mock child components
// Path relative to THIS test file: ../../ui/Icon
vi.mock('../../ui/Icon', () => ({
  default: ({ name, onClick }) => <span data-testid={`icon-${name}`} onClick={onClick}>{name}</span>,
}));

vi.mock('../../ui/BackgroundAnimation', () => ({
  default: () => <div data-testid="background-animation" />,
}));

vi.mock('../FilterDropdown', () => ({
  default: ({ label, value, onChange, options }) => (
    <div data-testid={`filter-${label || 'sort'}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

vi.mock('../WorkflowCard', () => ({
  default: ({ workflow }) => <div data-testid="workflow-card">{workflow.name}</div>,
}));

vi.mock('../FolderTree', () => ({
  default: () => <div data-testid="folder-tree" />,
}));

vi.mock('../UserProfile', () => ({
  default: () => <div data-testid="user-profile" />,
}));

// Mock imported data and utils
vi.mock('../../../data/mockFolders', () => ({
  mockFolders: [{ id: 'f1', name: 'Folder 1', children: [] }],
}));

vi.mock('../../../utils/folderUtils', () => ({
  calculateFolderCounts: (folders) => folders,
}));

// Mock image
vi.mock('../../../assets/workflow-logo.png', () => ({
  default: 'logo.png',
}));

describe('WorkspaceDashboard Pagination', () => {
  const generateWorkflows = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `wf-${i}`,
      name: `Workflow ${i + 1}`,
      status: 'Working in Progress',
      tags: [],
      icons: [],
      folderId: 'f1',
    }));
  };

  const defaultProps = {
    onStartBuild: vi.fn(),
    workflows: generateWorkflows(13), // 13 items -> 2 pages (9, 4)
    onEditWorkflow: vi.fn(),
    onShareWorkflow: vi.fn(),
    onDuplicateWorkflow: vi.fn(),
    onDeleteWorkflow: vi.fn(),
    onMoveWorkflow: vi.fn(),
  };

  it('renders correct number of items per page', async () => {
    render(<WorkspaceDashboard {...defaultProps} />);

    // Wait for loading to finish
    await waitFor(() => {
        expect(screen.queryByText(/No workflows found/i)).not.toBeInTheDocument();
    });

    // Check that we have 9 items on the first page
    const cards = await screen.findAllByTestId('workflow-card');
    expect(cards).toHaveLength(9);
    expect(screen.getByText('Workflow 1')).toBeInTheDocument();
    expect(screen.getByText('Workflow 9')).toBeInTheDocument();
    expect(screen.queryByText('Workflow 10')).not.toBeInTheDocument();
  });

  it('navigates to the next page', async () => {
    render(<WorkspaceDashboard {...defaultProps} />);

    // Wait for loading
    await waitFor(() => screen.getByText('Workflow 1'));

    // Find and click next button (chevronRight icon)
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    // Check items on page 2
    const cards = await screen.findAllByTestId('workflow-card');
    expect(cards).toHaveLength(4); // 13 - 9 = 4
    expect(screen.getByText('Workflow 10')).toBeInTheDocument();
    expect(screen.getByText('Workflow 13')).toBeInTheDocument();
    expect(screen.queryByText('Workflow 1')).not.toBeInTheDocument();
  });

  it('navigates to the last page', async () => {
    render(<WorkspaceDashboard {...defaultProps} />);

    // Wait for loading
    await waitFor(() => screen.getByText('Workflow 1'));

    // Go to page 2 (last page)
    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);

    // Check items on page 2 (should be 4 items: Workflow 10-13)
    const cards = await screen.findAllByTestId('workflow-card');
    expect(cards).toHaveLength(4);
    expect(screen.getByText('Workflow 13')).toBeInTheDocument();
  });

  it('resets to page 1 when filter changes', async () => {
    render(<WorkspaceDashboard {...defaultProps} />);

    // Wait for loading
    await waitFor(() => screen.getByText('Workflow 1'));

    // Go to page 2
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(screen.getByText('Workflow 10')).toBeInTheDocument();

    // Change search filter
    const searchInput = screen.getByPlaceholderText('Search workflow...');
    fireEvent.change(searchInput, { target: { value: 'Workflow' } }); // Should match all but trigger reset

    // Should be back to page 1
    expect(screen.getByText('Workflow 1')).toBeInTheDocument();
    expect(screen.queryByText('Workflow 10')).not.toBeInTheDocument();
  });
});
