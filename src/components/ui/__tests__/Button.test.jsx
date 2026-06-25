import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByText('Click'));
        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('applies primary variant classes by default', () => {
        const { container } = render(<Button>Test</Button>);
        expect(container.firstChild).toHaveClass('bg-[var(--btn-bg)]');
        expect(container.firstChild.style.getPropertyValue('--btn-bg')).toBe('var(--button-primary-bg)');
    });

    it('applies secondary variant classes', () => {
        const { container } = render(<Button variant="secondary">Test</Button>);
        expect(container.firstChild.style.getPropertyValue('--btn-bg')).toBe('var(--button-secondary-bg)');
        expect(container.firstChild.style.getPropertyValue('--btn-border')).toBe('var(--button-secondary-border)');
    });

    it('applies ghost variant classes', () => {
        const { container } = render(<Button variant="ghost">Test</Button>);
        expect(container.firstChild.style.getPropertyValue('--btn-bg')).toBe('var(--button-ghost-bg)');
    });

    it('applies danger variant classes', () => {
        const { container } = render(<Button variant="danger">Test</Button>);
        expect(container.firstChild.style.getPropertyValue('--btn-bg')).toBe('var(--button-danger-bg)');
    });

    it('applies small size classes', () => {
        const { container } = render(<Button size="sm">Test</Button>);
        expect(container.firstChild.style.getPropertyValue('--btn-px')).toBe('var(--button-padding-x-sm)');
        expect(container.firstChild.style.getPropertyValue('--btn-py')).toBe('var(--button-padding-y-sm)');
    });

    it('applies medium size classes by default', () => {
        const { container } = render(<Button>Test</Button>);
        expect(container.firstChild.style.getPropertyValue('--btn-px')).toBe('var(--button-padding-x-md)');
        expect(container.firstChild.style.getPropertyValue('--btn-py')).toBe('var(--button-padding-y-md)');
    });

    it('applies large size classes', () => {
        const { container } = render(<Button size="lg">Test</Button>);
        expect(container.firstChild.style.getPropertyValue('--btn-px')).toBe('var(--button-padding-x-lg)');
        expect(container.firstChild.style.getPropertyValue('--btn-py')).toBe('var(--button-padding-y-lg)');
    });

    it('disables button when disabled prop is true', () => {
        const { container } = render(<Button disabled>Test</Button>);
        expect(container.firstChild).toBeDisabled();
        expect(container.firstChild).toHaveClass('cursor-not-allowed');
        expect(container.firstChild).toHaveClass('opacity-[var(--button-disabled-opacity)]');
    });

    it('does not call onClick when disabled', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} disabled>Click</Button>);
        fireEvent.click(screen.getByText('Click'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
        const { container } = render(<Button className="custom-class">Test</Button>);
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('auto focuses when autoFocus is true', () => {
        render(<Button autoFocus>Test</Button>);
        expect(screen.getByText('Test')).toHaveFocus();
    });
});
