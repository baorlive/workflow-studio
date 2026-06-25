import React from 'react';
import Icon from '../ui/Icon';

/**
 * WorkflowControls Component - Bottom right controls (pan, auto-layout, fit view, zoom)
 */
const WorkflowControls = ({ zoom, setZoom, onFitView, onAutoLayout, isPanning, setIsPanning, onUndo, onRedo, canUndo, canRedo, undoCount = 0 }) => {
    return (
        <>
            {/* Left Controls: Undo/Redo */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 z-50">
                <div className="bg-[var(--color-surface-elevated)] p-1 rounded-lg shadow-lg border border-[var(--color-border)] flex items-center gap-1">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`p-2 rounded-md transition-all ${canUndo ? 'hover:bg-[var(--color-surface)] text-[var(--color-text)]' : 'text-[var(--color-text-subtle)] cursor-not-allowed'}`}
                        title={`Undo (Ctrl+Z) — ${undoCount}/50 steps`}
                        aria-label={`Undo, ${undoCount} of 50 steps available`}
                    >
                        <Icon name="rotateCcw" size={18} />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`p-2 rounded-md transition-all ${canRedo ? 'hover:bg-[var(--color-surface)] text-[var(--color-text)]' : 'text-[var(--color-text-subtle)] cursor-not-allowed'}`}
                        title="Redo (Ctrl+Y)"
                        aria-label="Redo"
                    >
                        <Icon name="rotateCw" size={18} />
                    </button>
                </div>
            </div>

            {/* Right Controls: Pan/Zoom */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 z-50">
                <div className="bg-[var(--color-surface-elevated)] p-1 rounded-lg shadow-lg border border-[var(--color-border)] flex items-center gap-1">
                    <button
                        className={`p-2 rounded-md transition-all ${isPanning ? 'bg-primary-100 text-primary-600' : 'hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]'}`}
                        onClick={() => setIsPanning(!isPanning)}
                        title="Toggle Pan (Space)"
                        aria-label="Toggle pan mode"
                        aria-pressed={isPanning}
                    >
                        <Icon name="move" size={18} />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button
                        className="p-2 hover:bg-[var(--color-surface)] rounded-md transition-colors text-[var(--color-text-muted)]"
                        onClick={onAutoLayout}
                        title="Auto Organize"
                        aria-label="Auto organize layout"
                    >
                        <Icon name="workflow" size={18} />
                    </button>
                    <button
                        className="p-2 hover:bg-[var(--color-surface)] rounded-md transition-colors text-[var(--color-text-muted)]"
                        onClick={onFitView}
                        title="Scale to Fit"
                        aria-label="Fit view to canvas"
                    >
                        <Icon name="maximize" size={18} />
                    </button>
                </div>

                <div className="bg-[var(--color-surface-elevated)] p-1 rounded-lg shadow-lg border border-[var(--color-border)] flex items-center gap-1">
                    <button
                        className="p-2 hover:bg-[var(--color-surface)] rounded-md transition-colors text-[var(--color-text-muted)]"
                        onClick={() => setZoom(z => Math.max(0.25, z - 0.1))}
                        title="Zoom Out"
                        aria-label="Zoom out"
                    >
                        <Icon name="minus" size={18} />
                    </button>
                    <span
                        className="text-sm font-medium text-[var(--color-text)] w-12 text-center select-none"
                        aria-label={`Zoom level ${Math.round(zoom * 100)} percent`}
                    >
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        className="p-2 hover:bg-[var(--color-surface)] rounded-md transition-colors text-[var(--color-text-muted)]"
                        onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                        title="Zoom In"
                        aria-label="Zoom in"
                    >
                        <Icon name="plus" size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default WorkflowControls;
