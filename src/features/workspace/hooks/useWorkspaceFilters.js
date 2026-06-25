import { useState, useEffect, useMemo } from 'react';
import { calculateFolderCounts, buildFolderIdSet } from '../services/folderService';
import { ITEMS_PER_PAGE } from '../../../constants/ui';

export const useWorkspaceFilters = (initialWorkflows, initialFolders, externalState = {}) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [nodeFilter, setNodeFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');
    
    const [internalSelectedFolder, setInternalSelectedFolder] = useState(null);
    const [internalFolders, setInternalFolders] = useState(initialFolders);

    const selectedFolder = externalState.selectedFolder !== undefined ? externalState.selectedFolder : internalSelectedFolder;
    const setSelectedFolder = externalState.setSelectedFolder || setInternalSelectedFolder;
    
    const folders = externalState.folders !== undefined ? externalState.folders : internalFolders;
    const setFolders = externalState.setFolders || setInternalFolders;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = ITEMS_PER_PAGE;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter, nodeFilter, selectedFolder]);

    const foldersWithCounts = useMemo(() => {
        return calculateFolderCounts(folders, initialWorkflows || []);
    }, [initialWorkflows, folders]);

    // Filter and sort workflows
    const filteredWorkflows = useMemo(() => {
        const folderIdSet = buildFolderIdSet(folders);
        return (initialWorkflows || [])
            .filter(wf => {
                // Determine if workflow is orphaned (has invalid folderId)
                const isOrphaned = wf.folderId && !folderIdSet.has(wf.folderId);

                const matchesSearch = !search || wf.name.toLowerCase().includes(search.toLowerCase()) ||
                    (wf.tags && wf.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
                const matchesFilter = filter === 'All' ||
                    (filter === 'Deployed' && wf.status === 'Deployed') ||
                    (filter === 'Working in Progress' && wf.status === 'Working in Progress');
                // Folder Filtering
                const matchesFolder = !selectedFolder ||
                    (selectedFolder.id === 'drafts'
                        ? (!wf.folderId || wf.folderId === 'drafts' || isOrphaned)
                        : wf.folderId === selectedFolder.id && !isOrphaned);

                const matchesNode = nodeFilter === 'All' || (wf.icons && wf.icons.includes(nodeFilter));

                return matchesSearch && matchesFilter && matchesNode && matchesFolder;
            })
            .sort((a, b) => {
                if (sortOrder === 'az') return a.name.localeCompare(b.name);
                if (sortOrder === 'za') return b.name.localeCompare(a.name);
                if (sortOrder === 'newest') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
                if (sortOrder === 'oldest') return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
                return 0;
            });
    }, [initialWorkflows, search, filter, selectedFolder, nodeFilter, sortOrder, folders]);

    const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
    const paginatedWorkflows = useMemo(() => {
        return filteredWorkflows.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredWorkflows, currentPage, itemsPerPage]);

    const handleCreateFolder = (name) => {
        const newFolder = {
            id: `f-${Date.now()}`,
            name,
            count: 0,
            children: [],
        };
        setFolders(prev => [...prev, newFolder]);
        // TODO: replace with real API call
    };

    const clearFilters = () => {
        setSearch('');
        setFilter('All');
        setNodeFilter('All');
    };

    return {
        // State
        search, setSearch,
        filter, setFilter,
        nodeFilter, setNodeFilter,
        sortOrder, setSortOrder,
        selectedFolder, setSelectedFolder,
        folders, setFolders,
        currentPage, setCurrentPage,
        itemsPerPage,

        // Computed
        foldersWithCounts,
        filteredWorkflows,
        paginatedWorkflows,
        totalPages,

        // Handlers
        handleCreateFolder,
        clearFilters
    };
};
