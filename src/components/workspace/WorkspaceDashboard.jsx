import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon';
import WorkflowCard from './WorkflowCard';
import FilterDropdown from './FilterDropdown';
import PricingModal from '../ui/PricingModal';
import TemplateSolutionPage from '../templates/TemplateSolutionPage';
import { mockFolders } from '../../data/mockFolders';
import { findFolderName } from '../../features/workspace/services/folderService';
import { useWorkspaceFilters } from '../../features/workspace/hooks/useWorkspaceFilters';
import useTypewriter from '../../hooks/useTypewriter';

const DEMO_PROMPTS = [
    "Describe the workflow you want to build (e.g., 'Monitor ETH price and alert me on Telegram')...",
    "Create an email automation workflow to check for important messages...",
    "Review form submissions, route them by priority, and notify the right team..."
];

const WorkspaceDashboard = ({
    onStartBuild,
    workflows,
    onEditWorkflow,
    onShareWorkflow,
    onDuplicateWorkflow,
    onDeleteWorkflow,
    onMoveWorkflow,
    onCreateBlankWorkflow,
    onViewTemplates,
    onViewWorkflows,
    onOpenSettings,
    mode = 'workspace',
    folders,
    setFolders,
    selectedFolder,
    setSelectedFolder,
}) => {
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    const isTemplatesView = mode === 'templates';

    const {
        search, setSearch,
        filter, setFilter,
        nodeFilter, setNodeFilter,
        sortOrder, setSortOrder,
        currentPage, setCurrentPage,
        foldersWithCounts,
        filteredWorkflows,
        paginatedWorkflows,
        totalPages,
        clearFilters
    } = useWorkspaceFilters(workflows, mockFolders, {
        folders, setFolders, selectedFolder, setSelectedFolder
    });

    const { text: placeholderText } = useTypewriter(DEMO_PROMPTS, {
        typingSpeed: 50,
        deletingSpeed: 25,
        pauseDuration: 2500,
        enabled: !input, // Stop animation when user types
        cursorChar: '|'
    });

    const handleStartBuild = async () => {
        if (input.trim()) {
            setIsGenerating(true);
            try {
                await onStartBuild(input);
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handlePrevPage = useCallback(() => setCurrentPage(p => Math.max(p - 1, 1)), [setCurrentPage]);
    const handleNextPage = useCallback((total) => setCurrentPage(p => Math.min(p + 1, total)), [setCurrentPage]);
    const handleGoToPage = useCallback((page) => setCurrentPage(page), [setCurrentPage]);

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50 overflow-hidden relative">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    {!isTemplatesView ? (
                        <div className="px-8 pt-8 pb-0 max-w-[1920px] mx-auto w-full relative z-0">
                            {/* Header Section */}
                            <div className="text-center mb-10 relative z-10 mt-16 flex flex-col items-center">
                                <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-2 text-center dashboard-main-title">
                                    {selectedFolder ? selectedFolder.name : "Workflow Studio"}
                                </h1>
                                {!selectedFolder && (
                                    <>
                                        <p className="text-gray-500 mb-8 text-lg text-center">Automate workflows, coordinate systems, and ship reliable operations faster.</p>

                                        <div className="flex items-center gap-4 mb-10">
                                            <button
                                                onClick={onCreateBlankWorkflow}
                                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <Icon name="plus" size={18} />
                                                <span>Create from Blank</span>
                                            </button>
                                            <button
                                                onClick={onViewTemplates}
                                                className="flex items-center gap-2 px-6 py-3 bg-primary-600 rounded-xl text-white font-semibold hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <Icon name="layoutTemplate" size={18} />
                                                <span>Start with Template</span>
                                            </button>
                                    <button
                                        onClick={() => setShowPricing(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-primary-200 text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-sm hover:shadow-md"
                                        aria-label="View Pricing"
                                    >
                                        <Icon name="tag" size={18} />
                                        <span>Pricing</span>
                                    </button>
                                        </div>

                                        {/* Workflow Generator Card */}
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-1 w-full max-w-4xl mx-auto transition-all hover:shadow-xl hover:border-primary-100 group">
                                            <div className="px-4 py-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1 bg-primary-50 rounded text-primary-600 group-hover:scale-110 transition-transform">
                                                        <Icon name="bot" size={14} />
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider group-hover:text-primary-600 transition-colors">Workflow Generator</p>
                                                </div>
                                                <textarea
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    placeholder={placeholderText}
                                                    className="w-full text-lg text-gray-900 placeholder-gray-400 resize-none focus:outline-none min-h-[100px]"
                                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleStartBuild())}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-50">
                                                <div className="flex gap-2">
                                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none">
                                                        <Icon name="zap" size={14} /> Refine Request
                                                    </button>

                                                    <button
                                                        onClick={() => setInput("Create an email automation workflow to check for important messages and reply automatically.")}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
                                                    >
                                                        <Icon name="layoutTemplate" size={14} /> Try Sample Prompt
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleStartBuild}
                                                    disabled={!input.trim() || isGenerating}
                                                    className={`relative overflow-hidden transition-all duration-300 ease-out rounded-lg flex items-center justify-center h-10 ${!input.trim()
                                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed px-4'
                                                        : isGenerating
                                                            ? 'bg-primary-600 text-white shadow-md cursor-wait px-6 w-48'
                                                            : 'bg-primary-600 text-white shadow-md hover:shadow-lg hover:bg-primary-700 px-6'
                                                        }`}
                                                >
                                                    <div className={`flex items-center gap-2 transition-all duration-300 ${isGenerating ? 'opacity-0 translate-y-4 absolute' : 'opacity-100 translate-y-0'}`}>
                                                        <Icon name="send" size={16} />
                                                        <span className="font-medium text-sm">Generate Workflow</span>
                                                    </div>

                                                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isGenerating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                                                        <Icon name="loader" size={20} className="animate-spin" />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />

                            {/* Workflow List Header */}
                            {!selectedFolder && (
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 text-left">Recently Edited Workflows</h2>
                                </div>
                            )}

                            {/* Search and Filters */}
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="relative w-64">
                                        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search workflow..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <FilterDropdown
                                            label="Status"
                                            value={filter}
                                            onChange={setFilter}
                                            options={[
                                                { value: 'All', label: 'All' },
                                                { value: 'Working in Progress', label: 'Working in Progress' },
                                                { value: 'Deployed', label: 'Deployed' }
                                            ]}
                                        />
                                        <FilterDropdown
                                            label="Contains Node"
                                            value={nodeFilter}
                                            onChange={setNodeFilter}
                                            options={[
                                                { value: 'All', label: 'All Nodes' },
                                                { value: 'bot', label: 'Bot' },
                                                { value: 'zap', label: 'Trigger' },
                                                { value: 'send', label: 'Email' },
                                                { value: 'database', label: 'Database' }
                                            ]}
                                        />
                                        <FilterDropdown
                                            value={sortOrder}
                                            onChange={setSortOrder}
                                            options={[
                                                { value: 'newest', label: 'Recent' },
                                                { value: 'oldest', label: 'Oldest' },
                                                { value: 'az', label: 'Title (A-Z)' },
                                                { value: 'za', label: 'Title (Z-A)' }
                                            ]}
                                            icon="list"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Grid */}
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {paginatedWorkflows.map(wf => {
                                        const projectName = wf.folderId
                                            ? findFolderName(foldersWithCounts, wf.folderId)
                                            : null;

                                        return (
                                            <WorkflowCard
                                                key={wf.id}
                                                workflow={wf}
                                                projectName={projectName}
                                                onEdit={onEditWorkflow}
                                                onShare={onShareWorkflow}
                                                onDuplicate={onDuplicateWorkflow}
                                                onDelete={onDeleteWorkflow}
                                                onMove={onMoveWorkflow}
                                                folders={foldersWithCounts}
                                            />
                                        );
                                    })}

                                    {filteredWorkflows.length === 0 && (
                                        <div className="col-span-full py-16 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Icon
                                                    name="search"
                                                    size={24}
                                                    className="text-gray-400"
                                                />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                No workflows found
                                            </h3>
                                            <p className="text-gray-500 mb-6">
                                                We couldn&apos;t find any workflows matching your filters.
                                            </p>
                                            <button
                                                onClick={clearFilters}
                                                className="text-primary-500 font-medium hover:text-primary-600 hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-start gap-2 mt-8">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Previous page"
                                        >
                                            <Icon name="chevronLeft" size={20} />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => handleGoToPage(page)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                        ? 'bg-primary-500 text-white'
                                                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleNextPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Next page"
                                        >
                                            <Icon name="chevronRight" size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        </div>
                    ) : (
                        <TemplateSolutionPage
                            workflows={workflows}
                            folders={foldersWithCounts}
                            onEditWorkflow={onEditWorkflow}
                            onShareWorkflow={onShareWorkflow}
                            onDuplicateWorkflow={onDuplicateWorkflow}
                            onDeleteWorkflow={onDeleteWorkflow}
                            onMoveWorkflow={onMoveWorkflow}
                        />
                    )}
                </div>
            </div>


        </div>
    );
};

export default WorkspaceDashboard;
