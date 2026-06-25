/**
 * Environment Configuration Module
 * 
 * Validates and exports environment variables with type safety.
 * Throws errors if required variables are missing.
 */

const requiredEnvVars = [];

const optionalEnvVars = {
    VITE_API_TIMEOUT: '30000',
    VITE_API_RETRY_ATTEMPTS: '3',
    VITE_ENABLE_ASSISTANT_PANEL: 'true',
    VITE_ENABLE_WORKFLOW_EDITOR: 'true',
    VITE_ENABLE_ANALYTICS: 'false',
    VITE_ENABLE_DEBUG_MODE: 'false',
    VITE_USE_MOCK_DATA: 'false',
    VITE_ANALYTICS_KEY: '',
    VITE_SENTRY_DSN: '',
};

/**
 * Validates that all required environment variables are present
 */
function validateEnv() {
    const missing = requiredEnvVars.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            `Please check your .env file and ensure all required variables are set.`
        );
    }
}

/**
 * Gets an environment variable with fallback
 */
function getEnv(key, fallback = '') {
    return import.meta.env[key] || optionalEnvVars[key] || fallback;
}

/**
 * Gets a boolean environment variable
 */
function getBoolEnv(key, fallback = false) {
    const value = getEnv(key, String(fallback));
    return value === 'true' || value === '1';
}

/**
 * Gets a numeric environment variable
 */
function getNumEnv(key, fallback = 0) {
    const value = getEnv(key, String(fallback));
    return parseInt(value, 10) || fallback;
}

// Validate on module load
if (import.meta.env.MODE !== 'test') {
    validateEnv();
}

/**
 * Application Configuration
 */
export const config = {
    app: {
        name: getEnv('VITE_APP_NAME'),
        version: getEnv('VITE_APP_VERSION', '1.0.0'),
        env: getEnv('VITE_APP_ENV'),
        isDevelopment: import.meta.env.DEV,
        isProduction: import.meta.env.PROD,
    },

    api: {
        baseUrl: getEnv('VITE_API_BASE_URL'),
        timeout: getNumEnv('VITE_API_TIMEOUT', 30000),
        retryAttempts: getNumEnv('VITE_API_RETRY_ATTEMPTS', 3),
    },

    features: {
        assistantPanel: getBoolEnv('VITE_ENABLE_ASSISTANT_PANEL', true),
        workflowEditor: getBoolEnv('VITE_ENABLE_WORKFLOW_EDITOR', true),
        analytics: getBoolEnv('VITE_ENABLE_ANALYTICS', false),
        debugMode: getBoolEnv('VITE_ENABLE_DEBUG_MODE', false),
    },

    data: {
        useMockData: getBoolEnv('VITE_USE_MOCK_DATA', true),
    },

    services: {
        analyticsKey: getEnv('VITE_ANALYTICS_KEY'),
        sentryDsn: getEnv('VITE_SENTRY_DSN'),
    },
};

/**
 * Log configuration in development
 */
if (config.features.debugMode) {
    console.log('🔧 App Configuration:', config);
}

export default config;
