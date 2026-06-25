import React, { useState, useEffect } from 'react';
import Icon from '../../ui/Icon';
import { nodesApi } from '../../../services/NodeApiService';

const AsyncSelect = ({
    label,
    value,
    onChange,
    loadMethod,
    nodeData,
    description,
    error
}) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const fetchOptions = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await nodesApi.loadMethodNode(nodeData?.name || 'unknown_node', { 
                ...nodeData, 
                loadMethod 
            });
            
            // Handle different response formats
            let optionsData = [];
            if (Array.isArray(data)) {
                optionsData = data;
            } else if (data && Array.isArray(data.options)) {
                optionsData = data.options;
            } else {
                // Fallback or specific object handling
                console.warn('AsyncSelect: Received non-array data', data);
                // Keep empty or try to map object keys?
            }
            
            setOptions(optionsData);
        } catch (err) {
            console.error("Error fetching options:", err);
            setFetchError(err.message);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!options.length && value) {
             // If we have a value but no options, try to fetch to show label
             fetchOptions();
        }
    }, []);

    const handleOpen = () => {
        if (options.length === 0) {
            fetchOptions();
        }
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                {loading && <span className="text-[10px] text-gray-400">Loading...</span>}
            </div>
            
            <div className="relative">
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onClick={handleOpen}
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none transition-all appearance-none 
                        ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'}
                    `}
                >
                    <option value="">Select...</option>
                    {options.map((opt) => (
                        <option key={opt.name} value={opt.name}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <Icon name="chevronDown" size={14} />
                </div>
            </div>
            
            {description && <p className="text-[10px] text-gray-500">{description}</p>}
            {fetchError && <p className="text-[10px] text-red-500">{fetchError}</p>}
        </div>
    );
};

export default AsyncSelect;
