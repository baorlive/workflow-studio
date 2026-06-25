import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkflowCard from '../WorkflowCard';

// Mock Icon component
vi.mock('../../ui/Icon', () => ({
  default: ({ name }) => <span data-testid={`icon-${name}`}>{name}</span>,
  Icon: ({ name }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

describe('WorkflowCard', () => {
  const mockWorkflow = {
    id: '1',
    name: 'Test Workflow',
    date: '2 days ago',
    folderId: 'project-1',
    icons: ['workflow', 'bot'],
    tags: ['Deployed'],
    comments: 5,
  };

  const mockProps = {
    workflow: mockWorkflow,
    projectName: 'My Project',
    isDraft: false,
    onEdit: vi.fn(),
    onShare: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
  };

  it('renders project badge with correct styling', () => {
    render(<WorkflowCard {...mockProps} />);
    
    const badge = screen.getByText('My Project').closest('button');
    
    // Check for updated styling classes
    expect(badge).toHaveClass('bg-[var(--color-surface-elevated)]');
    expect(badge).toHaveClass('border-[var(--color-border)]');
    expect(badge).toHaveClass('text-[var(--color-text)]');
    expect(badge).toHaveClass('hover:bg-[var(--color-surface)]');
    
    // Check for flex layout and border
    expect(badge).toHaveClass('flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('border');
  });

  it('renders correct icon for project', () => {
    render(<WorkflowCard {...mockProps} />);
    expect(screen.getByTestId('icon-folder')).toBeInTheDocument();
  });

  it('renders draft badge with draft styling', () => {
    const draftProps = {
        ...mockProps,
        workflow: { ...mockWorkflow, folderId: 'drafts' },
        projectName: 'Draft'
    };
    render(<WorkflowCard {...draftProps} />);
    
    const badge = screen.getByText('Draft').closest('button');
    
    // Check for draft styling classes
    expect(badge).toHaveClass('bg-[var(--color-surface)]');
    expect(badge).toHaveClass('border-[var(--color-border)]');
    expect(badge).toHaveClass('text-[var(--color-text-subtle)]');
  });

  it('renders draft badge with draft styling when project name is Draft', () => {
    const customDraftProps = {
        ...mockProps,
        workflow: { ...mockWorkflow, folderId: 'some-custom-id' },
        projectName: 'Draft'
    };
    render(<WorkflowCard {...customDraftProps} />);
    
    const badge = screen.getByText('Draft').closest('button');
    
    // Check for draft styling classes
    expect(badge).toHaveClass('bg-[var(--color-surface)]');
    expect(badge).toHaveClass('border-[var(--color-border)]');
    expect(badge).toHaveClass('text-[var(--color-text-subtle)]');
    expect(screen.getByTestId('icon-fileText')).toBeInTheDocument();
  });
});
