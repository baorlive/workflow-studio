/**
 * Mock Data - Workflow Nodes and Edges
 */

export const initialNodes = [
    { id: '1', type: 'trigger', title: 'Start Workflow', x: 400, y: 50, icon: 'zap', description: 'Initiate workflows' },
    { id: '2', type: 'conditional', title: 'Check Source', x: 400, y: 180, icon: 'gitBranch', description: 'Route based on data source' },
    { id: '3', type: 'action', title: 'Process Partner Data', x: 150, y: 300, icon: 'database', description: 'ETL for partner systems' },
    { id: '4', type: 'action', title: 'Process Internal Data', x: 650, y: 300, icon: 'server', description: 'Internal data handling' },
    { id: '5', type: 'compute', title: 'Priority Router', x: 150, y: 450, icon: 'cpu', description: 'Rule-based categorization' },
    { id: '6', type: 'data', title: 'Store in DB', x: 650, y: 450, icon: 'database', description: 'Persist to warehouse' },
    { id: '7', type: 'delay', title: 'Wait and proceed', x: 550, y: 580, icon: 'clock', description: 'Fixed Delay' },
    { id: '8', type: 'conditional', title: 'Check Contact Reason', x: 400, y: 700, icon: 'gitBranch', description: 'Conditional' }
];

export const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3', label: 'Partner website' },
    { id: 'e2-4', source: '2', target: '4', label: 'Our website' },
    { id: 'e3-5', source: '3', target: '5' },
    { id: 'e4-6', source: '4', target: '6' },
    { id: 'e5-7', source: '5', target: '7' },
    { id: 'e6-7', source: '6', target: '7' },
    { id: 'e7-8', source: '7', target: '8' },
];

/**
 * Available node types for the toolbox
 */

export const availableNodeTypes = [
    { type: 'trigger', title: 'Trigger', icon: 'zap' },
    { type: 'action', title: 'Action', icon: 'play' },
    { type: 'conditional', title: 'Conditional', icon: 'gitBranch' },
    { type: 'compute', title: 'Compute', icon: 'cpu' },
    { type: 'data', title: 'Data Source', icon: 'database' },
    { type: 'transform', title: 'Transform', icon: 'repeat' },
    { type: 'delay', title: 'Delay', icon: 'clock' },
    { type: 'decision', title: 'Decision', icon: 'split' },
    { type: 'merge', title: 'Merge', icon: 'gitBranch' },
    { type: 'exception', title: 'Exception', icon: 'alertTriangle' },
];

export default {
    initialNodes,
    initialEdges,
    availableNodeTypes,
};
