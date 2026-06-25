import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopNavBar from './TopNavBar';

// Mock Icon component
vi.mock('../ui/Icon', () => ({
    default: ({ name, className }) => <div data-testid={`icon-${name}`} className={className}>Icon-{name}</div>,
    Icon: ({ name, className }) => <div data-testid={`icon-${name}`} className={className}>Icon-{name}</div>
}));

describe('TopNavBar', () => {
    const defaultProps = {
        folderName: 'My Folder',
        workflowName: 'My Workflow',
        onNameChange: vi.fn(),
        onBack: vi.fn(),
    };

    it('renders folder icon for regular folders', () => {
        render(<TopNavBar {...defaultProps} />);
        const icon = screen.getByTestId('icon-folder');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('text-[var(--color-text-subtle)]');
    });

    it('renders draft badge with specific styling for Draft folder', () => {
        render(<TopNavBar {...defaultProps} folderName="Draft" />);
        const icon = screen.getByTestId('icon-fileText');
        expect(icon).toBeInTheDocument();
        
        // Check for specific draft styling
        const draftText = screen.getByText('Draft');
        expect(draftText).toHaveClass('uppercase');
        expect(draftText).toHaveClass('text-sm');
        expect(draftText).toHaveClass('font-bold');
        
        // Check container styling (parent of icon and text)
        const badge = draftText.closest('div');
        expect(badge).toHaveClass('bg-[var(--color-surface)]');
        expect(badge).toHaveClass('border-[var(--color-border)]');
    });

    it('renders folder name correctly', () => {
        render(<TopNavBar {...defaultProps} />);
        expect(screen.getByText('My Folder')).toBeInTheDocument();
    });

    it('renders Share button with text', () => {
        render(<TopNavBar {...defaultProps} />);
        const shareButton = screen.getByTitle('Share Workflow');
        expect(shareButton).toBeInTheDocument();
        expect(screen.getByText('Share', { selector: 'span' })).toBeInTheDocument();
    });
});
