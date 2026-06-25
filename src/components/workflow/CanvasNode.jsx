import React, { useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import Icon from '../ui/Icon';
import NodeHelpModal from './NodeHelpModal';

const calculateSwitchOutputPositions = (outputCount) => {
    if (outputCount <= 1) return ['50%'];
    if (outputCount === 2) return ['30%', '70%'];
    if (outputCount === 3) return ['20%', '50%', '80%'];
    if (outputCount === 4) return ['15%', '35%', '65%', '85%'];
    const positions = [];
    const padding = Math.max(5, Math.min(15, 100 / (outputCount + 1)));
    const availableSpace = 100 - 2 * padding;
    const spacing = availableSpace / (outputCount - 1);
    for (let i = 0; i < outputCount; i++) {
        const percentage = padding + i * spacing;
        positions.push(`${Math.max(5, Math.min(95, percentage))}%`);
    }
    return positions;
};

const getAnchorsForNode = (data) => {
    const kind = data?.kind || data?.type;
    if (kind === 'trigger') {
        return { inputAnchors: [], outputAnchors: [{ id: 'out' }] };
    }
    if (kind === 'conditional') {
        return { inputAnchors: [{ id: 'in' }], outputAnchors: [{ id: 'false' }, { id: 'true' }] };
    }
    if (kind === 'switch') {
        const outputCount = Math.max(2, data?.outputAnchors?.length || 3);
        return {
            inputAnchors: [{ id: 'in' }],
            outputAnchors: Array.from({ length: outputCount }, (_, i) => ({ id: `case-${i}` })),
        };
    }
    return { inputAnchors: [{ id: 'in' }], outputAnchors: [{ id: 'out' }] };
};

const CanvasNode = ({ id, data, selected }) => {
    const [showHelp, setShowHelp] = useState(false);

    const anchors = useMemo(() => getAnchorsForNode(data), [data]);
    const inputAnchors = data?.inputAnchors || anchors.inputAnchors;
    const outputAnchors = data?.outputAnchors || anchors.outputAnchors;
    const outputPositions = useMemo(() => {
        const kind = data?.kind || data?.type;
        if (kind === 'switch') return calculateSwitchOutputPositions(outputAnchors.length);
        if (outputAnchors.length === 2) return ['30%', '70%'];
        return ['50%'];
    }, [data?.kind, data?.type, outputAnchors.length]);

    const width = useMemo(() => {
        const kind = data?.kind || data?.type;
        if (kind === 'switch') {
            const outputCount = outputAnchors.length;
            return Math.max(320, 280 + outputCount * 20);
        }
        return 256;
    }, [data?.kind, data?.type, outputAnchors.length]);

    const requiredMissingCount = useMemo(() => {
        if (!data?.parameters) return 0;
        const isEmpty = (param) => {
            if (!param) return true;
            if (param.type === 'boolean') return false;
            if (param.type === 'multiselect') return !Array.isArray(param.value) || param.value.length === 0;
            if (param.type === 'number') return param.value === '' || param.value === null || Number.isNaN(param.value);
            return String(param.value ?? '').trim() === '';
        };
        return Object.values(data.parameters).reduce((acc, p) => acc + (p?.required && isEmpty(p) ? 1 : 0), 0);
    }, [data?.parameters]);

    return (
        <>
            <div
                style={{ width }}
                className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer group select-none
                    ${selected ? 'border-primary-500 ring-2 ring-primary-100 z-10' : 'border-gray-200 hover:border-white hover:shadow-md'}
                `}
                onClick={(e) => {
                    e.stopPropagation();
                    data?.onSelect?.(id);
                }}
            >
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {data?.onDuplicate && (
                        <button
                            type="button"
                            title="Duplicate"
                            aria-label="Duplicate node"
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onSelect?.(id);
                                data.onDuplicate();
                            }}
                            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:border-primary-300 hover:bg-primary-50 text-gray-500 hover:text-primary-700"
                        >
                            <Icon name="copy" size={14} />
                        </button>
                    )}
                    {data?.onDelete && (
                        <button
                            type="button"
                            title="Delete"
                            aria-label="Delete node"
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onSelect?.(id);
                                data.onDelete();
                            }}
                            className="p-1 bg-white border border-gray-200 rounded-md shadow-sm hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-700"
                        >
                            <Icon name="trash2" size={14} />
                        </button>
                    )}
                </div>

                <div className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg shrink-0 ${selected ? 'node-gradient-primary text-primary-700' : 'bg-gray-50 text-gray-500'}`}>
                            <Icon name={data?.icon} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate flex items-center justify-between">
                                <span>{data?.title}</span>
                                {data?.badge && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2 ${data.badge === 'MCP' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {data.badge}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500 capitalize">{data?.kind || data?.type}</p>
                                {requiredMissingCount > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                        <Icon name="alertTriangle" size={12} />
                                        {requiredMissingCount}
                                    </span>
                                ) : data?.parameters && Object.keys(data.parameters).length > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                        <Icon name="checkCircle" size={12} />
                                        OK
                                    </span>
                                ) : null}
                            </div>
                        </div>

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
                            data?.onConfigToggle?.(id);
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all focus:outline-none ${data?.isConfigOpen
                                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200'
                                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 shadow-sm'
                            }`}
                        title={data?.isConfigOpen ? "Close Configuration" : "Configure Node"}
                        aria-label={data?.isConfigOpen ? "Close Configuration" : "Configure Node"}
                        aria-pressed={!!data?.isConfigOpen}
                    >
                        <Icon name={data?.isConfigOpen ? "x" : "settings"} size={14} />
                        <span>{data?.isConfigOpen ? "Close Config" : "Configure"}</span>
                    </button>
                </div>

                {inputAnchors.map((a) => (
                    <Handle
                        key={a.id}
                        type="target"
                        position={Position.Top}
                        id={a.id}
                        style={{
                            width: 10,
                            height: 10,
                            background: '#fff',
                            border: '2px solid rgb(209, 213, 219)',
                            top: -6,
                        }}
                    />
                ))}

                {outputAnchors.map((a, idx) => (
                    <Handle
                        key={a.id}
                        type="source"
                        position={Position.Bottom}
                        id={a.id}
                        style={{
                            width: 10,
                            height: 10,
                            background: '#fff',
                            border: '2px solid rgb(209, 213, 219)',
                            bottom: -6,
                            left: outputPositions[idx] || '50%',
                        }}
                    />
                ))}
            </div>

            <NodeHelpModal
                node={{
                    id,
                    type: data?.type,
                    title: data?.title,
                    icon: data?.icon,
                    description: data?.description,
                }}
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />
        </>
    );
};

export default CanvasNode;
