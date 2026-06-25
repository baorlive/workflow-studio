import React, { useMemo, useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { getNodeLibrary } from '../../services/NodeLibraryService';
import { nodeIcons } from './nodeIcons';

const kindIcon = {
    trigger: 'zap',
    action: 'activity',
    conditional: 'gitBranch',
    decision: 'gitPullRequest',
    compute: 'cpu',
    data: 'database',
    transform: 'refreshCw',
    delay: 'clock',
    merge: 'gitMerge',
    exception: 'shieldAlert',
};

const kindLabel = (kind) => {
    if (!kind) return 'node';
    return kind.replace(/_/g, ' ');
};

const TABS = [
    { id: 'all', title: 'All' },
    { id: 'social', title: 'Social' },
    { id: 'google', title: 'Google' },
    { id: 'data', title: 'Data' },
    { id: 'blockchain', title: 'Blockchain' },
    { id: 'testing', title: 'Testing' },
    { id: 'others', title: 'Others' },
];

const CATEGORY_MAPPING = {
    'Social & Messaging': 'social',
    'Social Media Integration': 'social',
    'Google': 'google',
    'Google Ecosystem': 'google',
    'Data & Storage': 'data',
    'Database': 'data',
    'Blockchain Providers': 'blockchain',
    'Blockchain Core': 'blockchain',
    'Crypto Exchanges': 'blockchain',
    'Testing': 'testing',
    'Other': 'others',
    'Logic & Flow': 'others',
    'Network & API': 'others',
    'Browser Automation': 'others',
};

const POPULAR_NODES = [
    'webhook', 'http', 'scheduler', 'slack', 'gmail_sender', 
    'gsheets_reader', 'postgres', 'mysql', 'if_else', 'loop_start', 
    'scheduler', 'send_email'
];

const SOCIAL_PLATFORMS = [
    { name: 'Discord', match: ['discord'] },
    { name: 'Facebook', match: ['facebook'] },
    { name: 'Instagram', match: ['instagram'] },
    { name: 'LinkedIn', match: ['linkedin'] },
    { name: 'Slack', match: ['slack'] },
    { name: 'Telegram', match: ['telegram'] },
    { name: 'Twitter / X', match: ['twitter', 'x_'] },
    { name: 'WhatsApp', match: ['whatsapp'] },
    { name: 'YouTube', match: ['youtube'] },
    { name: 'Viber', match: ['viber'] },
    { name: 'WeChat', match: ['wechat'] },
];

const GOOGLE_PLATFORMS = [
    { name: 'Gmail', match: ['gmail'] },
    { name: 'Drive', match: ['drive', 'gdrive'] },
    { name: 'Sheets', match: ['sheets', 'gsheets'] },
    { name: 'Docs', match: ['docs', 'gdocs'] },
    { name: 'Calendar', match: ['calendar', 'gcalendar'] },
    { name: 'Forms', match: ['forms'] },
    { name: 'Slides', match: ['slides'] },
    { name: 'Tasks', match: ['tasks'] },
    { name: 'Maps', match: ['maps'] },
    { name: 'Search', match: ['search'] },
];

const getPlatform = (nodeId, type) => {
    const lowerId = nodeId.toLowerCase();
    
    if (type === 'social') {
        const platform = SOCIAL_PLATFORMS.find(p => p.match.some(m => lowerId.includes(m)));
        return platform ? platform.name : 'Other Social';
    }
    
    if (type === 'google') {
        const platform = GOOGLE_PLATFORMS.find(p => p.match.some(m => lowerId.includes(m)));
        return platform ? platform.name : 'Other Google Services';
    }
    
    return 'Others';
};

const DraggableNodeItem = React.memo(({ item, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => {
            onDragStart(e, item);
            e.currentTarget.style.opacity = '0.5';
        }}
        onDragEnd={(e) => {
            e.currentTarget.style.opacity = '1';
        }}
        className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
    >
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary-50 transition-colors shrink-0">
            <Icon name={item.icon} size={18} className="text-gray-600 group-hover:text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <h5 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h5>
                <div className="flex items-center gap-1 shrink-0">
                    {item.credentialRequired && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Icon name="lock" size={10} />
                            Cred
                        </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-gray-100 text-gray-600">
                        {kindLabel(item.kind)}
                    </span>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        </div>
        <span className="text-gray-300 group-hover:text-primary-400 transition-colors mt-1">
            <Icon name="gripVertical" size={14} />
        </span>
    </div>
));

DraggableNodeItem.displayName = 'DraggableNodeItem';

const NodeSelectorPanel = ({ isOpen, onClose, onDragStart }) => {
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState('all');
    const [sort, setSort] = useState('az'); // 'az' | 'popular' | 'recent'
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [recentNodes, setRecentNodes] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('recentNodes');
            if (stored) {
                setRecentNodes(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load recent nodes', e);
        }
    }, []);

    const addToRecent = (nodeId) => {
        const newRecent = [nodeId, ...recentNodes.filter(id => id !== nodeId)].slice(0, 20);
        setRecentNodes(newRecent);
        localStorage.setItem('recentNodes', JSON.stringify(newRecent));
    };

    const library = useMemo(() => getNodeLibrary(), []);

    const layeredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        
        // 1. Initialize tabs with empty categories
        const tabsMap = new Map();
        TABS.forEach(tab => {
            tabsMap.set(tab.id, {
                id: tab.id,
                title: tab.title,
                categories: [],
                totalNodes: 0
            });
        });

        // 2. Process each category from library
        library.categories.forEach((category) => {
            // Filter nodes in this category
            const filteredNodes = q
                ? category.nodes.filter(
                    (n) => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
                )
                : category.nodes;

            if (filteredNodes.length === 0) return;

            // Create a modified category object with filtered nodes
            const catObj = {
                ...category,
                nodes: filteredNodes
            };

            // 3. Always add to 'All'
            const allTab = tabsMap.get('all');
            allTab.categories.push(catObj);
            allTab.totalNodes += filteredNodes.length;

            // 4. Add to specific tab or 'Others'
            let mappedId = CATEGORY_MAPPING[category.title];
            
            if (!mappedId) {
                mappedId = 'others';
            }

            const targetTab = tabsMap.get(mappedId);
            if (targetTab) {
                targetTab.categories.push(catObj);
                targetTab.totalNodes += filteredNodes.length;
            }
        });

        // 5. Convert map to array and filter out empty tabs
        return TABS.map(t => tabsMap.get(t.id))
            .filter(t => t.totalNodes > 0);
            
    }, [library.categories, search]);

    useEffect(() => {
        if (layeredData.length > 0 && !layeredData.find((t) => t.id === activeType)) {
            setActiveType(layeredData[0].id);
        }
    }, [layeredData, activeType]);

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setActiveType('all');
            setShowSortMenu(false);
        }
    }, [isOpen]);

    const activeLayer = useMemo(
        () => layeredData.find((t) => t.id === activeType),
        [layeredData, activeType]
    );

    const categories = useMemo(
        () => (activeLayer ? activeLayer.categories : []),
        [activeLayer]
    );
    
    const allNodes = useMemo(() => {
        const nodes = categories.flatMap(cat => cat.nodes);
        
        if (sort === 'az') {
             return nodes.sort((a, b) => a.title.localeCompare(b.title));
        }
        if (sort === 'popular') {
            return nodes.sort((a, b) => {
                const scoreA = POPULAR_NODES.includes(a.id) ? 1 : 0;
                const scoreB = POPULAR_NODES.includes(b.id) ? 1 : 0;
                if (scoreA !== scoreB) return scoreB - scoreA;
                return a.title.localeCompare(b.title);
            });
        }
        if (sort === 'recent') {
            return nodes.sort((a, b) => {
                const idxA = recentNodes.indexOf(a.id);
                const idxB = recentNodes.indexOf(b.id);
                
                // If both are recent, sort by index (lower index = more recent)
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                
                // If only one is recent, it comes first
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                
                // Fallback to A-Z
                return a.title.localeCompare(b.title);
            });
        }
        return nodes;
    }, [categories, sort, recentNodes]);

    const totalOverallNodes = useMemo(() => {
        return library.categories.reduce((acc, c) => acc + (c.nodes?.length || 0), 0);
    }, [library.categories]);

    // Group nodes by platform for Social and Google tabs
    const groupedNodes = useMemo(() => {
        if (!['social', 'google'].includes(activeType)) return null;

        const groups = {};
        allNodes.forEach(node => {
            const platform = getPlatform(node.id, activeType);
            if (!groups[platform]) groups[platform] = [];
            groups[platform].push(node);
        });

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a.startsWith('Other') && b.startsWith('Other')) return a.localeCompare(b);
            if (a.startsWith('Other')) return 1;
            if (b.startsWith('Other')) return -1;
            return a.localeCompare(b);
        });

        return sortedKeys.map(key => ({
            title: key,
            nodes: groups[key]
        }));
    }, [activeType, allNodes]);

    if (!isOpen) return null;

    return (
        <div className="absolute top-20 left-4 bottom-24 w-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col animate-in slide-in-from-left-2 duration-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-black rounded-lg text-white">
                            <Icon name="layers" size={16} />
                        </div>
                        <div className="leading-tight">
                            <h3 className="font-semibold text-gray-900">Node Library</h3>
                            <div className="text-sm text-gray-500">{totalOverallNodes} nodes</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-md transition-colors"
                        aria-label="Close panel"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>

                {layeredData.length > 0 && (
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-1 bg-gray-200/50 p-2 rounded-lg mb-3">
                        {layeredData.map((typeObj, index) => (
                            <React.Fragment key={typeObj.id}>
                                <button
                                    data-testid={`tab-${typeObj.id}`}
                                    onClick={() => {
                                        setActiveType(typeObj.id);
                                    }}
                                    className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${activeType === typeObj.id
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                        }`}
                                >
                                    {typeObj.title}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeType === typeObj.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {typeObj.totalNodes}
                                    </span>
                                </button>
                                {index < layeredData.length - 1 && (
                                    <div className="w-px h-4 bg-gray-300 mx-1 shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 relative">
                    <div className="relative flex-1">
                        <Icon
                            name="search"
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search nodes by name or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all placeholder-gray-400"
                        />
                    </div>
                    
                    <div className="relative">
                         <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className={`p-2 border rounded-xl transition-all ${showSortMenu ? 'bg-primary-50 border-primary-300 text-primary-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-primary-300'}`}
                            title="Sort nodes"
                            aria-label="Sort nodes"
                            aria-haspopup="listbox"
                            aria-expanded={showSortMenu}
                         >
                            <Icon name="listFilter" size={20} />
                         </button>

                         {showSortMenu && (
                            <div
                                role="listbox"
                                aria-label="Sort order"
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                            >
                                <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                    Sort by
                                </div>
                                <button
                                    role="option"
                                    aria-selected={sort === 'az'}
                                    onClick={() => { setSort('az'); setShowSortMenu(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center justify-between ${sort === 'az' ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                >
                                    <span>A - Z</span>
                                    {sort === 'az' && <Icon name="check" size={14} />}
                                </button>
                                <button
                                    role="option"
                                    aria-selected={sort === 'popular'}
                                    onClick={() => { setSort('popular'); setShowSortMenu(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center justify-between ${sort === 'popular' ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                >
                                    <span>Popular Used</span>
                                    {sort === 'popular' && <Icon name="check" size={14} />}
                                </button>
                                <button
                                    role="option"
                                    aria-selected={sort === 'recent'}
                                    onClick={() => { setSort('recent'); setShowSortMenu(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center justify-between ${sort === 'recent' ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
                                >
                                    <span>Recently Used</span>
                                    {sort === 'recent' && <Icon name="check" size={14} />}
                                </button>
                            </div>
                         )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3">
                {allNodes.length === 0 ? (
                    <div className="text-center py-10">
                        <Icon name="searchX" size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No nodes found</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    </div>
                ) : groupedNodes ? (
                    groupedNodes.map(group => (
                        <div key={group.title} className="mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 border-b border-gray-100 pb-1 flex items-center gap-2">
                                {group.title}
                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px] font-medium">{group.nodes.length}</span>
                            </h4>
                            <div className="space-y-3">
                                {group.nodes.map(n => (
                                    <DraggableNodeItem
                                        key={n.id}
                                        item={{
                                            type: n.id,
                                            title: n.title,
                                            icon: nodeIcons[n.id] || kindIcon[n.type] || 'box',
                                            kind: n.type,
                                            description: n.summary || 'Add this node to your workflow.',
                                            credentialRequired: !!n.credentialRequired,
                                        }}
                                        onDragStart={(e, item) => {
                                            onDragStart(e, item);
                                            addToRecent(n.id);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    allNodes.map((n) => (
                        <DraggableNodeItem
                            key={n.id}
                            item={{
                                type: n.id,
                                title: n.title,
                                icon: nodeIcons[n.id] || kindIcon[n.type] || 'box',
                                kind: n.type,
                                description: n.summary || 'Add this node to your workflow.',
                                credentialRequired: !!n.credentialRequired,
                            }}
                            onDragStart={(e, item) => {
                                onDragStart(e, item);
                                addToRecent(n.id);
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NodeSelectorPanel;
