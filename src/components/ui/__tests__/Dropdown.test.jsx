import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dropdown } from '../Dropdown';

// Mock Icon component
vi.mock('../Icon', () => ({
    Icon: () => <div data-testid="icon" />
}));

describe('Dropdown', () => {
    const mockItems = [
        { label: 'Option 1', onClick: vi.fn(), icon: 'save' },
        { label: 'Option 2', onClick: vi.fn(), icon: 'copy' }
    ];

    const trigger = <button>Open</button>;

    it('renders trigger', () => {
        render(<Dropdown trigger={trigger} items={mockItems} />);
        expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('opens menu on click', () => {
        render(<Dropdown trigger={trigger} items={mockItems} />);
        
        fireEvent.click(screen.getByText('Open'));
        
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('calls item onClick and closes menu', () => {
        render(<Dropdown trigger={trigger} items={mockItems} />);
        
        fireEvent.click(screen.getByText('Open'));
        fireEvent.click(screen.getByText('Option 1'));
        
        expect(mockItems[0].onClick).toHaveBeenCalled();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes on click outside', () => {
        render(
            <div>
                <div data-testid="outside">Outside</div>
                <Dropdown trigger={trigger} items={mockItems} />
            </div>
        );
        
        fireEvent.click(screen.getByText('Open'));
        expect(screen.getByRole('menu')).toBeInTheDocument();
        
        fireEvent.mouseDown(screen.getByTestId('outside'));
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('navigates with keyboard', () => {
        render(<Dropdown trigger={trigger} items={mockItems} />);
        
        const triggerBtn = screen.getByText('Open').parentElement;
        
        // Open with Enter - sets focus to index 0
        fireEvent.keyDown(triggerBtn, { key: 'Enter' });
        expect(screen.getByRole('menu')).toBeInTheDocument();
        
        // Arrow Down to select second item (index 1)
        fireEvent.keyDown(triggerBtn, { key: 'ArrowDown' });
        
        // Enter to select
        fireEvent.keyDown(triggerBtn, { key: 'Enter' });
        expect(mockItems[1].onClick).toHaveBeenCalled();
    });
});
