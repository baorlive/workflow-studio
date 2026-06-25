/**
 * Shared app constants.
 */

export const APP_CONSTANTS = {
    DEFAULT_ZOOM: 1,
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2,
    ZOOM_STEP: 0.1,
    GRID_SIZE: 20,
    NODE_WIDTH: 200,
    NODE_HEIGHT: 80,
    ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
    STORAGE_KEYS: {
        WORKFLOWS: 'workflow_studio_workflows',
        CHAT_HISTORY: 'workflow_studio_chat_history',
        USER_PREFERENCES: 'workflow_studio_user_preferences',
    },
};

export const NODE_TYPES = {
    TRIGGER: 'trigger',
    ACTION: 'action',
    CONDITIONAL: 'conditional',
    COMPUTE: 'compute',
    DATA: 'data',
    TRANSFORM: 'transform',
    DELAY: 'delay',
    MERGE: 'merge',
    EXCEPTION: 'exception',
    DECISION: 'decision',
};

export const WORKFLOW_STATUS = {
    DRAFT: 'draft',
    WORKING: 'Working in Progress',
    ACTIVE: 'Active',
    PAUSED: 'paused',
    FAILED: 'failed',
    COMPLETED: 'completed',
};

export const MESSAGE_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
};

export const VIEW_MODES = {
    WORKSPACE: 'workspace',
    ASSISTANT: 'assistant',
    WORKFLOW_EDITOR: 'workflow',
    SETTINGS: 'settings',
};

export const WORKFLOW_CANVAS = {
    NODE_WIDTH: 256,
    NODE_HEIGHT: 80,
    GAP: 10,
    VIEWPORT_PADDING: 24,
    GRID_SIZE: 20,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 5,
    DEFAULT_ZOOM: 1,
    ZOOM_SENSITIVITY: 0.001,
};

export const AUTO_LAYOUT = {
    NODE_WIDTH: 256,
    NODE_HEIGHT: 160,
    START_X: 100,
    START_Y: 100,
    HORIZONTAL_SPACING: 50,
};

export const SAVE_STATUS = {
    SAVED: 'saved',
    UNSAVED: 'unsaved',
    SAVING: 'saving',
};

export const PANEL_TYPES = {
    NODE_SELECTOR: 'nodeSelector',
    ASSISTANT: 'assistantPanel',
    PROPERTIES: 'properties',
    SETTINGS: 'settings',
};

export const NODE_CONFIG = {
    DEFAULT_PARAMS: {
        trigger: {
            schedule: { type: 'string', label: 'Schedule (Cron)', value: '0 0 * * *' },
            webhookUrl: { type: 'string', label: 'Webhook URL', value: '/api/hooks/1' },
            active: { type: 'boolean', label: 'Active', value: true },
        },
        action: {
            endpoint: { type: 'string', label: 'API Endpoint', value: 'https://api.example.com' },
            method: { type: 'select', label: 'Method', value: 'POST', options: ['GET', 'POST', 'PUT', 'DELETE'] },
            timeout: { type: 'number', label: 'Timeout (ms)', value: 5000 },
        },
        conditional: {
            condition: { type: 'string', label: 'Condition Expression', value: 'data.value > 100' },
            mode: { type: 'select', label: 'Evaluation Mode', value: 'JavaScript', options: ['JavaScript', 'Simple', 'JSON Logic'] },
        },
        compute: {
            strategy: { type: 'select', label: 'Processing Strategy', value: 'score', options: ['score', 'classify', 'normalize'] },
            threshold: { type: 'number', label: 'Threshold', value: 0.7 },
            notes: { type: 'textarea', label: 'Processing Notes', value: '' },
        },
        data: {
            connectionString: { type: 'string', label: 'Connection String', value: 'postgres://user:pass@localhost:5432/db' },
            query: { type: 'textarea', label: 'Query', value: 'SELECT * FROM records' },
        },
        transform: {
            script: { type: 'textarea', label: 'Transform Script', value: '// Transform logic here' },
            language: { type: 'select', label: 'Language', value: 'JavaScript', options: ['JavaScript', 'Python', 'JSONata'] },
        },
        delay: {
            duration: { type: 'number', label: 'Duration', value: 5000 },
            unit: { type: 'select', label: 'Unit', value: 'ms', options: ['ms', 's', 'm', 'h'] },
        },
        merge: {
            strategy: { type: 'select', label: 'Merge Strategy', value: 'waitForAll', options: ['waitForAll', 'first', 'race'] },
        },
        exception: {
            retries: { type: 'number', label: 'Max Retries', value: 3 },
            fallback: { type: 'select', label: 'Fallback Action', value: 'skip', options: ['skip', 'terminate', 'alert'] },
        },
    },
};
