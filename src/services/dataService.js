/**
 * dataService.js — Data Abstraction Layer
 *
 * Single boundary between the UI and the data source.
 * Currently backed by mock data. Replace each function body with a real
 * API call (fetch/axios/backend) to migrate to a real backend — zero
 * changes required in the components themselves.
 *
 * Pattern:
 *   const data = await dataService.getWorkflows();   // works with mock OR real API
 *
 * @module dataService
 */

import { mockWorkflows } from '../data/mockWorkflows';
import { mockFolders } from '../data/mockFolders';

// ── Simulated network latency for mock mode ─────────────────────────────────
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ── Workflows ───────────────────────────────────────────────────────────────

/**
 * Fetch all workflows for the authenticated user.
 * @returns {Promise<Workflow[]>}
 */
export const getWorkflows = async () => {
    await delay(200);
    return [...mockWorkflows];
};

/**
 * Fetch a single workflow by ID.
 * @param {string} id
 * @returns {Promise<Workflow|null>}
 */
export const getWorkflow = async (id) => {
    await delay(100);
    return mockWorkflows.find(w => w.id === id) ?? null;
};

/**
 * Create a new workflow.
 * @param {Partial<Workflow>} data
 * @returns {Promise<Workflow>}
 */
export const createWorkflow = async (data) => {
    await delay(400);
    return {
        id: String(Date.now()),
        status: 'Draft',
        type: 'Blank',
        icons: ['zap'],
        tags: [],
        date: 'Just now',
        ...data,
    };
};

/**
 * Persist workflow edits (nodes, edges, name).
 * @param {string} id
 * @param {Partial<Workflow>} patch
 * @returns {Promise<Workflow>}
 */
export const saveWorkflow = async (id, patch) => {
    await delay(600);
    const existing = mockWorkflows.find(w => w.id === id) ?? {};
    return { ...existing, ...patch, id, date: 'Just now' };
};

/**
 * Delete a workflow.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteWorkflow = async (id) => {
    await delay(300);
    // Real API: DELETE /api/workflows/:id
};

/**
 * Duplicate a workflow.
 * @param {Workflow} workflow
 * @returns {Promise<Workflow>}
 */
export const duplicateWorkflow = async (workflow) => {
    await delay(400);
    return {
        ...workflow,
        id: String(Date.now()),
        name: `${workflow.name} (Copy)`,
        date: 'Just now',
    };
};

// ── Folders ─────────────────────────────────────────────────────────────────

/**
 * Fetch all folders for the authenticated user.
 * @returns {Promise<Folder[]>}
 */
export const getFolders = async () => {
    await delay(150);
    return [...mockFolders];
};

/**
 * Create a new folder.
 * @param {string} name
 * @returns {Promise<Folder>}
 */
export const createFolder = async (name) => {
    await delay(300);
    return { id: `f-${Date.now()}`, name, count: 0, children: [] };
};

/**
 * Move a workflow into a folder.
 * @param {string} workflowId
 * @param {string|null} folderId  - null to remove from folder
 * @returns {Promise<void>}
 */
export const moveWorkflowToFolder = async (workflowId, folderId) => {
    await delay(200);
    // Real API: PATCH /api/workflows/:workflowId { folderId }
};

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * Replace body with your auth provider or backend.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string}>}
 */
export const signInWithEmail = async (email, password) => {
    await delay(1200);
    return { token: `mock-jwt-${Date.now()}` };
};

/**
 * Sign in with Google OAuth.
 * Replace body with your Google OAuth flow.
 * @returns {Promise<{token: string}>}
 */
export const signInWithGoogle = async () => {
    await delay(1200);
    return { token: `mock-google-${Date.now()}` };
};

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    await delay(200);
    localStorage.removeItem('authToken');
};

// ── Export namespace (for convenience import) ────────────────────────────────
const dataService = {
    getWorkflows, getWorkflow, createWorkflow, saveWorkflow, deleteWorkflow, duplicateWorkflow,
    getFolders, createFolder, moveWorkflowToFolder,
    signInWithEmail, signInWithGoogle, signOut,
};

export default dataService;
