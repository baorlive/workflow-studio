import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { Dropdown } from '../ui/Dropdown';

/**
 * TopNavBar Component - Top navigation with project name, undo/redo, save, run
 */
const TopNavBar = ({ folderName, workflowName, onNameChange, onUndo, onRedo, canUndo, canRedo, onSave, onSaveTemplate, onShare, onRun, onSettings, saveStatus, isRunning, onBack, onExport, undoCount = 0 }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(workflowName);
    const [nameError, setNameError] = useState('');

    // Sync tempName if workflowName changes externally (e.g. from the assistant panel)
    useEffect(() => { setTempName(workflowName); }, [workflowName]);

    // Auto-fade 'saved' indicator after 3s
    const [showSaved, setShowSaved] = useState(false);
    useEffect(() => {
        if (saveStatus === 'saved') {
            setShowSaved(true);
            const t = setTimeout(() => setShowSaved(false), 3000);
            return () => clearTimeout(t);
        }
    }, [saveStatus]);

    const handleNameSubmit = () => {
        const trimmed = tempName.trim();

        if (!trimmed) {
            setTempName(workflowName);
            setIsEditing(false);
            setNameError('');
            return;
        }

        if (trimmed.length > 50) {
            setNameError('Max 50 chars');
            return;
        }

        const hasInvalidChars = /[<>:"/\\|?*]/.test(trimmed);
        const hasControlChars = [...trimmed].some((ch) => ch.charCodeAt(0) < 32);

        if (hasInvalidChars || hasControlChars) {
            setNameError('Name contains invalid characters');
            return;
        }

        onNameChange(trimmed);
        setIsEditing(false);
        setNameError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleNameSubmit();
        if (e.key === 'Escape') {
            setTempName(workflowName);
            setIsEditing(false);
            setNameError('');
        }
    };

    return (
        <div className="h-16 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] flex items-center justify-between px-4 z-40 relative shadow-sm shrink-0 gap-4">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-colors shrink-0"
                title="Back to Dashboard"
            >
                <Icon name="arrowLeft" size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            {/* Left: Project Info */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="relative group min-w-0 flex items-center gap-2">
                    {/* Folder Name */}
                    <div className="flex items-center gap-2 shrink-0 min-w-0">
                        {folderName === 'Draft' ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
                                <Icon name="fileText" size={14} className="text-[var(--color-text-subtle)] shrink-0" />
                                <span className="font-bold text-[var(--color-text-muted)] text-sm uppercase tracking-wider truncate">Draft</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                                <Icon name="folder" size={14} className="text-[var(--color-text-subtle)] shrink-0" />
                                <span className="font-medium text-[var(--color-text-muted)] text-sm uppercase tracking-wider truncate">
                                    {folderName}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Separator */}
                    <span className="text-[var(--color-text-subtle)] font-medium">/</span>

                    {/* Workflow Name - Editable */}
                    {isEditing ? (
                        <div className="relative flex-1 min-w-0">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => {
                                    setTempName(e.target.value);
                                    if (nameError) setNameError('');
                                }}
                                onBlur={handleNameSubmit}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className={`font-semibold text-[var(--color-text)] text-base sm:text-lg px-2 py-1 border rounded-md focus:outline-none focus:ring-2 w-full ${nameError ? 'border-red-500 focus:ring-red-200' : 'border-primary-300 focus:ring-primary-100'}`}
                            />
                            {nameError && (
                                <div className="absolute top-full left-0 mt-1 text-sm text-red-500 bg-[var(--color-surface-elevated)] px-2 py-1 rounded shadow-md border border-red-100 z-50 whitespace-nowrap">
                                    {nameError}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div role="group" aria-label="Workflow name" className="flex-1 min-w-0">
                            <button
                                onClick={() => { setTempName(workflowName); setIsEditing(true); }}
                                aria-label={`Rename workflow: ${workflowName}`}
                                className="font-semibold text-[var(--color-text)] text-base sm:text-lg px-2 py-1 rounded-md hover:bg-[var(--color-surface)] cursor-text transition-colors truncate flex items-center gap-2 w-full text-left min-w-0"
                            >
                                <span role="heading" aria-level={1} className="truncate">{workflowName}</span>
                                <Icon name="edit" size={14} className="opacity-0 group-hover:opacity-100 text-[var(--color-text-subtle)] transition-opacity shrink-0" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Save Status Indicator */}
                <div className="hidden lg:flex items-center gap-1.5 px-3">
                    {saveStatus === 'saving' && <Icon name="loader" size={14} className="animate-spin text-[var(--color-text-subtle)]" />}
                    {showSaved && <Icon name="check" size={14} className="text-green-500" />}
                    {saveStatus === 'unsaved' && <div className="w-2 h-2 rounded-full bg-amber-400"></div>}
                    <span className="text-sm font-medium text-[var(--color-text-muted)] capitalize">
                        {saveStatus === 'unsaved' ? 'Unsaved changes' : saveStatus === 'saving' ? 'Saving...' : showSaved ? 'Auto-saved' : ''}
                    </span>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1 hidden lg:block"></div>

                {/* Main Action Group: Share, Save, Run */}
                <div className="flex items-center gap-2 ml-1" role="group" aria-label="Workflow Actions">
                    {/* Share */}
                    <button
                        onClick={onShare}
                        className="h-10 px-3 sm:px-4 bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg transition-all shadow-sm flex items-center gap-2 font-medium text-sm"
                        title="Share Workflow"
                        aria-label="Share Workflow"
                    >
                        <Icon name="share2" size={18} />
                        <span className="hidden sm:inline">Share</span>
                    </button>

                    {/* Save Group */}
                    <Dropdown
                        trigger={
                            <button
                                className="h-10 px-3 sm:px-4 bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-lg transition-all shadow-sm flex items-center gap-2 font-medium text-sm"
                                title="Save Options"
                                aria-label="Save Options"
                            >
                                <Icon name="save" size={18} />
                                <span className="hidden sm:inline">Save</span>
                                <Icon name="chevronDown" size={14} className="text-[var(--color-text-subtle)]" />
                            </button>
                        }
                        items={[
                            { label: 'Save Workflow', icon: 'save', onClick: onSave },
                            { label: 'Save as Template', icon: 'layout', onClick: onSaveTemplate || (() => { }) },
                            { label: 'Export Workflow', icon: 'download', onClick: onExport || (() => { }) }
                        ]}
                    />

                    {/* Run - Primary CTA */}
                    <button
                        onClick={onRun}
                        disabled={isRunning}
                        className={`h-10 px-4 sm:px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-bold text-sm active:scale-95 ${isRunning ? 'opacity-75 cursor-wait' : ''}`}
                        title="Run Workflow"
                        aria-label="Run Workflow"
                    >
                        {isRunning ? <Icon name="loader" size={18} className="animate-spin" /> : <Icon name="play" size={18} className="fill-current" />}
                        <span>{isRunning ? 'Running...' : 'Run'}</span>
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-1 hidden lg:block"></div>

                    {/* Settings - Secondary Action */}
                    <button
                        onClick={onSettings}
                        className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] rounded-lg transition-colors"
                        title="Settings"
                        aria-label="Settings"
                    >
                        <Icon name="moreVertical" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopNavBar;
