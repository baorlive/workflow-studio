import React, { createContext, useContext, useMemo } from 'react';

/**
 * WorkflowEditorContext — shared state for all WorkflowEditor sub-components.
 *
 * This eliminates the 30+ prop threads from WorkflowEditor → children,
 * allowing each sub-component to be properly memoized.
 *
 * Usage in a child component:
 *   const { nodes, edges, zoom, pan, selectedNodeId, dispatch } = useWorkflowEditor();
 */

const WorkflowEditorContext = createContext(null);

/**
 * Provider — place at the top of WorkflowEditor's render tree.
 *
 * @param {object} value  - All shared state and callbacks from WorkflowEditor.
 * @param {React.ReactNode} children
 */
export const WorkflowEditorProvider = ({ value, children }) => {
    // Stable reference — only re-creates context object if `value` reference changes.
    // WorkflowEditor should compose this object with useMemo.
    return (
        <WorkflowEditorContext.Provider value={value}>
            {children}
        </WorkflowEditorContext.Provider>
    );
};

/**
 * Consumer hook.
 * @returns {WorkflowEditorContextValue}
 */
export const useWorkflowEditor = () => {
    const ctx = useContext(WorkflowEditorContext);
    if (!ctx) throw new Error('useWorkflowEditor must be used inside <WorkflowEditorProvider>');
    return ctx;
};

export default WorkflowEditorContext;
