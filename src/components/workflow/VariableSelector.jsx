import React, { useState, useMemo } from 'react';
import ReactJson from 'react-json-view';
import Icon from '../ui/Icon';
import { cn } from '../../utils/cn';

const VariableSelector = ({ 
    isOpen, 
    onClose, 
    nodes, 
    currentNodeId, 
    onVariableSelected 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());

    // Filter available nodes (exclude current node)
    const availableNodes = useMemo(() => {
        return nodes.filter(n => n.id !== currentNodeId);
    }, [nodes, currentNodeId]);

    // Filter by search term
    const filteredNodes = useMemo(() => {
        if (!searchTerm) return availableNodes;
        return availableNodes.filter(n => 
            (n.data?.title || n.data?.label || n.id).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableNodes, searchTerm]);

    const toggleNode = (nodeId) => {
        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    const handleCopy = (copy, node) => {
        // copy.namespace is array of keys path
        // copy.src is the value
        
        const namespaces = copy.namespace;
        let variablePath = `${node.id}`; // Start with Node ID
        
        // Construct path: {{NodeID.output.path.to.value}}
        // The root of ReactJson src is node.data.outputResponses.output
        // So we append keys.
        
        // Legacy logic:
        /*
        if (isPositiveNumeric(namespace)) {
            variablePath += `[${namespace}]`
        } else {
            variablePath += `.${namespace}` // Note: Legacy logic handled dots specially?
        }
        */
        
        namespaces.forEach((key) => {
             if (/^\d+$/.test(key)) {
                 // Check if we need to remove trailing dot if previous was dot?
                 // No, just append array notation
                 variablePath += `[${key}]`;
             } else {
                 variablePath += `.${key}`;
             }
        });

        // Append the actual key (name) if it's not the root object
        if (copy.name !== false && copy.name !== null) {
            const key = String(copy.name);
            if (/^\d+$/.test(key)) {
                variablePath += `[${key}]`;
            } else {
                variablePath += `.${key}`;
            }
        }
        
        onVariableSelected(variablePath);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px]" onClick={onClose}>
             {/* Modal Content */}
             <div 
                className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[500px] max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
             >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Icon name="database" size={18} className="text-primary-600" />
                        Select Variable
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>
                
                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search available nodes..." 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30" style={{ scrollbarGutter: 'stable' }}>
                    {filteredNodes.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center gap-2">
                            <Icon name="box" size={24} className="opacity-50" />
                            <span>No nodes available</span>
                        </div>
                    ) : (
                        filteredNodes.map(node => {
                            const isExpanded = expandedNodeIds.has(node.id);
                            const hasOutput = !!node.data?.outputResponses?.output;
                            
                            return (
                                <div key={node.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button 
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 transition-colors text-left",
                                            isExpanded ? "bg-gray-50 border-b border-gray-100" : "hover:bg-gray-50"
                                        )}
                                        onClick={() => toggleNode(node.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-primary-50 rounded-md text-primary-600 border border-primary-100">
                                                <Icon name={node.data?.icon || 'box'} size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-gray-900">{node.data?.title || node.data?.label || node.id}</span>
                                                <span className="text-[10px] text-gray-500 font-mono">{node.id}</span>
                                            </div>
                                        </div>
                                        <Icon 
                                            name="chevronRight" 
                                            size={16} 
                                            className={cn("text-gray-400 transition-transform duration-200", isExpanded && "rotate-90")} 
                                        />
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="p-3 bg-white animate-in slide-in-from-top-2 duration-200">
                                            {hasOutput ? (
                                                <div className="rounded-lg border border-gray-200 overflow-hidden">
                                                    <ReactJson 
                                                        src={node.data.outputResponses.output} 
                                                        name={false}
                                                        collapsed={2}
                                                        displayDataTypes={false}
                                                        enableClipboard={(copy) => {
                                                            handleCopy(copy, node);
                                                        }}
                                                        theme="rjv-default"
                                                        style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                                                        iconStyle="triangle"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                    No output data available. Run the node to generate output.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center">
                    Click copy icon <Icon name="copy" size={10} className="inline mx-1" /> to select a variable
                </div>
             </div>
        </div>
    );
};

export default VariableSelector;
