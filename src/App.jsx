import React, { useState, useEffect } from 'react';
import { ShareModal } from '@components/ui/ShareModal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import WorkspaceDashboard from '@components/workspace/WorkspaceDashboard';
import Sidebar from '@components/workspace/Sidebar';
import WorkflowEditor from '@components/workflow/WorkflowEditor';
import AccountSettings from '@components/settings/AccountSettings';
import ServersPage from '@components/servers/ServersPage';
import ContractsPage from '@components/contracts/ContractsPage';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { useKeyboard } from '@hooks/useKeyboard';
import { mockWorkflows } from '@data/mockWorkflows';
import { mockFolders } from '@data/mockFolders';
import { mockServers } from '@data/mockServers';
import { mockContracts } from '@data/mockContracts';
import { calculateFolderCounts } from './features/workspace/services/folderService';
import Login from '@components/auth/Login';
import DesignSystem from './design-system';

/**
 * App — Root Component
 *
 * Owns global state: active view, workflow list, selected workflow, modals.
 * Canvas node/edge state lives inside WorkflowEditor (via useHistory + hooks).
 */
function App() {
    // ── Auth Guard ─────────────────────────────────────────────────────────
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('token');

            const isValidJwt = (t) => /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(t);

            if (urlToken && isValidJwt(urlToken)) {
                localStorage.setItem('authToken', urlToken);
                window.history.replaceState({}, document.title, window.location.pathname);
                setIsAuthenticated(true);
            } else {
                const storedToken = localStorage.getItem('authToken');
                if (storedToken) {
                    setIsAuthenticated(true);
                }
            }
            setIsAuthLoading(false);
        };

        // checkAuth(); // Bypass for dev
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
    };

    // ── View state ─────────────────────────────────────────────────────────
    const [activeView, setActiveView] = useState('workflow'); // 'workspace' | 'workflow' | 'settings' | 'design-system'
    const [workspaceMode, setWorkspaceMode] = useState('workflows'); // 'workflows' | 'templates'

    // ── Workflow list ──────────────────────────────────────────────────────
    const [workflows, setWorkflows] = useState(mockWorkflows);
    const [selectedWorkflow, setSelectedWorkflow] = useState(mockWorkflows[0]);

    const [folders, setFolders] = useState(mockFolders);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const foldersWithCounts = React.useMemo(() => {
        return calculateFolderCounts(folders, workflows);
    }, [folders, workflows]);

    const handleCreateFolder = (name) => {
        const newFolder = {
            id: `f-${Date.now()}`,
            name,
            count: 0,
            children: [],
        };
        setFolders(prev => [...prev, newFolder]);
    };

    // ── Modal state ────────────────────────────────────────────────────────
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState(null);

    // ── Keyboard shortcuts (global) ────────────────────────────────────────
    useKeyboard({
        'ctrl+s': (e) => {
            e.preventDefault();
            // Ctrl+S in workflow view is handled inside WorkflowEditor
        },
    });

    // ── Workflow handlers ──────────────────────────────────────────────────
    const handleCreateBlankWorkflow = () => {
        const newWorkflow = {
            id: Date.now().toString(),
            name: 'New Workflow',
            status: 'Draft',
            type: 'Blank',
            icons: ['zap'],
            tags: [],
            date: 'Just now'
        };
        setWorkflows(prev => [newWorkflow, ...prev]);
        setSelectedWorkflow(newWorkflow);
        setActiveView('workflow');
    };

    const handleStartBuild = async (prompt) => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // simulate generation
        const newWorkflow = {
            id: Date.now().toString(),
            name: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
            status: 'Draft',
            type: 'Automation',
            icons: ['bot', 'zap', 'send'],
            date: 'Just now',
            tags: ['generated'],
        };
        setWorkflows(prev => [newWorkflow, ...prev]);
        setSelectedWorkflow(newWorkflow);
        setActiveView('workflow');
    };

    const handleEditWorkflow = (workflow) => {
        setSelectedWorkflow(workflow);
        setActiveView('workflow');
    };

    const handleShareWorkflow = (workflow) => {
        setSelectedWorkflow(workflow);
        setShareModalOpen(true);
    };

    const handleDuplicateWorkflow = (workflow) => {
        const duplicated = {
            ...workflow,
            id: Date.now().toString(),
            name: workflow.name + ' (Copy)',
            date: 'Just now',
        };
        setWorkflows(prev => [duplicated, ...prev]);
    };

    const handleDeleteWorkflow = (workflow) => {
        setWorkflowToDelete(workflow);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = () => {
        if (workflowToDelete) {
            setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id));
            setWorkflowToDelete(null);
        }
        setConfirmDialogOpen(false);
    };

    const handleSaveWorkflow = (workflowId) => {
        setWorkflows(prev =>
            prev.map(w =>
                w.id === workflowId
                    ? { ...w, date: 'Just now', status: 'Working in Progress' }
                    : w
            )
        );
    };

    const handleMoveWorkflow = (workflowId, folderId) => {
        setWorkflows(prev =>
            prev.map(w => w.id === workflowId ? { ...w, folderId } : w)
        );
    };

    // ── View rendering ─────────────────────────────────────────────────────
    const renderView = () => {
        if (activeView === 'workflow') {
            return (
                <ErrorBoundary>
                    <WorkflowEditor
                        key={selectedWorkflow?.id}
                        workflow={selectedWorkflow}
                        folders={folders}
                        onSave={() => handleSaveWorkflow(selectedWorkflow?.id)}
                        onShare={() => handleShareWorkflow(selectedWorkflow)}
                        onBack={() => {
                            setWorkspaceMode('workflows');
                            setActiveView('workspace');
                        }}
                    />
                </ErrorBoundary>
            );
        }

        const content = activeView === 'settings' ? (
            <AccountSettings
                onBack={() => {
                    setWorkspaceMode('workflows');
                    setActiveView('workspace');
                }}
            />
        ) : activeView === 'servers' ? (
            <ServersPage initialServers={mockServers} />
        ) : activeView === 'contracts' ? (
            <ContractsPage initialContracts={mockContracts} />
        ) : activeView === 'design-system' ? (
            <DesignSystem
                onBack={() => {
                    setWorkspaceMode('workflows');
                    setActiveView('workspace');
                }}
            />
        ) : (
            <ErrorBoundary>
                <WorkspaceDashboard
                    workflows={workflows}
                    onStartBuild={handleStartBuild}
                    onEditWorkflow={handleEditWorkflow}
                    onShareWorkflow={handleShareWorkflow}
                    onDuplicateWorkflow={handleDuplicateWorkflow}
                    onDeleteWorkflow={handleDeleteWorkflow}
                    onMoveWorkflow={handleMoveWorkflow}
                    onCreateBlankWorkflow={handleCreateBlankWorkflow}
                    onViewTemplates={() => {
                        setWorkspaceMode('templates');
                        setActiveView('workspace');
                    }}
                    onViewWorkflows={() => setWorkspaceMode('workflows')}
                    onOpenSettings={() => setActiveView('settings')}
                    mode={workspaceMode}
                    folders={folders}
                    setFolders={setFolders}
                    selectedFolder={selectedFolder}
                    setSelectedFolder={setSelectedFolder}
                />
            </ErrorBoundary>
        );

        return (
            <div className="flex h-full overflow-hidden">
                <Sidebar
                    selectedFolder={selectedFolder}
                    setSelectedFolder={setSelectedFolder}
                    isTemplatesView={workspaceMode === 'templates'}
                    isSettingsOpen={activeView === 'settings'}
                    isDesignSystemOpen={activeView === 'design-system'}
                    isServersOpen={activeView === 'servers'}
                    isContractsOpen={activeView === 'contracts'}
                    onOpenContracts={() => { setWorkspaceMode('workflows'); setActiveView('contracts'); }}
                    onViewWorkflows={() => {
                        setWorkspaceMode('workflows');
                        setActiveView('workspace');
                    }}
                    onViewTemplates={() => {
                        setWorkspaceMode('templates');
                        setActiveView('workspace');
                    }}
                    foldersWithCounts={foldersWithCounts}
                    onCreateFolder={handleCreateFolder}
                    onOpenSettings={() => { setWorkspaceMode('workflows'); setActiveView('settings'); }}
                    onOpenDesignSystem={() => { setWorkspaceMode('workflows'); setActiveView('design-system'); }}
                    onOpenServers={() => { setWorkspaceMode('workflows'); setActiveView('servers'); }}
                />
                <div className="flex-1 overflow-hidden relative">
                    {content}
                </div>
            </div>
        );
    };

    return (
        <ToastProvider>
            <div className="h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)] overflow-hidden">
                {isAuthLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : !isAuthenticated ? (
                    <Login onLogin={handleLogin} />
                ) : (
                    <>
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {renderView()}
                        </div>

                        <ShareModal
                            isOpen={shareModalOpen}
                            onClose={() => setShareModalOpen(false)}
                            workflowName={selectedWorkflow?.name || 'Workflow'}
                        />

                        <ConfirmDialog
                            isOpen={confirmDialogOpen}
                            onClose={() => setConfirmDialogOpen(false)}
                            title="Delete Workflow"
                            message={`Are you sure you want to delete "${workflowToDelete?.name}"? This action cannot be undone.`}
                            onConfirm={confirmDelete}
                            confirmLabel="Delete"
                            cancelLabel="Cancel"
                            isDestructive
                        />
                    </>
                )}
            </div>
        </ToastProvider>
    );
}

export default App;
