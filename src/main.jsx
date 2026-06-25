import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import 'reactflow/dist/style.css';
import './styles/index.css';
import { config } from './config/env';

const DESIGN_SYSTEM_OVERRIDES_KEY = 'workflowstudio.design-system.overrides.v1';
const DESIGN_SYSTEM_THEME_KEY = 'workflowstudio.design-system.theme.v1';

const bootDesignSystem = () => {
    const theme = localStorage.getItem(DESIGN_SYSTEM_THEME_KEY) || 'light';
    document.documentElement.dataset.theme = theme;

    const storedOverrides = localStorage.getItem(DESIGN_SYSTEM_OVERRIDES_KEY);
    if (!storedOverrides) return;

    try {
        const overrides = JSON.parse(storedOverrides);
        Object.entries(overrides).forEach(([token, value]) => {
            if (value !== undefined && value !== null && String(value).trim()) {
                document.documentElement.style.setProperty(token, String(value).trim());
            }
        });
    } catch (error) {
        if (config.features.debugMode) {
            console.warn('Failed to parse design system overrides:', error);
        }
    }
};

bootDesignSystem();

// Log configuration in development
if (config.features.debugMode) {
    console.log('🚀 Workflow Studio Starting');
    console.log('Environment:', config.app.env);
    console.log('Version:', config.app.version);
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
        <Analytics />
    </React.StrictMode>
);
