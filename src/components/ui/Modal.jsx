import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

/**
 * Modal Component
 *
 * Base modal component with backdrop, header, content, and optional footer
 * Handles ESC key press, body scroll locking, and focus trap.
 *
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'} size - Modal size (default: 'md')
 */
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    const panelRef = useRef(null);
    const triggerRef = useRef(document.activeElement);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };

        if (isOpen) {
            triggerRef.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
            // Focus first focusable element inside modal
            requestAnimationFrame(() => {
                const focusable = panelRef.current?.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                focusable?.[0]?.focus();
            });
        } else {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
            // Return focus to the element that opened the modal
            triggerRef.current?.focus();
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full m-4',
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="fixed inset-0 bg-gray-900/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out"
                onClick={onClose}
                aria-hidden="true"
            />

            <div ref={panelRef} className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} transform transition-all duration-300 ease-out scale-100 opacity-100 border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl shrink-0">
                    <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors p-1.5 rounded-md focus:outline-none"
                        aria-label="Close"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>

                <div className="px-5 py-5 overflow-y-auto flex-1">
                    {children}
                </div>

                {footer && (
                    <div className="px-5 py-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100 rounded-b-xl shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
