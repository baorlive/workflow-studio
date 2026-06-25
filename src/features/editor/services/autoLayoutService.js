import { AUTO_LAYOUT, WORKFLOW_CANVAS } from '../../../constants';

export const calculateBounds = (nodes) => {
    if (nodes.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x + WORKFLOW_CANVAS.NODE_WIDTH);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y + WORKFLOW_CANVAS.NODE_HEIGHT);
    });

    return { minX, maxX, minY, maxY };
};

export const applyAutoLayout = (nodes, edges) => {
    const ranks = {};
    nodes.forEach(n => (ranks[n.id] = 0));

    for (let i = 0; i < nodes.length; i++) {
        let changed = false;
        edges.forEach(e => {
            if (ranks[e.source] !== undefined && ranks[e.target] !== undefined) {
                if (ranks[e.target] < ranks[e.source] + 1) {
                    ranks[e.target] = ranks[e.source] + 1;
                    changed = true;
                }
            }
        });
        if (!changed) break;
    }

    const layers = {};
    nodes.forEach(n => {
        const r = ranks[n.id];
        if (!layers[r]) layers[r] = [];
        layers[r].push(n.id);
    });

    const gap = AUTO_LAYOUT.NODE_WIDTH + AUTO_LAYOUT.HORIZONTAL_SPACING;
    const maxLayerWidth = Math.max(...Object.values(layers).map(l => l.length)) * gap;

    const newNodes = nodes.map(n => {
        const rank = ranks[n.id];
        const layer = layers[rank];
        const index = layer.indexOf(n.id);
        const layerWidth = layer.length * gap;
        const xOffset = (maxLayerWidth - layerWidth) / 2;
        return {
            ...n,
            x: AUTO_LAYOUT.START_X + xOffset + index * gap,
            y: AUTO_LAYOUT.START_Y + rank * AUTO_LAYOUT.NODE_HEIGHT,
        };
    });

    return newNodes;
};
