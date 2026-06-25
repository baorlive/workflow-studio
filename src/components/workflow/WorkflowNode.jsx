import React, { useMemo, useState } from 'react';
import Icon from '../ui/Icon';
import NodeHelpModal from './NodeHelpModal';

/**
 * Node Component - Individual workflow node
 * Exact design from original with input/output connection points
 */
const Node = ({
    node,
    isSelected,
    isConfigOpen,
    onSelect,
    onMouseDown,
    onConfigToggle,
    onStartConnect,
    onCompleteConnect,
    onHoverInput,
    onLeaveInput,
    validInput,
    onDuplicate,
    onDelete
}) => {
    const [showHelp, setShowHelp] = useState(false);
    const requiredMissingCount = useMemo(() => {
        if (!node?.parameters) return 0;
        const isEmpty = (param) => {
            if (!param) return true;
            if (param.type === 'boolean') return false;
            if (param.type === 'multiselect') return !Array.isArray(param.value) || param.value.length === 0;
            if (param.type === 'number') return param.value === '' || param.value === null || Number.isNaN(param.value);
            return String(param.value ?? '').trim() === '';
        };
        return Object.values(node.parameters).reduce((acc, p) => acc + (p?.required && isEmpty(p) ? 1 : 0), 0);
    }, [node?.parameters]);

    return (
        <>
            <div
                className={`absolute w-64 bg-white rounded-xl shadow-sm border transition-all cursor-pointer group select-none
                    ${isSelected ? 'border-primary-500 ring-2 ring-primary-100 z-10' : 'border-gray-200 hover:border-primary-300'}
                `}
                style={{ left: node.x, top: node.y }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node);
                }}
                onMouseDown={(e) => onMouseDown(e, node)}
            >
                {/* Hover actions */}
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {onDuplicate && (
                        <button
                            type="button"
                            title="Duplicate"
                            aria-label="Duplicate node"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(node);
                                onDuplicate();
                            }}
                            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:border-primary-300 hover:bg-primary-50 text-gray-500 hover:text-primary-700"
                        >
                            <Icon name="copy" size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            title="Delete"
                            aria-label="Delete node"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(node);
                                onDelete();
                            }}
                            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-700"
                        >
                            <Icon name="trash2" size={14} />
                        </button>
                    )}
                </div>
                <div className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'node-gradient-primary text-primary-700' : 'bg-gray-50 text-gray-500'}`}>
                            <Icon name={node.icon} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate flex items-center justify-between">
                                <span>{node.title}</span>
                                {node.badge && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2 ${
                                        node.badge === 'MCP' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {node.badge}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500 capitalize">{node.type}</p>
                                {requiredMissingCount > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                        <Icon name="alertTriangle" size={12} />
                                        {requiredMissingCount}
                                    </span>
                                ) : node?.parameters && Object.keys(node.parameters).length > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                        <Icon name="checkCircle" size={12} />
                                        OK
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        
                        {/* Help Icon */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHelp(true);
                            }}
                            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Node Guide & Documentation"
                            aria-label="Open Node Guide"
                        >
                            <Icon name="helpCircle" size={16} />
                        </button>
                    </div>

                    <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onConfigToggle();
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all focus:outline-none ${isConfigOpen
                            ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200'
                            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                    title={isConfigOpen ? "Close Configuration" : "Configure Node"}
                    aria-label={isConfigOpen ? "Close Configuration" : "Configure Node"}
                    aria-pressed={isConfigOpen}
                >
                    <Icon name={isConfigOpen ? "x" : "settings"} size={14} />
                    <span>{isConfigOpen ? "Close Config" : "Configure"}</span>
                </button>
            </div>

            {/* Input connection point (Top) */}
            <div
                onMouseUp={() => onCompleteConnect()}
                onMouseEnter={() => onHoverInput(node)}
                onMouseLeave={() => onLeaveInput(node)}
                className={`absolute -top-3 left-1/2 -translate-x-1/2 h-4 w-4 flex items-center justify-center z-20`}
            >
                <div className={`w-3 h-3 bg-white border-2 rounded-full transition-all ${validInput ? 'border-primary-500 scale-125' : 'border-gray-300'}`}></div>
            </div>

            {/* Output connection point (Bottom) */}
            <div
                onMouseDown={() => onStartConnect(node, 'out')}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-4 w-4 flex items-center justify-center cursor-crosshair z-20"
            >
                <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-full hover:border-primary-500 hover:scale-125 transition-all"></div>
            </div>
        </div>
        <NodeHelpModal 
            node={node} 
            isOpen={showHelp} 
            onClose={() => setShowHelp(false)} 
        />
        </>
    );
};

export default Node;
