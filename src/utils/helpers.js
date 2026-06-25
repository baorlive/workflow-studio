/**
 * Utility Functions - Helpers
 */

/**
 * Generate a unique ID
 */
export const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Format timestamp
 */
export const formatTimestamp = (date = new Date()) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Check if click is outside element
 */
export const isClickOutside = (event, ref) => {
    return ref.current && !ref.current.contains(event.target);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Validate workflow name
 */
export const validateWorkflowName = (name) => {
    const errors = [];

    if (!name || !name.trim()) {
        errors.push('Name cannot be empty');
    }

    if (name.length > 50) {
        errors.push('Name must be less than 50 characters');
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        errors.push('Name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Download JSON file
 */
export const downloadJSON = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default {
    generateId,
    formatTimestamp,
    debounce,
    throttle,
    clamp,
    isClickOutside,
    copyToClipboard,
    calculateDistance,
    formatBytes,
    validateWorkflowName,
    downloadJSON,
};
