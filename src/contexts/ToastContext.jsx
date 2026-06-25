import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../components/ui/Icon';

/**
 * ToastContext — global notification system.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast({ message: 'Saved!', type: 'success' });
 *   showToast({ message: 'Error!', type: 'error', duration: 5000 });
 *
 * Types: 'success' | 'error' | 'warning' | 'info'
 */

const ToastContext = createContext(null);

const BG = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-gray-800',
};

const ICON = {
    success: 'check',
    error: 'alertCircle',
    warning: 'alertTriangle',
    info: 'info',
};

/** Single toast item rendered via portal */
const ToastItem = ({ id, message, type = 'info', onClose }) => (
    <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white
            ${BG[type] ?? BG.info}
            animate-in fade-in slide-in-from-bottom-4 duration-300
        `}
    >
        <Icon name={ICON[type] ?? 'info'} size={18} className="shrink-0" />
        <span className="font-medium text-sm">{message}</span>
        <button
            onClick={() => onClose(id)}
            aria-label="Dismiss notification"
            className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
            <Icon name="x" size={14} />
        </button>
    </div>
);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const counterRef = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
        const id = ++counterRef.current;
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }

        return id;
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ showToast, dismiss }}>
            {children}

            {/* Toast stack — rendered via portal so z-index is always top */}
            {typeof document !== 'undefined' && createPortal(
                <div
                    aria-label="Notifications"
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex flex-col gap-2 items-center pointer-events-none"
                >
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem {...t} onClose={dismiss} />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

/** @returns {{ showToast: (opts: {message: string, type?: string, duration?: number}) => number, dismiss: (id: number) => void }} */
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
};

export default ToastContext;
