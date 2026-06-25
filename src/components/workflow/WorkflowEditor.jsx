import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactFlow, { Background, addEdge, applyEdgeChanges, applyNodeChanges, Handle, Position } from 'reactflow';
import NodeSelectorPanel from './NodeSelectorPanel';
import TopToolbar from './TopToolbar';
import PropertiesPanel from './PropertiesPanel';
import TopNavBar from './TopNavBar';
import WorkflowControls from './WorkflowControls';
import AssistantPanel from './AssistantPanel';
import ConfirmDialog from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import NodeHelpModal from './NodeHelpModal';
import CanvasNode from './CanvasNode';
import ButtonEdge from './ButtonEdge';

import { useHistory } from '@hooks/useHistory';
import { initialNodes, initialEdges } from '@data/mockNodes';
import { suggestedPrompts } from '@data/mockChat';
import { useAssistantChat } from '../../features/assistant-chat/hooks/useAssistantChat';
import { applyAutoLayout } from '../../features/editor/services/autoLayoutService';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/ui';
import Icon from '../ui/Icon';
import { findFolderById } from '../../features/workspace/services/folderService';
import { WorkflowEditorProvider } from '../../contexts/WorkflowEditorContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * WorkflowEditor
 *
 * Orchestrates the canvas editing experience.
 * Canvas state is delegated to useWorkflowCanvas.
 * Node/edge state is delegated to useWorkflowNodes.
 * This component owns: UI panels, assistant, save/run, auto-layout, settings.
 */
const nodeTypes = { canvasNode: CanvasNode };
const edgeTypes = { buttonEdge: ButtonEdge };

