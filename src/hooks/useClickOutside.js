import { useEffect } from 'react';

/**
 * useClickOutside Hook
 * 
 * Detects clicks outside of a referenced element
 * Useful for closing modals, dropdowns, and popovers
 * 
 * @param {React.RefObject} ref - Reference to element
 * @param {Function} handler - Callback when click outside occurs
 * @param {boolean} enabled - Whether detection is enabled
 * 
 * @example
 * const ref = useRef();
 * useClickOutside(ref, () => setIsOpen(false));
 */
export const useClickOutside = (ref, handler, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, enabled]);
};

export default useClickOutside;
