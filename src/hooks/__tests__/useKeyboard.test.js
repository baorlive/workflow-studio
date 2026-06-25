import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from '../useKeyboard';

describe('useKeyboard Hook', () => {
    it('calls handler on matching keyboard shortcut', () => {
        const handleCtrlZ = vi.fn();
        const shortcuts = { 'ctrl+z': handleCtrlZ };

        renderHook(() => useKeyboard(shortcuts));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
        });

        window.dispatchEvent(event);

        expect(handleCtrlZ).toHaveBeenCalledOnce();
    });

    it('handles multiple shortcuts', () => {
        const handleCtrlZ = vi.fn();
        const handleCtrlY = vi.fn();
        const shortcuts = {
            'ctrl+z': handleCtrlZ,
            'ctrl+y': handleCtrlY,
        };

        renderHook(() => useKeyboard(shortcuts));

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }));

        expect(handleCtrlZ).toHaveBeenCalledOnce();
        expect(handleCtrlY).toHaveBeenCalledOnce();
    });

    it('handles shift modifier', () => {
        const handleShiftDelete = vi.fn();
        const shortcuts = { 'shift+delete': handleShiftDelete };

        renderHook(() => useKeyboard(shortcuts));

        window.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Delete',
            shiftKey: true,
        }));

        expect(handleShiftDelete).toHaveBeenCalledOnce();
    });

    it('does not call handler when disabled', () => {
        const handleCtrlZ = vi.fn();
        const shortcuts = { 'ctrl+z': handleCtrlZ };

        renderHook(() => useKeyboard(shortcuts, false)); // disabled

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));

        expect(handleCtrlZ).not.toHaveBeenCalled();
    });
});
