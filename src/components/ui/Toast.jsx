import React, { useEffect } from 'react';
import Icon from './Icon';

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose && onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColors = {
        info: 'bg-gray-800',
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-amber-500'
    };

    const icons = {
        info: 'info',
        success: 'check',
        error: 'alertCircle',
        warning: 'alertTriangle'
    };

    return (
        <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${bgColors[type]} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <Icon name={icons[type]} size={20} className="shrink-0" />
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
                <Icon name="x" size={14} />
            </button>
        </div>
    );
};

export default Toast;
