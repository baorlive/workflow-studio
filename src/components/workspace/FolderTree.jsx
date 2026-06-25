import React, { useState, memo } from 'react';
import Icon from '../ui/Icon';

const FolderTree = memo(({ folders, level = 0, onSelect, selectedId }) => {
    const [expanded, setExpanded] = useState({});

    const toggle = (e, folder) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [folder.id]: !prev[folder.id] }));
    };

    const handleSelect = (folder) => {
        if (onSelect) {
            onSelect(folder);
        }
    };

    return (
        <div className="space-y-1">
            {folders.map(folder => {
                const count = typeof folder.count === 'number' ? folder.count : 0;
                
                return (
                    <div key={folder.id}>
                        <button
                            onClick={() => handleSelect(folder)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${level > 0 ? 'ml-4' : ''} ${
                                selectedId === folder.id 
                                    ? 'bg-primary-50 text-primary-700 font-medium' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            style={{ paddingLeft: `${level * 12 + 12}px` }}
                        >
                            <Icon name={expanded[folder.id] || selectedId === folder.id ? 'folderOpen' : 'folder'} size={16} className={selectedId === folder.id ? 'text-primary-500' : 'text-gray-400'} />
                            <span className="flex-1 text-left truncate">{folder.name}</span>
                            {count > 0 && (
                                <span className={`text-sm px-1.5 py-0.5 rounded-full ${selectedId === folder.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
});

FolderTree.displayName = 'FolderTree';

export default FolderTree;
