/**
 * Local Storage Utilities
 *
 * All localStorage keys used across the app are centralised here.
 * Import STORAGE_KEYS instead of using raw string literals.
 */

import { APP_CONSTANTS } from '../constants';

/** All localStorage keys used across the app */
export const STORAGE_KEYS = {
    ...APP_CONSTANTS.STORAGE_KEYS,
    AUTH_TOKEN: 'authToken',
    AUTO_ORGANIZE: 'trae-workflow-pref-auto-organize',
};

/**
 * Get item from localStorage with JSON parsing
 */
export const getStorageItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
};

/**
 * Set item in localStorage with JSON stringification
 */
export const setStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
        return false;
    }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
        return false;
    }
};

/**
 * Clear all app-related items from localStorage
 */
export const clearAppStorage = () => {
    try {
        Object.values(APP_CONSTANTS.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Get workflows from storage
 */
export const getWorkflows = () => {
    return getStorageItem(APP_CONSTANTS.STORAGE_KEYS.WORKFLOWS, []);
};

/**
 * Save workflows to storage
 */
export const saveWorkflows = (workflows) => {
    return setStorageItem(APP_CONSTANTS.STORAGE_KEYS.WORKFLOWS, workflows);
};

/**
 * Get chat history from storage
 */
export const getChatHistory = () => {
    return getStorageItem(APP_CONSTANTS.STORAGE_KEYS.CHAT_HISTORY, []);
};

/**
 * Save chat history to storage
 */
export const saveChatHistory = (chatHistory) => {
    return setStorageItem(APP_CONSTANTS.STORAGE_KEYS.CHAT_HISTORY, chatHistory);
};

/**
 * Get user preferences from storage
 */
export const getUserPreferences = () => {
    return getStorageItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES, {
        theme: 'light',
        sidebarCollapse: false,
        autoSave: true,
    });
};

/**
 * Save user preferences to storage
 */
export const saveUserPreferences = (preferences) => {
    return setStorageItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES, preferences);
};

export default {
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    clearAppStorage,
    getWorkflows,
    saveWorkflows,
    getChatHistory,
    saveChatHistory,
    getUserPreferences,
    saveUserPreferences,
};
