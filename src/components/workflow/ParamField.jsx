import React from 'react';
import Icon from '../ui/Icon';

/**
 * ParamField — renders a single configurable parameter inside PropertiesPanel.
 *
 * Extracted from PropertiesPanel.jsx to reduce its size from 637 → ~310 lines.
 * Each field type (boolean, select, multiselect, credential, json, code,
 * file/folder, text/number) is handled in one place.
 *
 * @param {string}   paramKey        - unique parameter key
 * @param {object}   param           - { type, label, value, required, description, options, placeholder }
 * @param {function} onChange        - (key, value) => void
 * @param {string}   [placeholderHint] - extra placeholder shown in header badge
 */
const ParamField = ({ paramKey, param, onChange, placeholderHint }) => {
    // ── Validation helpers ─────────────────────────────────────────────────
    const isRequiredMissing = () => {
        if (!param?.required) return false;
        if (param.type === 'boolean') return false;
        if (param.type === 'multiselect') return !Array.isArray(param.value) || param.value.length === 0;
        if (param.type === 'number') return param.value === '' || param.value === null || Number.isNaN(param.value);
        return String(param.value ?? '').trim() === '';
    };

    const isInvalidJson = () => {
        if (param?.type !== 'json') return false;
        const v = param.value;
        if (v === '' || v === undefined || v === null) return false;
        try {
            JSON.parse(typeof v === 'string' ? v : JSON.stringify(v));
            return false;
        } catch { return true; }
    };

    const requiredMissing = isRequiredMissing();
    const invalidJson = isInvalidJson();
    const hasError = requiredMissing || invalidJson;

    const baseInputCls = `w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none transition-all ${hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'
        }`;

    // ── File/Folder picker ref ─────────────────────────────────────────────
    const fileInputRef = React.createRef();

    // ── Field renderer ─────────────────────────────────────────────────────
    const renderInput = () => {
        switch (param.type) {
            case 'boolean':
                return (
                    <div className="flex items-center h-[38px]">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={!!param.value}
                            onClick={() => onChange(paramKey, !param.value)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${param.value ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${param.value ? 'translate-x-4' : 'translate-x-0'}`}
                            />
                        </button>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                            {param.value ? 'True' : 'False'}
                        </span>
                    </div>
                );

            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={param.value ?? ''}
                            onChange={e => onChange(paramKey, e.target.value)}
                            className={`${baseInputCls} appearance-none`}
                        >
                            <option value="">Select...</option>
                            {param.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Icon name="chevronDown" size={14} />
                        </div>
                    </div>
                );

            case 'multiselect':
                return (
                    <div>
                        <select
                            multiple
                            value={Array.isArray(param.value) ? param.value : (param.value ? [param.value] : [])}
                            onChange={e => {
                                const selected = Array.from(e.target.selectedOptions, o => o.value);
                                onChange(paramKey, selected);
                            }}
                            className={`${baseInputCls} min-h-[100px]`}
                        >
                            {param.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="text-[10px] text-gray-400 mt-1">Hold Cmd/Ctrl to select multiple</div>
                    </div>
                );

            case 'credential':
                return (
                    <div className="relative">
                        <select
                            value={param.value ?? ''}
                            onChange={e => onChange(paramKey, e.target.value)}
                            className={`${baseInputCls} appearance-none`}
                        >
                            <option value="">Select Credential...</option>
                            <option value="cred-1">Alchemy API Key</option>
                            <option value="cred-2">Infura Project ID</option>
                            <option value="cred-3">Etherscan API Key</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Icon name="lock" size={14} />
                        </div>
                    </div>
                );

            case 'json':
                return (
                    <div>
                        <textarea
                            value={typeof param.value === 'object' ? JSON.stringify(param.value, null, 2) : param.value}
                            onChange={e => onChange(paramKey, e.target.value)}
                            rows={5}
                            className={`${baseInputCls} font-mono`}
                            placeholder="{}"
                        />
                        {invalidJson && <div className="text-sm text-red-500 mt-1">Invalid JSON format</div>}
                    </div>
                );

            case 'code':
                return (
                    <textarea
                        value={param.value}
                        onChange={e => onChange(paramKey, e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 bg-gray-900 text-green-400 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-mono text-sm"
                        placeholder="// Write your code here..."
                    />
                );

            case 'folder':
            case 'file':
                return (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={param.value ?? ''}
                            onChange={e => onChange(paramKey, e.target.value)}
                            className={`flex-1 ${baseInputCls}`}
                            placeholder={param.type === 'folder' ? 'Select a folder...' : 'Select a file...'}
                        />
                        {/* Hidden native file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            aria-hidden="true"
                            tabIndex={-1}
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) onChange(paramKey, file.name);
                            }}
                        />
                        <button
                            type="button"
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors text-gray-600"
                            title={param.type === 'folder' ? 'Pick Folder' : 'Pick File'}
                            aria-label={param.type === 'folder' ? 'Browse for folder' : 'Browse for file'}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Icon name={param.type === 'folder' ? 'folder' : 'file'} size={16} />
                        </button>
                    </div>
                );

            default:
                return (
                    <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={param.value ?? ''}
                        onChange={e => onChange(paramKey, e.target.value)}
                        className={baseInputCls}
                        placeholder={param.placeholder || placeholderHint || ''}
                    />
                );
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-200 transition-colors">
            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-sm text-gray-900">
                    {param.label || paramKey}
                    {param.required && <span className="text-red-500 ml-0.5" title="Required">*</span>}
                </div>
                {placeholderHint && (
                    <div className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 max-w-[150px] truncate">
                        {placeholderHint}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="mb-2">{renderInput()}</div>

            {/* Description */}
            {param.description && (
                <div className="text-sm text-gray-500 leading-relaxed">{param.description}</div>
            )}
        </div>
    );
};

export default ParamField;
