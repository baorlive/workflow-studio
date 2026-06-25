import { useState } from 'react';
import { WORKFLOW_CANVAS } from '../constants/workflow';

/**
 * Custom hook for managing workflow nodes and edges
 * Handles node dragging, connections, and CRUD operations
 */
export const useWorkflowNodes = (initialNodes, initialEdges, pushSnapshot, { gridSize = WORKFLOW_CANVAS.GRID_SIZE, snapEnabled = true } = {}) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [configNodeId, setConfigNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [draggingNode, setDraggingNode] = useState(null);
    const [connecting, setConnecting] = useState({
        active: false,
        sourceId: null,
        mouseX: 0,
        mouseY: 0,
        hoverTargetId: null
    });

    const snap = (v) => snapEnabled ? Math.round(v / gridSize) * gridSize : v;

    const handleNodeMouseDown = (e, node) => {
        e.stopPropagation();
        pushSnapshot();
        setDraggingNode({
            id: node.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: node.x,
            initialY: node.y
        });
        setSelectedNodeId(node.id);
    };

    const handleNodeDrag = (e, zoom, nodes, setNodes) => {
        if (!draggingNode) return;

        const dx = (e.clientX - draggingNode.startX) / zoom;
        const dy = (e.clientY - draggingNode.startY) / zoom;

        const newX = snap(draggingNode.initialX + dx);
        const newY = snap(draggingNode.initialY + dy);

        setNodes(nodes.map(n =>
            n.id === draggingNode.id ? { ...n, x: newX, y: newY } : n
        ));
    };

    const handleDrop = (e, canvasRef, pan, zoom, nodes, setNodes) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/reactflow');

        if (!data) return;

        const item = JSON.parse(data);
        const rect = canvasRef.current.getBoundingClientRect();

        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        const x = (clientX - pan.x) / zoom - 128;
        const y = (clientY - pan.y) / zoom - 40;

        const newNode = {
            id: `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: item.type,
            title: item.title,
            icon: item.icon,
            badge: item.badge,
            x: snap(x),
            y: snap(y),
            description: 'New node description',
        };

        pushSnapshot();
        setNodes([...nodes, newNode]);
    };

    const handleDuplicateNode = (nodes, setNodes) => {
        if (!selectedNodeId) return;

        const nodeToDuplicate = nodes.find(n => n.id === selectedNodeId);
        if (!nodeToDuplicate) return;

        const newNode = {
            ...nodeToDuplicate,
            id: `node-${Date.now()}`,
            x: nodeToDuplicate.x + 50,
            y: nodeToDuplicate.y + 50,
            title: `${nodeToDuplicate.title} (Copy)`
        };

        pushSnapshot();
        setNodes([...nodes, newNode]);
        setSelectedNodeId(newNode.id);
    };

    const handleDeleteNode = (nodes, setNodes, edges, setEdges) => {
        if (!selectedNodeId) return;

        pushSnapshot();
        setNodes(nodes.filter(n => n.id !== selectedNodeId));
        setEdges(edges.filter(e =>
            e.source !== selectedNodeId && e.target !== selectedNodeId
        ));
        setSelectedNodeId(null);
    };

    const onStartConnect = (node) => {
        setConnecting({
            active: true,
            sourceId: node.id,
            mouseX: 0,
            mouseY: 0,
            hoverTargetId: null
        });
    };

    const onCompleteConnect = (nodes, edges, setEdges) => {
        if (!connecting.active || !connecting.sourceId || !connecting.hoverTargetId) {
            setConnecting({ active: false, sourceId: null, mouseX: 0, mouseY: 0, hoverTargetId: null });
            return;
        }

        const source = nodes.find(n => n.id === connecting.sourceId);
        const target = nodes.find(n => n.id === connecting.hoverTargetId);

        if (source && target && source.id !== target.id) {
            const id = `e-${source.id}-${target.id}-${edges.length + 1}`;
            pushSnapshot();
            setEdges([...edges, { id, source: source.id, target: target.id }]);
        }

        setConnecting({ active: false, sourceId: null, mouseX: 0, mouseY: 0, hoverTargetId: null });
    };

    const handleConnectingMouseMove = (e, canvasRef, pan, zoom) => {
        if (!connecting.active) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        setConnecting(prev => ({ ...prev, mouseX, mouseY }));
    };

    const handleConfigToggle = (nodeId) => {
        if (configNodeId === nodeId) {
            setConfigNodeId(null);
        } else {
            setConfigNodeId(nodeId);
            setSelectedNodeId(nodeId);
        }
    };

    const handleUpdatePaths = (nodeId, nextTrueTargetId, nextFalseTargetId, edges, setEdges) => {
        pushSnapshot();
        const outgoing = edges.filter(e => e.source === nodeId);
        setEdges(edges.map(e => {
            if (outgoing[0] && e.id === outgoing[0].id && nextFalseTargetId) {
                return { ...e, target: nextFalseTargetId };
            }
            if (outgoing[1] && e.id === outgoing[1].id && nextTrueTargetId) {
                return { ...e, target: nextTrueTargetId };
            }
            return e;
        }));
    };

    const isValidTarget = (targetId) => {
        if (!connecting.active || !connecting.sourceId || !targetId) return false;
        return connecting.sourceId !== targetId;
    };

    return {
        // State
        selectedNodeId,
        configNodeId,
        selectedEdgeId,
        draggingNode,
        connecting,

        // Setters
        setSelectedNodeId,
        setConfigNodeId,
        setSelectedEdgeId,
        setDraggingNode,
        setConnecting,

        // Handlers
        handleNodeMouseDown,
        handleNodeDrag,
        handleDrop,
        handleDuplicateNode,
        handleDeleteNode,
        onStartConnect,
        onCompleteConnect,
        handleConnectingMouseMove,
        handleConfigToggle,
        handleUpdatePaths,
        isValidTarget,
        snap,
    };
};
