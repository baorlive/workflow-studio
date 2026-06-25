import React, { useState } from 'react';
import Icon from '../ui/Icon';
import FolderTree from './FolderTree';
import UserProfile from './UserProfile';
import CreateFolderModal from './CreateFolderModal';
import logo from '../../assets/workflow-logo.png';

/**
 * Sidebar Component
 *
 * Collapsible left navigation rail.
 * - Expanded  (default) : w-64 — logo, labels, folder tree, user profile
 * - Collapsed            : w-16 — icon-only strip with tooltips
 *
 * State is self-contained; parent (App.jsx) requires no changes.
 */
const Sidebar = ({
    selectedFolder,
    setSelectedFolder,
    isTemplatesView,
    onViewWorkflows,
    onViewTemplates,
    foldersWithCounts,
    onCreateFolder,
    onOpenSettings,
    onOpenDesignSystem,
    onOpenServers,
    onOpenContracts,
    isSettingsOpen,
    isDesignSystemOpen,
    isServersOpen,
    isContractsOpen,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

    /* ── Nav item helpers ──────────────────────────────────────────────────── */
    const isWorkflowsActive = !isTemplatesView && !isSettingsOpen && !isDesignSystemOpen && !isServersOpen && !isContractsOpen;

    // Shared class for each nav button
    const navBtn = (active) =>
        `w-full flex items-center gap-2 px-2 py-2 rounded-md font-bold text-sm transition-all duration-200 border-l-4 ${active
            ? 'bg-primary-50 text-primary-700 border-primary-500'
            : 'hover:bg-[var(--color-surface)] text-[var(--color-text)] border-transparent'
        }`;

    // Icon-only pill used when collapsed
    const iconBtn = (active) =>
        `w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${active
            ? 'bg-primary-50 text-primary-600'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
        }`;

    return (
        <>
            <aside
                className={`bg-[var(--color-surface-elevated)] border-r border-[var(--color-border)] flex flex-col shrink-0 overflow-hidden h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'
                    }`}
                aria-label="Main navigation"
            >
                {/* ── Logo row + toggle ──────────────────────────────────────── */}
                <div className={`shrink-0 flex items-center border-b border-gray-100 transition-all duration-300 ${isCollapsed ? 'flex-col gap-2 py-4 px-2' : 'flex-row justify-between px-5 py-4'
                    }`}>
                    {/* Logo / monogram */}
                    <img
                        src={logo}
                        alt="Workflow Studio"
                        className={`object-contain shrink-0 ${isCollapsed ? 'h-6 w-10' : 'h-7 min-w-0'}`}
                    />

                    {/* Toggle chevron — right side when expanded, below monogram when collapsed */}
                    <button
                        onClick={() => setIsCollapsed(prev => !prev)}
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-primary-100 hover:text-primary-600 hover:border-primary-300 transition-all duration-200 shrink-0"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!isCollapsed}
                    >
                        <Icon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} size={13} />
                    </button>
                </div>

                {/* ── Scrollable nav area ───────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {isCollapsed ? (
                        /* ── COLLAPSED: icon-only rail ── */
                        <div className="flex flex-col items-center gap-1 px-3 pt-2">
                            {/* All Workflows */}
                            <button
                                onClick={() => {
                                    setSelectedFolder(null);
                                    if (onViewWorkflows) onViewWorkflows();
                                }}
                                className={iconBtn(isWorkflowsActive)}
                                title="All Workflows"
                                aria-label="All Workflows"
                            >
                                <Icon name="grid" size={18} />
                            </button>

                            {/* Templates */}
                            <button
                                onClick={onViewTemplates}
                                className={iconBtn(isTemplatesView)}
                                title="Template Solutions"
                                aria-label="Template Solutions"
                            >
                                <Icon name="layoutTemplate" size={18} />
                            </button>

                            {/* Servers */}
                            <button
                                onClick={onOpenServers}
                                className={iconBtn(isServersOpen)}
                                title="Servers"
                                aria-label="Servers"
                            >
                                <Icon name="server" size={18} />
                            </button>

                            {/* My Contracts */}
                            <button
                                onClick={onOpenContracts}
                                className={iconBtn(isContractsOpen)}
                                title="My Contracts"
                                aria-label="My Contracts"
                            >
                                <Icon name="fileCode" size={18} />
                            </button>

                            {/* Divider */}
                            <div className="w-8 h-px bg-gray-200 my-1" />

                            {/* Settings */}
                            <button
                                onClick={onOpenSettings}
                                className={iconBtn(isSettingsOpen)}
                                title="Settings"
                                aria-label="Settings"
                            >
                                <Icon name="settings" size={18} />
                            </button>

                        </div>
                    ) : (
                        /* ── EXPANDED: full nav ── */
                        <div className="p-4 pt-6">
                            <div className="space-y-1">
                                {/* All Workflows */}
                                <button
                                    onClick={() => {
                                        setSelectedFolder(null);
                                        if (onViewWorkflows) onViewWorkflows();
                                    }}
                                    className={navBtn(isWorkflowsActive)}
                                >
                                    <Icon name="grid" size={16} />
                                    <span>All Workflows</span>
                                </button>

                                {/* Folder tree — hidden when Templates view active */}
                                <div
                                    className={`transition-all duration-200 ease-out overflow-hidden ${isTemplatesView
                                        ? 'opacity-0 max-h-0 pointer-events-none'
                                        : 'opacity-100 max-h-80 pt-2 pb-2'
                                        }`}
                                >
                                    <div className="flex items-center justify-between pl-3 pr-2 mb-1 group">
                                        <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                            Folders
                                        </h3>
                                        <button
                                            onClick={() => setIsCreateFolderModalOpen(true)}
                                            className="p-1 hover:bg-[var(--color-surface)] rounded text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] transition-colors"
                                            aria-label="Create new folder"
                                        >
                                            <Icon name="plus" size={14} />
                                        </button>
                                    </div>
                                    <FolderTree
                                        folders={foldersWithCounts}
                                        onSelect={setSelectedFolder}
                                        selectedId={selectedFolder?.id}
                                    />
                                </div>

                                {/* Templates */}
                                <button
                                    onClick={onViewTemplates}
                                    className={`mt-2 ${navBtn(isTemplatesView)}`}
                                >
                                    <Icon name="layoutTemplate" size={16} />
                                    <span>Template Solutions</span>
                                </button>

                                {/* Servers */}
                                <button
                                    onClick={onOpenServers}
                                    className={navBtn(isServersOpen)}
                                >
                                    <Icon name="server" size={16} />
                                    <span>Servers</span>
                                </button>

                                {/* My Contracts */}
                                <button
                                    onClick={onOpenContracts}
                                    className={navBtn(isContractsOpen)}
                                >
                                    <Icon name="fileCode" size={16} />
                                    <span>My Contracts</span>
                                </button>

                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer: User Profile ──────────────────────────────────── */}
                <div className={`shrink-0 border-t border-gray-100 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                    {isCollapsed ? (
                        /* Collapsed: avatar icon only */
                        <button
                            onClick={onOpenSettings}
                            className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-all"
                            title="User settings"
                            aria-label="User settings"
                        >
                            <Icon name="user" size={18} />
                        </button>
                    ) : (
                        <UserProfile onOpenSettings={onOpenSettings} />
                    )}
                </div>
            </aside>

            {/* ── Create Folder Modal ───────────────────────────────────────── */}
            {isCreateFolderModalOpen && (
                <CreateFolderModal
                    onClose={() => setIsCreateFolderModalOpen(false)}
                    onCreate={(name) => {
                        onCreateFolder(name);
                        setIsCreateFolderModalOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default Sidebar;
