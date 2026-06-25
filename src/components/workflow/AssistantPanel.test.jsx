import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AssistantPanel from './AssistantPanel';

// Mock Icon component
vi.mock('../ui/Icon', () => ({
    default: ({ name }) => <div data-testid={`icon-${name}`}>Icon-{name}</div>,
    Icon: ({ name }) => <div data-testid={`icon-${name}`}>Icon-{name}</div>
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('AssistantPanel', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        messages: [],
        input: '',
        setInput: vi.fn(),
        onSend: vi.fn(),
        isTyping: false
    };

    it('renders when open', () => {
        const { container } = render(<AssistantPanel {...defaultProps} />);
        expect(screen.getByText('Workflow Assistant')).toBeInTheDocument();
        // Panel root includes positioning class
        expect(container.querySelector('.bottom-24')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        const { container } = render(<AssistantPanel {...defaultProps} isOpen={false} />);
        expect(container).toBeEmptyDOMElement();
    });
});