export const WorkflowEditor = ({ workflow, folders = [], onSave, onShare, onBack }) => {

    // ── History (undo / redo) ───────────────────────────────────────────────
    const startNodes = useMemo(() => (workflow?.type === 'Blank' ? [] : initialNodes), [workflow?.type]);
    const startEdges = useMemo(() => (workflow?.type === 'Blank' ? [] : initialEdges), [workflow?.type]);
    const toReactFlowNode = useCallback((n) => {
        return {
            id: n.id,
            type: 'canvasNode',
            position: { x: n.x ?? 0, y: n.y ?? 0 },
            data: {
                id: n.id,
                type: n.type,
                kind: n.kind || n.type,
                title: n.title,
                icon: n.icon,
                badge: n.badge,
                description: n.description,
                parameters: n.parameters,
                credentialRequired: n.credentialRequired,
                inputAnchors: n.inputAnchors,
                outputAnchors: n.outputAnchors,
            },
        };
    }, []);

    const toReactFlowEdge = useCallback((e) => {
        return {
            id: e.id,
            type: 'buttonEdge',
            source: e.source,
            target: e.target,
            label: e.label,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
        };
    }, []);

    const startReactFlowNodes = useMemo(() => startNodes.map(toReactFlowNode), [startNodes, toReactFlowNode]);
    const startReactFlowEdges = useMemo(() => startEdges.map(toReactFlowEdge), [startEdges, toReactFlowEdge]);
    const {
        nodes, edges, setNodes, setEdges,
        pushSnapshot, undo, redo, canUndo, canRedo,
        pastCount,
    } = useHistory(startReactFlowNodes, startReactFlowEdges);

    const reactFlowWrapperRef = useRef(null);
    const reactFlowInstanceRef = useRef(null);

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [configNodeId, setConfigNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // ── Editor UI state ────────────────────────────────────────────────────
    const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
    const [isAssistantPanelOpen, setIsAssistantPanelOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [autoOrganizeEnabled, setAutoOrganizeEnabled] = useState(
        () => localStorage.getItem('trae-workflow-pref-auto-organize') !== 'false'
    );
    const [isAutoOrganizing, setIsAutoOrganizing] = useState(false);
    const hasRunAutoLayout = useRef(false);
    const isFirstMount = useRef(true);
    const autoSaveTimerRef = useRef(null);

    // ── Toast notifications ────────────────────────────────────────────────
    const { showToast } = useToast();

    const toCanvasNode = useCallback((rfNode) => {
        const d = rfNode?.data || {};
        return {
            id: rfNode.id,
            type: d.type,
            kind: d.kind,
            title: d.title,
            icon: d.icon,
            badge: d.badge,
            description: d.description,
            parameters: d.parameters,
            credentialRequired: d.credentialRequired,
            x: rfNode.position?.x ?? 0,
            y: rfNode.position?.y ?? 0,
            inputAnchors: d.inputAnchors,
            outputAnchors: d.outputAnchors,
        };
    }, []);

    const toCanvasEdge = useCallback((rfEdge) => {
        return {
            id: rfEdge.id,
            source: rfEdge.source,
            target: rfEdge.target,
            label: rfEdge.label,
            sourceHandle: rfEdge.sourceHandle,
            targetHandle: rfEdge.targetHandle,
        };
    }, []);

    const canvasNodes = useMemo(() => nodes.map(toCanvasNode), [nodes, toCanvasNode]);
    const canvasEdges = useMemo(() => edges.map(toCanvasEdge), [edges, toCanvasEdge]);

    const fitView = useCallback(() => {
        if (!reactFlowInstanceRef.current) return;
        reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 200 });
    }, []);

    const setNodesFromCanvasNodes = useCallback((newCanvasNodes) => {
        setNodes(newCanvasNodes.map(toReactFlowNode));
    }, [setNodes, toReactFlowNode]);

    const setEdgesFromCanvasEdges = useCallback((newCanvasEdges) => {
        setEdges(newCanvasEdges.map(toReactFlowEdge));
    }, [setEdges, toReactFlowEdge]);

    const { messages, chatInput, setChatInput, isChatTyping, sendMessage } = useAssistantChat(
        pushSnapshot,
        setNodesFromCanvasNodes,
        setEdgesFromCanvasEdges,
        fitView
    );

    // ── Save / Run state ───────────────────────────────────────────────────
    const [saveStatus, setSaveStatus] = useState('unsaved'); // 'saved' | 'unsaved' | 'saving'
    const [isRunning, setIsRunning] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // ── Breadcrumb / name ──────────────────────────────────────────────────

    const currentFolder = workflow?.folderId ? findFolderById(folders, workflow.folderId) : null;
    const folderName = currentFolder?.name || 'Draft';
    const [workflowName, setWorkflowName] = useState(workflow?.name || 'My New Workflow');

    // ── Auto-save ──────────────────────────────────────────────────────────
    useEffect(() => { setSaveStatus('unsaved'); }, [nodes, edges, workflowName]);

    useEffect(() => {
        if (saveStatus !== 'unsaved') return;
        autoSaveTimerRef.current = setTimeout(() => handleSave(true), 2000);
        return () => clearTimeout(autoSaveTimerRef.current);
    }, [saveStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Keyboard shortcuts ─────────────────────────────────────────────────
    useEffect(() => {
        const onKeyDown = (e) => {
            const inInput = document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA';

            // Space → pan mode
            if (e.code === 'Space' && !inInput) {
                e.preventDefault();
                if (!e.repeat) setIsPanning(true);
            }

            // Delete / Backspace → remove selected
            if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
                if (selectedNodeId) setShowDeleteConfirm(true);
                else if (selectedEdgeId) {
                    pushSnapshot();
                    setEdges(edges.filter(edge => edge.id !== selectedEdgeId));
                    setSelectedEdgeId(null);
                }
            }

            // Escape → close panels / deselect
            if (e.key === 'Escape') {
                if (showDeleteConfirm) setShowDeleteConfirm(false);
                else if (isNodePanelOpen) setIsNodePanelOpen(false);
                else if (isAssistantPanelOpen) setIsAssistantPanelOpen(false);
                else if (selectedNodeId) setSelectedNodeId(null);
                else if (selectedEdgeId) setSelectedEdgeId(null);
            }

            // Ctrl/Cmd shortcuts
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    e.shiftKey ? (canRedo && redo()) : (canUndo && undo());
                }
                if (e.key === 'y') { e.preventDefault(); canRedo && redo(); }
                if (e.key === 'd') {
                    e.preventDefault();
                    if (!selectedNodeId) return;
                    const nodeToDuplicate = nodes.find(n => n.id === selectedNodeId);
                    if (!nodeToDuplicate) return;
                    pushSnapshot();
                    const newId = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
                    setNodes((prev) => [
                        ...prev,
                        {
                            ...nodeToDuplicate,
                            id: newId,
                            position: {
                                x: (nodeToDuplicate.position?.x ?? 0) + 50,
                                y: (nodeToDuplicate.position?.y ?? 0) + 50,
                            },
                            data: {
                                ...(nodeToDuplicate.data || {}),
                                id: newId,
                                title: `${nodeToDuplicate.data?.title || 'Node'} (Copy)`,
                            },
                        },
                    ]);
                    setSelectedNodeId(newId);
                }
            }
        };

        const onKeyUp = (e) => { if (e.code === 'Space') setIsPanning(false); };
        const onBlur = () => setIsPanning(false);

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, [
        selectedNodeId, selectedEdgeId, isNodePanelOpen, isAssistantPanelOpen,
        canUndo, canRedo, undo, redo, showDeleteConfirm, edges,
        nodes, pushSnapshot, setEdges, setIsPanning, setNodes, setSelectedEdgeId, setSelectedNodeId
    ]);

    // ── Auto-organize every time the editor opens ───────────────────────────────────
    const autoOrganizeRef = useRef(null);
    useEffect(() => {
        // Schedule auto-layout after first render, giving time for all handlers to be defined
        const timer = setTimeout(() => {
            if (autoOrganizeRef.current && autoOrganizeEnabled) {
                autoOrganizeRef.current();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Computed ───────────────────────────────────────────────────────────
    const configNode = canvasNodes.find(n => n.id === configNodeId);

    // ── Combined mouse handlers (not used in ReactFlow mode) ───────────────

    // ── Drag start (called from NodeSelectorPanel items) ───────────────────
    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('application/reactflow', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'move';
    };

    // ── Config panel toggle (also closes the node selector panel) ──────────
    const handleConfigToggle = useCallback((nodeId) => {
        setConfigNodeId((prev) => (prev === nodeId ? null : nodeId));
        setSelectedNodeId(nodeId);
        if (configNodeId !== nodeId) setIsNodePanelOpen(false);
    }, [configNodeId, setIsNodePanelOpen]);

    // ── Node CRUD ──────────────────────────────────────────────────────────
    const handleUpdateNode = useCallback((updatedNode) => {
        setNodes((prev) => prev.map((n) => {
            if (n.id !== updatedNode.id) return n;
            return {
                ...n,
                position: { x: updatedNode.x ?? n.position?.x ?? 0, y: updatedNode.y ?? n.position?.y ?? 0 },
                data: {
                    ...(n.data || {}),
                    ...updatedNode,
                },
            };
        }));
    }, [setNodes]);

    const handleConfirmDelete = () => {
        if (!selectedNodeId) return;
        pushSnapshot();
        setNodes((prev) => prev.filter(n => n.id !== selectedNodeId));
        setEdges((prev) => prev.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
        setSelectedNodeId(null);
        setConfigNodeId(null);
        setShowDeleteConfirm(false);
    };

    const handleUpdatePaths = useCallback((nodeId, nextTrueTargetId, nextFalseTargetId) => {
        pushSnapshot();
        setEdges((prev) => prev.map((e) => {
            if (e.source !== nodeId) return e;
            if (e.sourceHandle === 'true' && nextTrueTargetId) return { ...e, target: nextTrueTargetId };
            if (e.sourceHandle === 'false' && nextFalseTargetId) return { ...e, target: nextFalseTargetId };
            return e;
        }));
    }, [pushSnapshot, setEdges]);

    const handleDuplicateSelected = useCallback(() => {
        if (!selectedNodeId) return;
        const nodeToDuplicate = nodes.find(n => n.id === selectedNodeId);
        if (!nodeToDuplicate) return;
        pushSnapshot();
        const newId = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        setNodes((prev) => [
            ...prev,
            {
                ...nodeToDuplicate,
                id: newId,
                position: {
                    x: (nodeToDuplicate.position?.x ?? 0) + 50,
                    y: (nodeToDuplicate.position?.y ?? 0) + 50,
                },
                data: {
                    ...(nodeToDuplicate.data || {}),
                    id: newId,
                    title: `${nodeToDuplicate.data?.title || 'Node'} (Copy)`,
                },
            },
        ]);
        setSelectedNodeId(newId);
    }, [nodes, pushSnapshot, selectedNodeId, setNodes]);

    const handleDeleteSelected = useCallback(() => {
        if (!selectedNodeId) return;
        setShowDeleteConfirm(true);
    }, [selectedNodeId]);

    // ── Edge events ────────────────────────────────────────────────────────
    const handleEdgeClick = (edgeId) => {
        setSelectedEdgeId(edgeId);
        setSelectedNodeId(null);
        setIsNodePanelOpen(false);
    };

    const handleEdgeDelete = (edgeId) => {
        pushSnapshot(); // fixed: was saveState() which does not exist
        setEdges(prev => prev.filter(edge => edge.id !== edgeId));
        setSelectedEdgeId(null);
    };

    // Always-fresh refs so auto-layout never reads stale closures
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    nodesRef.current = nodes;
    edgesRef.current = edges;

    // ── Auto-layout ────────────────────────────────────────────────────────
    const handleAutoLayout = useCallback(() => {
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;
        if (currentNodes.length === 0) return;
        pushSnapshot();
        const layoutInputNodes = currentNodes.map((n) => ({
            id: n.id,
            x: n.position?.x ?? 0,
            y: n.position?.y ?? 0,
        }));
        const layoutEdges = currentEdges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
        const laidOut = applyAutoLayout(layoutInputNodes, layoutEdges);
        setNodes((prev) => prev.map((n) => {
            const match = laidOut.find(x => x.id === n.id);
            if (!match) return n;
            return { ...n, position: { x: match.x, y: match.y } };
        }));
        setZoom(1);
        setTimeout(() => {
            if (reactFlowInstanceRef.current) reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 200 });
        }, 50);
    }, [pushSnapshot, setNodes]);

    // Keep the ref up to date so the mount effect can call it
    autoOrganizeRef.current = () => {
        if (nodesRef.current.length > 0) {
            setIsAutoOrganizing(true);
            setTimeout(() => {
                handleAutoLayout();
                setIsAutoOrganizing(false);
            }, 200);
        }
    };

    // ── Save / Run / Name ──────────────────────────────────────────────────
    const handleSave = async (silent = false) => {
        clearTimeout(autoSaveTimerRef.current); // cancel any pending auto-save
        setSaveStatus('saving');
        await new Promise(resolve => setTimeout(resolve, 800)); // replace with real API call
        setSaveStatus('saved');
        if (!silent) showToast({ message: 'Workflow saved!', type: 'success' });
    };

    const handleSaveTemplate = async () => {
        setSaveStatus('saving');
        await new Promise(resolve => setTimeout(resolve, 800)); // replace with real API call
        setSaveStatus('saved');
        showToast({ message: 'Saved as template!', type: 'success' });
    };

    const handleExport = async () => {
        // Export workflow as JSON
        const workflowData = {
            name: workflowName,
            folder: folderName,
            nodes: nodes,
            edges: edges,
            exportedAt: new Date().toISOString()
        };
        const jsonString = JSON.stringify(workflowData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workflowName.replace(/\s+/g, '-')}-export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRun = async () => {
        setIsRunning(true);
        try {
            await new Promise((resolve, reject) =>
                setTimeout(() =>
                    Math.random() > 0.8
                        ? reject(new Error('Execution failed due to timeout or resource constraint.'))
                        : resolve(),
                    2000
                )
            );
            setShowSuccessDialog(true);
            showToast({ message: 'Workflow executed successfully!', type: 'success', duration: 4000 });
        } catch (error) {
            setErrorMessage(error.message);
            setShowErrorDialog(true);
            showToast({ message: 'Execution failed', type: 'error', duration: 5000 });
        } finally {
            setIsRunning(false);
        }
    };

    const handleNameChange = (newName) => {
        setWorkflowName(newName);
        setSaveStatus('unsaved');
    };



    // ── Context value for all child panels ────────────────────────────────
    const editorContextValue = useMemo(() => ({
        nodes: canvasNodes, edges: canvasEdges, zoom, pan,
        selectedNodeId, configNodeId, selectedEdgeId,
        isPanning, isDragOver,
        saveStatus, isRunning,
        isNodePanelOpen, isAssistantPanelOpen,
        // Setters
        setSelectedNodeId, setConfigNodeId,
        setIsNodePanelOpen, setIsAssistantPanelOpen,
        // Handlers
        handleUpdateNode,
        handleDuplicateSelected,
        handleDeleteSelected,
        handleUpdatePaths,
        handleConfigToggle, handleAutoLayout,
        fitView,
    }), [
        canvasNodes, canvasEdges, zoom, pan,
        selectedNodeId, configNodeId, selectedEdgeId,
        isPanning, isDragOver, saveStatus, isRunning,
        isNodePanelOpen, isAssistantPanelOpen,
        setSelectedNodeId, setConfigNodeId,
        setIsNodePanelOpen, setIsAssistantPanelOpen,
        handleUpdateNode,
        handleDuplicateSelected,
        handleDeleteSelected,
        handleUpdatePaths,
        handleConfigToggle, handleAutoLayout,
        fitView,
    ]);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

            <TopNavBar
                folderName={folderName}
                workflowName={workflowName}
                onNameChange={handleNameChange}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                undoCount={pastCount}
                onSave={handleSave}
                onSaveTemplate={handleSaveTemplate}
                onShare={onShare}
                onRun={handleRun}
                onSettings={() => setShowSettings(true)}
                onExport={handleExport}
                saveStatus={saveStatus}
                isRunning={isRunning}
                onBack={onBack}
            />

            <div className="flex-1 relative h-full overflow-hidden">

                {/* Floating toolbar: Add Node / Open Assistant */}
                <TopToolbar
                    onAddNode={() => {
                        if (!isNodePanelOpen) setIsAssistantPanelOpen(false);
                        setIsNodePanelOpen(prev => !prev);
                    }}
                    onOpenChat={() => {
                        if (!isAssistantPanelOpen) setIsNodePanelOpen(false);
                        setIsAssistantPanelOpen(prev => !prev);
                    }}
                    isChatOpen={isAssistantPanelOpen}
                    isNodePanelOpen={isNodePanelOpen}
                />

                {/* Side panel: Node selector */}
                <NodeSelectorPanel
                    isOpen={isNodePanelOpen}
                    onClose={() => setIsNodePanelOpen(false)}
                    onDragStart={handleDragStart}
                />

                {/* Side panel: workflow assistant */}
                <AssistantPanel
                    isOpen={isAssistantPanelOpen}
                    onClose={() => setIsAssistantPanelOpen(false)}
                    messages={messages}
                    input={chatInput}
                    setInput={setChatInput}
                    onSend={() => sendMessage(chatInput)}
                    isTyping={isChatTyping}
                    suggestions={suggestedPrompts}
                    onSuggestionClick={sendMessage}
                />

                {/* Bottom-right controls */}
                <WorkflowControls
                    zoom={zoom}
                    setZoom={(zOrFn) => {
                        const nextZoom = typeof zOrFn === 'function' ? zOrFn(zoom) : zOrFn;
                        if (reactFlowInstanceRef.current) {
                            const vp = reactFlowInstanceRef.current.getViewport?.() || { x: pan.x, y: pan.y, zoom };
                            reactFlowInstanceRef.current.setViewport?.({ x: vp.x, y: vp.y, zoom: nextZoom }, { duration: 150 });
                        }
                        setZoom(nextZoom);
                    }}
                    onFitView={() => {
                        setZoom(1);
                        fitView();
                    }}
                    onAutoLayout={handleAutoLayout}
                    isPanning={isPanning}
                    setIsPanning={setIsPanning}
                    isPanelOpen={!!selectedNodeId}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    undoCount={pastCount}
                />

                {/* ── Canvas ─────────────────────────────────────────────── */}
                <div
                    ref={reactFlowWrapperRef}
                    className={[
                        'w-full h-full overflow-hidden bg-gray-50',
                        isPanning ? 'cursor-grab' : '',
                        isDragOver ? 'ring-4 ring-primary-200 bg-primary-50/30' : '',
                    ].join(' ')}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                >
                    <ReactFlow
                        nodes={nodes.map((n) => ({
                            ...n,
                            data: {
                                ...(n.data || {}),
                                isConfigOpen: configNodeId === n.id,
                                onConfigToggle: (nodeId) => handleConfigToggle(nodeId),
                                onDuplicate: () => {
                                    if (selectedNodeId !== n.id) setSelectedNodeId(n.id);
                                    setTimeout(() => {
                                        // ensure selectedNodeId is set
                                        const evt = new Event('duplicate');
                                        handleDuplicateSelected();
                                    }, 0);
                                },
                                onDelete: () => {
                                    if (selectedNodeId !== n.id) setSelectedNodeId(n.id);
                                    setShowDeleteConfirm(true);
                                },
                                onSelect: (nodeId) => setSelectedNodeId(nodeId),
                            },
                        }))}
                        edges={edges.map((e) => ({
                            ...e,
                            type: 'buttonEdge',
                            data: {
                                ...(e.data || {}),
                                label: e.label,
                                onDelete: (id) => handleEdgeDelete(id),
                            },
                        }))}
                        edgeTypes={edgeTypes}
                        nodeTypes={nodeTypes}
                        onInit={(instance) => {
                            reactFlowInstanceRef.current = instance;
                            const vp = instance.getViewport?.();
                            if (vp) {
                                setZoom(vp.zoom);
                                setPan({ x: vp.x, y: vp.y });
                            }
                        }}
                        onNodesChange={(changes) => {
                            setNodes((prev) => applyNodeChanges(changes, prev));
                        }}
                        onEdgesChange={(changes) => {
                            setEdges((prev) => applyEdgeChanges(changes, prev));
                        }}
                        onNodeClick={(_, node) => {
                            setSelectedNodeId(node.id);
                            setSelectedEdgeId(null);
                        }}
                        onPaneClick={() => {
                            setSelectedNodeId(null);
                            setSelectedEdgeId(null);
                        }}
                        onNodeDragStart={() => pushSnapshot()}
                        onConnectStart={() => pushSnapshot()}
                        onConnect={(params) => {
                            pushSnapshot();
                            setEdges((prev) => addEdge({ ...params, id: `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }, prev));
                        }}
                        onEdgeClick={(_, edge) => handleEdgeClick(edge.id)}
                        panOnDrag={isPanning}
                        zoomOnScroll={!isPanning}
                        zoomOnPinch={!isPanning}
                        selectionOnDrag={!isPanning}
                        onMove={(_, vp) => {
                            setZoom(vp.zoom);
                            setPan({ x: vp.x, y: vp.y });
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const raw = e.dataTransfer.getData('application/reactflow');
                            if (!raw || !reactFlowInstanceRef.current) return;
                            let item;
                            try {
                                item = JSON.parse(raw);
                            } catch {
                                return;
                            }
                            const position = reactFlowInstanceRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
                            const newId = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
                            const data = {
                                id: newId,
                                type: item.type,
                                kind: item.kind || item.type,
                                title: item.title,
                                icon: item.icon,
                                badge: item.badge,
                                description: item.description,
                                credentialRequired: item.credentialRequired,
                            };
                            pushSnapshot();
                            setNodes((prev) => [
                                ...prev,
                                {
                                    id: newId,
                                    type: 'canvasNode',
                                    position,
                                    data,
                                },
                            ]);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        fitView
                    >
                        <Background gap={16} size={1} color="#e5e7eb" />
                    </ReactFlow>
                </div>

                {/* Properties panel (right side, opens on node config) */}
                <PropertiesPanel
                    node={configNode}
                    nodes={canvasNodes}
                    edges={canvasEdges}
                    zoom={zoom}
                    pan={pan}
                    onClose={() => setConfigNodeId(null)}
                    onUpdate={handleUpdateNode}
                    onUpdatePaths={handleUpdatePaths}
                    onDuplicate={handleDuplicateSelected}
                    onDelete={() => setShowDeleteConfirm(true)}
                />

                {/* Delete confirmation dialog */}
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Delete Node"
                    message="Are you sure you want to delete this node? This action cannot be undone and will remove all connected edges."
                    onConfirm={handleConfirmDelete}
                    confirmLabel="Delete"
                    isDestructive={true}
                />

                {/* Success Dialog */}
                <ConfirmDialog
                    isOpen={showSuccessDialog}
                    onClose={() => setShowSuccessDialog(false)}
                    title="Success"
                    message="Workflow execution completed successfully!"
                    onConfirm={() => setShowSuccessDialog(false)}
                    confirmLabel="OK"
                    showCancel={false}
                    type="success"
                />

                {/* Error Dialog */}
                <ConfirmDialog
                    isOpen={showErrorDialog}
                    onClose={() => setShowErrorDialog(false)}
                    title="Execution Failed"
                    message={errorMessage || "An unknown error occurred during execution."}
                    onConfirm={() => setShowErrorDialog(false)}
                    confirmLabel="Close"
                    showCancel={false}
                    type="danger"
                />

                {/* Settings modal */}
                <Modal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    title="Workflow Settings"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div>
                                <h4 className="font-medium text-gray-900">Auto-Organize Layout</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Automatically arrange nodes when opening a new workflow.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const next = !autoOrganizeEnabled;
                                    setAutoOrganizeEnabled(next);
                                    localStorage.setItem('trae-workflow-pref-auto-organize', next);
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoOrganizeEnabled ? 'bg-primary-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoOrganizeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default WorkflowEditor;
