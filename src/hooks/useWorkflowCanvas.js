import { useState, useRef, useCallback, useEffect } from 'react';
import { WORKFLOW_CANVAS } from '../constants/workflow';

/**
 * Custom hook for managing workflow canvas state and interactions.
 *
 * ### Pan optimisation (fix #1)
 * During a pan gesture we update a `ref` on every mousemove and apply the
 * CSS transform directly to the inner content element via `innerRef`. React
 * state (`pan`) is only flushed on mouseUp. This cuts React re-renders during
 * drag from one-per-frame down to one total.
 */
export const useWorkflowCanvas = () => {
    const [zoom, setZoom] = useState(WORKFLOW_CANVAS.DEFAULT_ZOOM);
    // `pan` is the *committed* pan value — written only on mouseUp / wheel / fitView.
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Refs for drag — mutated without triggering renders
    const canvasRef = useRef(null);   // the outer scroll / event container
    const innerRef = useRef(null);   // the transformed content div
    const zoomRef = useRef(zoom);
    const panRef = useRef(pan);

    // Drag-specific refs (never cause a render)
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    // Keep zoom ref in sync with state
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    // Keep pan ref in sync with committed state (but NOT during active drag)
    useEffect(() => { if (!isDraggingRef.current) panRef.current = pan; }, [pan]);

    /** Apply transform directly to DOM — zero React renders. */
    const applyTransform = useCallback((p, z) => {
        const el = innerRef.current;
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${z ?? zoomRef.current})`;
    }, []);

    // ── Wheel → zoom toward cursor ─────────────────────────────────────────
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const currentZoom = zoomRef.current;
        const currentPan = panRef.current;
        const rect = canvasRef.current.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const factor = 1 - e.deltaY * WORKFLOW_CANVAS.ZOOM_SENSITIVITY;
        let newZoom = Math.min(
            Math.max(WORKFLOW_CANVAS.MIN_ZOOM, currentZoom * factor),
            WORKFLOW_CANVAS.MAX_ZOOM
        );

        const newPan = {
            x: mouseX - ((mouseX - currentPan.x) / currentZoom) * newZoom,
            y: mouseY - ((mouseY - currentPan.y) / currentZoom) * newZoom,
        };

        zoomRef.current = newZoom;
        panRef.current = newPan;
        applyTransform(newPan, newZoom);

        // Commit to state so React-rendered nodes align
        setZoom(newZoom);
        setPan(newPan);
    }, [applyTransform]);

    // ── Pan: mouseDown ─────────────────────────────────────────────────────
    const handleCanvasMouseDown = useCallback((e) => {
        if (!isPanning) return;
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, [isPanning]);

    // ── Pan: mouseMove — ref-only, zero state updates ──────────────────────
    const handleCanvasMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };

        const next = {
            x: panRef.current.x + dx,
            y: panRef.current.y + dy,
        };
        panRef.current = next;
        applyTransform(next);   // direct DOM update — no React render
    }, [applyTransform]);

    // ── Pan: mouseUp — single state flush ──────────────────────────────────
    const handleCanvasMouseUp = useCallback(() => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        // Flush accumulated pan into React state exactly once
        setPan({ ...panRef.current });
    }, []);

    // ── Drag-over (node drop) ──────────────────────────────────────────────
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragOver(false), []);

    // ── Fit view ───────────────────────────────────────────────────────────
    const fitView = useCallback((nodes) => {
        if (!nodes || nodes.length === 0 || !canvasRef.current) {
            zoomRef.current = 1;
            panRef.current = { x: 0, y: 0 };
            setZoom(1);
            setPan({ x: 0, y: 0 });
            applyTransform({ x: 0, y: 0 }, 1);
            return;
        }

        const PADDING = 50;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x + WORKFLOW_CANVAS.NODE_WIDTH);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y + WORKFLOW_CANVAS.NODE_HEIGHT);
        });

        const rect = canvasRef.current.getBoundingClientRect();
        const cW = maxX - minX + PADDING * 2;
        const cH = maxY - minY + PADDING * 2;
        let newZoom = Math.min(rect.width / cW, rect.height / cH);
        newZoom = Math.min(Math.max(0.1, newZoom), 2.0);

        const newPan = {
            x: rect.width / 2 - (minX + (maxX - minX) / 2) * newZoom,
            y: rect.height / 2 - (minY + (maxY - minY) / 2) * newZoom,
        };

        zoomRef.current = newZoom;
        panRef.current = newPan;
        applyTransform(newPan, newZoom);
        setZoom(newZoom);
        setPan(newPan);
    }, [applyTransform]);

    return {
        // State (committed values — safe to use in React render)
        zoom, pan, isPanning, isDragOver,
        // Refs
        canvasRef, innerRef, zoomRef, panRef,
        // Setters
        setZoom, setPan, setIsPanning, setIsDragOver,
        // Handlers
        handleWheel,
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        handleDragOver,
        handleDragLeave,
        fitView,
    };
};
