import { useState } from 'react';

/**
 * useHistory Hook
 * 
 * Manages undo/redo functionality for workflow nodes and edges
 * Maintains past and future stacks for time-travel debugging
 * 
 * @param {Array} initialNodes - Initial nodes array
 * @param {Array} initialEdges - Initial edges array
 * @returns {Object} State and control functions
 * 
 * @example
 * const { nodes, edges, setNodes, setEdges, undo, redo, canUndo, canRedo } = 
 *   useHistory(initialNodes, initialEdges);
 */
export const useHistory = (initialNodes, initialEdges) => {
    // Present state
    const [state, setState] = useState({
        nodes: initialNodes,
        edges: initialEdges
    });

    // Past and Future stacks for undo/redo
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    /**
     * Set nodes - accepts array or updater function
     */
    const setNodes = (newNodesOrFn) => {
        setState(prev => ({
            ...prev,
            nodes: typeof newNodesOrFn === 'function'
                ? newNodesOrFn(prev.nodes)
                : newNodesOrFn
        }));
    };

    /**
     * Set edges - accepts array or updater function
     */
    const setEdges = (newEdgesOrFn) => {
        setState(prev => ({
            ...prev,
            edges: typeof newEdgesOrFn === 'function'
                ? newEdgesOrFn(prev.edges)
                : newEdgesOrFn
        }));
    };

    /**
     * Push current state to history stack
     * Call this before making changes you want to be able to undo
     */
    const HISTORY_LIMIT = 50;

    const pushSnapshot = () => {
        setPast(prev => {
            const next = [...prev, state];
            return next.length > HISTORY_LIMIT ? next.slice(-HISTORY_LIMIT) : next;
        });
        setFuture([]); // Clear future when new snapshot is taken
    };

    /**
     * Undo last change
     */
    const undo = () => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture(prev => [state, ...prev]);
        setState(previous);
        setPast(newPast);
    };

    /**
     * Redo last undone change
     */
    const redo = () => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, state]);
        setState(next);
        setFuture(newFuture);
    };

    return {
        nodes: state.nodes,
        edges: state.edges,
        setNodes,
        setEdges,
        pushSnapshot,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        pastCount: past.length,
    };
};

export default useHistory;
