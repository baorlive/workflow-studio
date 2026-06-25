import { useEffect } from 'react';

/**
 * useKeyboard Hook
 * 
 * Handles keyboard shortcuts for the application
 * 
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 * 
 * @example
 * useKeyboard({
 *   'ctrl+z': handleUndo,
 *   'ctrl+y': handleRedo,
 *   'ctrl+s': handleSave,
 *   'delete': handleDelete,
 * });
 */
export const useKeyboard = (shortcuts = {}, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            const { key, ctrlKey, metaKey, shiftKey, altKey } = event;

            // Build key combination string
            const parts = [];
            if (ctrlKey || metaKey) parts.push('ctrl');
            if (shiftKey) parts.push('shift');
            if (altKey) parts.push('alt');
            parts.push(key.toLowerCase());

            const combination = parts.join('+');

            // Check if we have a handler for this combination
            if (shortcuts[combination]) {
                event.preventDefault();
                shortcuts[combination](event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts, enabled]);
};

export default useKeyboard;
