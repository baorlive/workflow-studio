import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import Icon from '../ui/Icon';
import _ from 'lodash';
import AsyncSelect from './inputs/AsyncSelect';
import ArrayInput from './inputs/ArrayInput';
import FetchAndFillInput from './inputs/FetchAndFillInput';
import DateInput from './inputs/DateInput';
import FileInput from './inputs/FileInput';
import CodeInput from './inputs/CodeInput';
import CredentialInput from './inputs/CredentialInput';
import OutputPanel from './OutputPanel';
import VariableSelector from './VariableSelector';
import { nodesApi } from '../../services/NodeApiService';
import { NODE_CONFIG } from '../../constants';
import { createDefaultParametersForNode, getNodeSpec } from '../../services/NodeLibraryService';

/**
 * PropertiesPanel Component - Floating side-by-side panel
 */
const PropertiesPanel = ({ node, nodes, edges, zoom = 1, pan = { x: 0, y: 0 }, onClose, onUpdate, onUpdatePaths, onDuplicate, onDelete }) => {
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('Saved!');
    const [showVariableSelector, setShowVariableSelector] = useState(false);
    const [style, setStyle] = useState({ opacity: 0, transform: 'scale(0.95)' });
    const [activeTier, setActiveTier] = useState('basic');
    const [activeTab, setActiveTab] = useState('config'); // 'config' | 'output'
    const [outputResponse, setOutputResponse] = useState(null);
    const [errorResponse, setErrorResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeInputContext, setActiveInputContext] = useState(null);
    const panelRef = useRef(null);

    const handleInputContextChange = (inputName, e) => {
        const cursorPosition = e.target.selectionStart;
        const value = e.target.value;
        setActiveInputContext({
            inputName,
            cursorPosition,
            textBefore: value.substring(0, cursorPosition),
            textAfter: value.substring(cursorPosition)
        });
    };

    const isRequiredMissing = (param) => {
        if (!param?.required) return false;
        if (param.type === 'boolean') return false;
        if (param.type === 'multiselect') return !Array.isArray(param.value) || param.value.length === 0;
        if (param.type === 'number') return param.value === '' || param.value === null || Number.isNaN(param.value);
        return String(param.value ?? '').trim() === '';
    };

    const isInvalidJson = (param) => {
        if (param?.type !== 'json') return false;
        const v = param.value;
        if (v === '' || v === undefined || v === null) return false;
        try {
            JSON.parse(typeof v === 'string' ? v : JSON.stringify(v));
            return false;
        } catch {
            return true;
        }
    };

    // Initialize parameters if missing
    useEffect(() => {
        if (node && !node.parameters) {
            const schemaDefaults = createDefaultParametersForNode(node.type);
            const defaults =
                schemaDefaults ||
                NODE_CONFIG.DEFAULT_PARAMS[node.type] || {
                    customParam: { type: 'string', label: 'Custom Parameter', value: '' },
                };
            // Use setTimeout to avoid render loop warning
            setTimeout(() => {
                onUpdate({ ...node, parameters: defaults });
            }, 0);
        }
    }, [node?.id, node, onUpdate]); // Only run when node ID changes

    useEffect(() => {
        setActiveTier('basic');
        
        if (node?.outputResponses?.output) {
            setOutputResponse(node.outputResponses.output);
        } else {
            setOutputResponse(null);
        }

        setErrorResponse(null);
        setActiveTab('config');
    }, [node?.id]);

    // Positioning Logic
    // Positioning Logic
    useLayoutEffect(() => {
        if (!node || !panelRef.current) return;

        const NODE_WIDTH = 256; // w-64
        const NODE_HEIGHT = 80; // Approximate height of a node
        const GAP = 10;
        const VIEWPORT_PADDING = 24;

        // Get container dimensions (relative parent, fallback to viewport)
        const container = panelRef.current.offsetParent || document.body;
        const containerWidth = container.clientWidth || window.innerWidth;
        const containerHeight = container.clientHeight || window.innerHeight;

        // Node screen position (relative to container)
        const nodeScreenX = node.x * zoom + pan.x;
        const nodeScreenY = node.y * zoom + pan.y;
        const nodeScreenWidth = NODE_WIDTH * zoom;
        const nodeScreenHeight = NODE_HEIGHT * zoom;

        // Panel dimensions
        const panelRect = panelRef.current.getBoundingClientRect();
        const panelWidth = panelRect.width || 320; // Default min width
        const panelHeight = panelRect.height;

        // Mobile check
        if (window.innerWidth < 768) {
            setStyle({
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxHeight: '80vh',
                opacity: 1,
                zIndex: 50
            });
            return;
        }

        // Center points
        const nodeCenterX = nodeScreenX + nodeScreenWidth / 2;
        const nodeCenterY = nodeScreenY + nodeScreenHeight / 2;

        // Candidate positions
        const positions = [
            // 1. Right
            {
                left: nodeScreenX + nodeScreenWidth + GAP,
                top: nodeCenterY - panelHeight / 2,
                check: (l, t) => l + panelWidth <= containerWidth - VIEWPORT_PADDING
            },
            // 2. Left
            {
                left: nodeScreenX - panelWidth - GAP,
                top: nodeCenterY - panelHeight / 2,
                check: (l, t) => l >= VIEWPORT_PADDING
            },
            // 3. Bottom
            {
                left: nodeCenterX - panelWidth / 2,
                top: nodeScreenY + nodeScreenHeight + GAP,
                check: (l, t) => t + panelHeight <= containerHeight - VIEWPORT_PADDING
            },
            // 4. Top
            {
                left: nodeCenterX - panelWidth / 2,
                top: nodeScreenY - panelHeight - GAP,
                check: (l, t) => t >= VIEWPORT_PADDING
            }
        ];

        // Find best fit
        let bestPos = positions[0]; // Default to Right
        for (const pos of positions) {
            if (pos.check(pos.left, pos.top)) {
                // Secondary check: Does the other axis fit roughly?
                const isVertical = pos === positions[2] || pos === positions[3];
                let fitsSecondary = true;
                if (!isVertical) {
                    if (pos.top + panelHeight < 0 || pos.top > containerHeight) fitsSecondary = false;
                } else {
                    if (pos.left + panelWidth < 0 || pos.left > containerWidth) fitsSecondary = false;
                }

                if (fitsSecondary) {
                    bestPos = pos;
                    break;
                }
            }
        }

        // Apply Position with Safety Clamping
        let { left, top } = bestPos;

        // Clamp left (always absolute)
        left = Math.max(VIEWPORT_PADDING, Math.min(left, containerWidth - panelWidth - VIEWPORT_PADDING));

        // Clamp top to be at least VIEWPORT_PADDING
        if (top < VIEWPORT_PADDING) {
            top = VIEWPORT_PADDING;
        }

        let bottom = 'auto';
        let availableHeight;

        // Check overflow at bottom
        if (top + panelHeight > containerHeight - VIEWPORT_PADDING) {
            bottom = `${VIEWPORT_PADDING}px`;
            top = 'auto';
            availableHeight = containerHeight - VIEWPORT_PADDING * 2;
        } else {
            availableHeight = containerHeight - top - VIEWPORT_PADDING;
        }

        const finalStyle = {
            position: 'absolute',
            left: `${left}px`,
            top: typeof top === 'number' ? `${top}px` : top,
            bottom,
            width: '360px',
            minWidth: '320px',
            maxWidth: '480px',
            maxHeight: `${availableHeight}px`,
            opacity: 1,
            transform: 'none',
            zIndex: 50
        };

        setStyle(finalStyle);

    }, [node?.x, node?.y, zoom, pan, nodes]); // Recalculate when these change

    if (!node) return null;

    const spec = getNodeSpec(node.type);
    const resolvedFields = spec?.resolvedFields || null;
    const placeholderByKey = resolvedFields
        ? Object.fromEntries(
            [...resolvedFields.basic, ...resolvedFields.advanced]
                .filter((f) => f.paramKey)
                .map((f) => [f.paramKey, f.placeholder])
        )
        : {};

    // Compute tier entries ONCE — never call twice in render to avoid duplicate mounts.
    // When resolvedFields exists, it is the STRICT source of truth for which fields to show.
    // We never fall back to Object.entries(node.parameters) when resolvedFields is available,
    // because node.parameters accumulates keys over time and would cause the list to grow.
    // However, we now support dynamicFields which can append to the resolvedFields.
    const getTierEntries = () => {
        if (!node.parameters) return [];

        // Only use resolvedFields when it actually has fields defined
        if (resolvedFields && (resolvedFields.basic?.length > 0 || resolvedFields.advanced?.length > 0)) {
            const tierFields = activeTier === 'basic'
                ? (resolvedFields.basic || [])
                : (resolvedFields.advanced || []);

            // Append dynamic fields if they exist and we are in the basic tier (or where appropriate)
            // We assume dynamic fields are 'basic' for now unless specified otherwise
            const dynamicFields = (activeTier === 'basic' && node.dynamicFields) ? node.dynamicFields : [];
            
            // Map dynamic fields to match the resolvedFields structure if needed
            const normalizedDynamicFields = dynamicFields.map(f => ({
                paramKey: f.name,
                ...f
            }));

            // Filter out static fields that are overridden by dynamic fields to prevent duplicates
            // and allow dynamic fields to update static definitions (e.g. adding arrayParams)
            const dynamicKeys = new Set(normalizedDynamicFields.map(f => f.paramKey));
            const effectiveTierFields = tierFields.filter(f => {
                const key = f.paramKey || f.name.toLowerCase().replace(/\s+/g, '_');
                return !dynamicKeys.has(key);
            });

            const allFields = [...effectiveTierFields, ...normalizedDynamicFields];

            return allFields.map(f => {
                const key = f.paramKey || f.name.toLowerCase().replace(/\s+/g, '_');
                const stateParam = node.parameters[key];
                return [
                    key,
                    {
                        type: f.paramType || f.type || stateParam?.type || 'string',
                        label: f.label || f.name || key,
                        value: stateParam?.value ?? f.defaultValue ?? '',
                        required: f.required ?? stateParam?.required ?? false,
                        description: f.description || f.schemaDescription || stateParam?.description || '',
                        options: f.options || stateParam?.options || [],
                        placeholder: f.placeholder || '',
                        loadMethod: f.loadMethod,
                        arrayParams: f.arrayParams,
                        isAllowCodeResolve: f.isAllowCodeResolve,
                        loadFromDbCollections: f.loadFromDbCollections,
                        credentialNames: f.credentialNames
                    }
                ];
            });
        }

        // Fallback: no markdown reference for this node type — show raw node.parameters
        return Object.entries(node.parameters);
    };

    // Compute once so JSX never calls the function twice
    const tierEntries = getTierEntries();

    const handleParamChange = async (key, value) => {
        // Handle deep nested updates (e.g. from ArrayInput)
        // Expected key format: "paramName[0].fieldName" or "paramName.someField"
        if (key.includes('[') || key.includes('.')) {
            const firstBracket = key.indexOf('[');
            const firstDot = key.indexOf('.');
            let splitIndex = -1;
            
            if (firstBracket !== -1 && firstDot !== -1) splitIndex = Math.min(firstBracket, firstDot);
            else if (firstBracket !== -1) splitIndex = firstBracket;
            else if (firstDot !== -1) splitIndex = firstDot;
            
            if (splitIndex !== -1) {
                const paramName = key.substring(0, splitIndex);
                const suffix = key.substring(splitIndex);
                
                const newParams = _.cloneDeep(node.parameters);
                
                // Path in node.parameters is paramName.value...
                const realPath = `${paramName}.value${suffix}`;
                _.set(newParams, realPath, value);
                
                onUpdate({ ...node, parameters: newParams });
                return;
            }
        }

        const existingParam = node.parameters[key] || {};

        // Ensure we preserve the schema formatting for dynamically generated markdown fields 
        // that haven't been saved to "node.parameters" state yet.
        let type = existingParam.type;
        let label = existingParam.label;
        let description = existingParam.description;
        let options = existingParam.options;
        let required = existingParam.required;

        // Check against static schema
        const allStaticFields = [...(resolvedFields?.basic || []), ...(resolvedFields?.advanced || [])];
        let mdField = allStaticFields.find(f => (f.paramKey || f.name.toLowerCase().replace(/\s+/g, '_')) === key);
        
        // Check against dynamic schema if not found in static
        if (!mdField && node.dynamicFields) {
            mdField = node.dynamicFields.find(f => f.name === key);
        }

        if (mdField) {
            type = mdField.paramType || mdField.type || 'string';
            label = mdField.label || mdField.name;
            description = mdField.description;
            options = mdField.options;
            required = mdField.required;
        } else if (!type) {
            // If still no type, default to string
             type = 'string';
        }

        const newParams = {
            ...node.parameters,
            [key]: {
                ...existingParam,
                type: type || 'string',
                label: label || key,
                description: description || '',
                options: options || [],
                required: required || false,
                value
            }
        };

        // Check if this field triggers a reload
        if (mdField?.reloadParams) {
            setLoading(true);
            try {
                // Determine load method
                const method = mdField.loadMethod || 'getColumns';
                console.log(`[PropertiesPanel] Triggering reload with method: ${method} for key: ${key}`);
                
                const dynamicData = await nodesApi.loadMethodNode(node.type, {
                    ...node,
                    parameters: newParams, // Use updated params
                    loadMethod: method
                });

                // Assume dynamicData is an array of field definitions
                if (Array.isArray(dynamicData)) {
                    onUpdate({ 
                        ...node, 
                        parameters: newParams,
                        dynamicFields: dynamicData 
                    });
                } else {
                    console.warn('[PropertiesPanel] Expected array for dynamic fields, got:', dynamicData);
                    onUpdate({ ...node, parameters: newParams });
                }
            } catch (err) {
                console.error('[PropertiesPanel] Failed to reload params:', err);
                setErrorResponse(`Failed to reload parameters: ${err.message}`);
                onUpdate({ ...node, parameters: newParams });
            } finally {
                setLoading(false);
            }
        } else {
            onUpdate({ ...node, parameters: newParams });
        }
    };

    const handleSave = () => {
        // Basic validation
        if (node.parameters) {
            const invalidFields = Object.entries(node.parameters)
                .filter(([_, param]) =>
                    (param.type === 'string' || param.type === 'select') &&
                    !String(param.value).trim()
                );

            if (invalidFields.length > 0) {
                console.warn('Invalid fields:', invalidFields);
            }
        }

        setShowSaveFeedback(true);
        setFeedbackMessage('Saved!');
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleVariableSelected = (path) => {
        const fullPath = `{{${path}}}`;
        if (activeInputContext && activeInputContext.inputName) {
            const { inputName, textBefore, textAfter } = activeInputContext;
            const newValue = (textBefore || '') + fullPath + (textAfter || '');
            handleParamChange(inputName, newValue);
        } else {
            navigator.clipboard.writeText(fullPath);
            setFeedbackMessage('Copied!');
            setShowSaveFeedback(true);
            setTimeout(() => setShowSaveFeedback(false), 2000);
        }
        setShowVariableSelector(false);
    };

    const handleTestNode = async () => {
        if (!node) return;
        setLoading(true);
        setErrorResponse(null);
        setOutputResponse(null);
        
        try {
            // Use the mock API
            const response = await nodesApi.testNode(node.type, {
                nodeId: node.id,
                parameters: node.parameters
            });
            setOutputResponse(response.output);

            // Save to node data so it's available for other nodes (VariableSelector)
            onUpdate({
                ...node,
                outputResponses: { 
                    output: response.output,
                    submit: true,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (err) {
            console.error('Test node failed:', err);
            setErrorResponse(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-[49]"
                onClick={onClose}
            />
            <div
                ref={panelRef}
                className="bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-200 ease-out"
                style={style}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-1.5 bg-white rounded-md border border-gray-200 shrink-0">
                            <Icon name={node.icon} size={16} className="text-primary-600" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-gray-900 text-sm truncate">Configuration</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium truncate">{node.type} Node</span>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex items-center bg-gray-200/50 p-0.5 rounded-lg mx-2">
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                                activeTab === 'config' 
                                    ? 'bg-white text-primary-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Config
                        </button>
                        <button
                            onClick={() => setActiveTab('output')}
                            className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                                activeTab === 'output' 
                                    ? 'bg-white text-primary-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Output
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowVariableSelector(true)}
                            className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md p-1.5 transition-colors"
                            title="Select Variable"
                        >
                            <Icon name="database" size={16} />
                        </button>
                        <button
                            onClick={onDuplicate}
                            className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md p-1.5 transition-colors"
                            title="Duplicate Node (Ctrl+D)"
                        >
                            <Icon name="copy" size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md p-1.5 transition-colors"
                            title="Close Panel"
                        >
                            <Icon name="x" size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'config' ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-6 [scrollbar-gutter:stable]">
                    {/* Basic Properties - Simplified */}
                    <section className="space-y-3">
                        <input
                            type="text"
                            value={node.title}
                            onChange={(e) => onUpdate({ ...node, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder-gray-400"
                            placeholder="Node Name"
                        />
                        {spec?.credentialRequired && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                                <Icon name="lock" size={10} />
                                Credential required
                            </div>
                        )}

                        <textarea
                            value={node.description || ''}
                            onChange={(e) => onUpdate({ ...node, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all resize-none placeholder-gray-400"
                            placeholder="Add a description..."
                        />
                    </section>

                    <div className="h-px bg-gray-100" />

                    {/* Parameters */}
                    <section className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Icon name="sliders" size={12} />
                            Parameters
                        </h4>

                        {node.parameters ? (
                            <div className="space-y-4">
                                {(resolvedFields?.advanced?.length > 0 || resolvedFields?.basic?.length > 0) && (
                                    <div className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTier('basic')}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTier === 'basic'
                                                ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            Basic
                                        </button>
                                        {(resolvedFields?.advanced?.length > 0) && (
                                            <button
                                                type="button"
                                                onClick={() => setActiveTier('advanced')}
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTier === 'advanced'
                                                    ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                Advanced
                                            </button>
                                        )}
                                    </div>
                                )}

                                {tierEntries.length > 0 ? (
                                    tierEntries.map(([key, param], index) => (
                                        <div key={`${activeTier}-${key}-${index}`} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-200 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="font-medium text-sm text-gray-900">
                                                    {param.label || key}
                                                    {param.required && <span className="text-red-500 ml-0.5" title="Required">*</span>}
                                                </div>
                                                {placeholderByKey[key] && (
                                                    <div className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 max-w-[150px] truncate">
                                                        {placeholderByKey[key]}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                {(() => {
                                                    const requiredMissing = isRequiredMissing(param);
                                                    const invalidJson = isInvalidJson(param);
                                                    const error = requiredMissing || invalidJson;
                                                    return param.type === 'boolean' ? (
                                                        <div className="flex items-center h-[38px]">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleParamChange(key, !param.value)}
                                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${param.value ? 'bg-primary-600' : 'bg-gray-200'
                                                                    }`}
                                                            >
                                                                <span
                                                                    aria-hidden="true"
                                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${param.value ? 'translate-x-4' : 'translate-x-0'
                                                                        }`}
                                                                />
                                                            </button>
                                                            <span className="ml-2 text-sm font-medium text-gray-700">
                                                                {param.value ? 'True' : 'False'}
                                                            </span>
                                                        </div>
                                                    ) : param.type === 'select' ? (
                                                        <div className="relative">
                                                            <select
                                                                value={param.value ?? ''}
                                                                onChange={(e) => handleParamChange(key, e.target.value)}
                                                                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none transition-all appearance-none ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'}`}
                                                            >
                                                                <option value="">
                                                                    Select...
                                                                </option>
                                                                {param.options?.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                                <Icon name="chevronDown" size={14} />
                                                            </div>
                                                        </div>
                                                    ) : param.type === 'multiselect' ? (
                                                        <div className="relative">
                                                            <select
                                                                multiple
                                                                value={Array.isArray(param.value) ? param.value : (param.value ? [param.value] : [])}
                                                                onChange={(e) => {
                                                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                                    handleParamChange(key, selected);
                                                                }}
                                                                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none transition-all min-h-[100px] ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'}`}
                                                            >
                                                                {param.options?.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                            <div className="text-[10px] text-gray-400 mt-1">Hold Cmd/Ctrl to select multiple</div>
                                                        </div>
                                                    ) : param.type === 'asyncOptions' ? (
                                                        <AsyncSelect
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            loadMethod={param.loadMethod}
                                                            nodeData={node}
                                                            description={param.description}
                                                            error={error}
                                                        />
                                                    ) : param.type === 'array' ? (
                                                        <ArrayInput
                                                            label={param.label}
                                                            value={param.value || []}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            itemSchema={param.arrayParams}
                                                            onInputContextChange={(suffix, e) => handleInputContextChange(`${key}${suffix}`, e)}
                                                            description={param.description}
                                                        />
                                                    ) : param.type === 'fetchAndFill' ? (
                                                        <FetchAndFillInput
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            name={key}
                                                            nodeData={node}
                                                            loadMethod={param.loadMethod}
                                                            loadFromDbCollections={param.loadFromDbCollections}
                                                            description={param.description}
                                                        />
                                                    ) : param.type === 'date' ? (
                                                        <DateInput
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            description={param.description}
                                                            error={error}
                                                        />
                                                    ) : param.type === 'credential' ? (
                                                        <CredentialInput
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            credentialType={param.credentialNames} // Assuming credentialNames holds the type
                                                            description={param.description}
                                                            error={error}
                                                        />
                                                    ) : param.type === 'json' ? (
                                                        <CodeInput
                                                            type="json"
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            onSelect={(e) => handleInputContextChange(key, e)}
                                                            onKeyUp={(e) => handleInputContextChange(key, e)}
                                                            onClick={(e) => handleInputContextChange(key, e)}
                                                            description={param.description}
                                                            placeholder={param.placeholder || "{}"}
                                                            error={invalidJson ? "Invalid JSON format" : error}
                                                        />
                                                    ) : param.type === 'code' ? (
                                                        <CodeInput
                                                            type="code"
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            onSelect={(e) => handleInputContextChange(key, e)}
                                                            onKeyUp={(e) => handleInputContextChange(key, e)}
                                                            onClick={(e) => handleInputContextChange(key, e)}
                                                            description={param.description}
                                                            placeholder={param.placeholder || "// Write your code here..."}
                                                            error={error}
                                                        />
                                                    ) : (param.type === 'folder' || param.type === 'file') ? (
                                                        <FileInput
                                                            type={param.type}
                                                            label={param.label}
                                                            value={param.value}
                                                            onChange={(val) => handleParamChange(key, val)}
                                                            description={param.description}
                                                            error={error}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={param.type === 'number' ? 'number' : param.type === 'password' ? 'password' : 'text'}
                                                            value={param.value ?? ''}
                                                            onChange={(e) => handleParamChange(key, e.target.value)}
                                                            onSelect={(e) => handleInputContextChange(key, e)}
                                                            onKeyUp={(e) => handleInputContextChange(key, e)}
                                                            onClick={(e) => handleInputContextChange(key, e)}
                                                            className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none transition-all ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'}`}
                                                            placeholder={param.placeholder || placeholderByKey[key] || ''}
                                                        />
                                                    );
                                                })()}
                                            </div>

                                            {/* Description/Help Text */}
                                            {param.description && (
                                                <div className="text-sm text-gray-500 leading-relaxed">
                                                    {param.description}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-sm italic text-gray-500">
                                        No {activeTier} configuration fields
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <span className="text-sm text-gray-500">Loading parameters...</span>
                            </div>
                        )}
                    </section>

                    {/* Conditional Paths (Specific to conditional nodes) */}
                    {node.type === 'conditional' && (
                        <>
                            <div className="h-px bg-gray-100" />
                            <section className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Icon name="gitBranch" size={12} />
                                    Routing Logic
                                </h4>
                                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                            <span className="text-sm font-medium text-gray-700">True Path</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all">
                                            <Icon name="arrowRight" size={14} className="text-gray-400" />
                                            <select
                                                className="w-full text-sm bg-transparent outline-none text-gray-700"
                                                onChange={(e) => onUpdatePaths(node.id, e.target.value, null)}
                                                value={nodes.find(n => edges.find(edge => edge.source === node.id && edge.target === n.id && !edge.label?.includes('False')))?.id || ""}
                                            >
                                                <option value="">Select Target...</option>
                                                {nodes.filter(n => n.id !== node.id).map(n => (
                                                    <option key={n.id} value={n.id}>{n.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                                            <span className="text-sm font-medium text-gray-700">False Path</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all">
                                            <Icon name="arrowRight" size={14} className="text-gray-400" />
                                            <select
                                                className="w-full text-sm bg-transparent outline-none text-gray-700"
                                                onChange={(e) => onUpdatePaths(node.id, null, e.target.value)}
                                                value={nodes.find(n => edges.find(edge => edge.source === node.id && edge.target === n.id && edge.label?.includes('False')))?.id || ""}
                                            >
                                                <option value="">Select Target...</option>
                                                {nodes.filter(n => n.id !== node.id).map(n => (
                                                    <option key={n.id} value={n.id}>{n.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
                ) : (
                    <OutputPanel
                        node={node}
                        outputResponse={outputResponse}
                        errorResponse={errorResponse}
                        loading={loading}
                        onTest={handleTestNode}
                    />
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex justify-between items-center gap-3 rounded-b-xl">
                    <button
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Node (Del)"
                    >
                        <Icon name="trash" size={16} />
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        {showSaveFeedback ? (
                            <>
                                <Icon name="check" size={16} /> {feedbackMessage}
                            </>
                        ) : (
                            'Save Properties'
                        )}
                    </button>
                </div>
            </div>
            
            <VariableSelector
                isOpen={showVariableSelector}
                onClose={() => setShowVariableSelector(false)}
                nodes={nodes}
                currentNodeId={node.id}
                onVariableSelected={handleVariableSelected}
            />
        </>
    );
};

export default PropertiesPanel;
