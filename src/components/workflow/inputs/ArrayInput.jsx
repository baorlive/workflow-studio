import React from 'react';
import Icon from '../../ui/Icon';
import AsyncSelect from './AsyncSelect';
import FetchAndFillInput from './FetchAndFillInput';
import FileInput from './FileInput';
import CodeInput from './CodeInput';
import DateInput from './DateInput';

const ArrayInput = ({
    label,
    value = [],
    onChange,
    itemSchema = [], // Definition of fields inside each item
    description,
    onInputContextChange
}) => {
    // value is an array of objects
    
    const handleChildInputContextChange = (index, fieldKey, e) => {
        if (onInputContextChange) {
            const suffix = `[${index}].${fieldKey}`;
            onInputContextChange(suffix, e);
        }
    };

    const handleAddItem = () => {
        const newItem = {};
        // Initialize with defaults if needed
        onChange([...value, newItem]);
    };

    const handleRemoveItem = (index) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const handleItemChange = (index, fieldKey, fieldValue) => {
        const newValue = [...value];
        newValue[index] = { ...newValue[index], [fieldKey]: fieldValue };
        onChange(newValue);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[10px] text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                    <Icon name="plus" size={12} />
                    Add Item
                </button>
            </div>
            
            {description && <p className="text-[10px] text-gray-500 mb-2">{description}</p>}

            <div className="space-y-3">
                {value.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative group">
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Item"
                        >
                            <Icon name="x" size={14} />
                        </button>
                        
                        <div className="space-y-3 mt-1">
                            {itemSchema.map((field) => {
                                const fieldKey = field.name || field.key;
                                const fieldType = field.type || 'string';
                                const fieldValue = item[fieldKey];

                                if (fieldType === 'asyncOptions') {
                                    return (
                                        <AsyncSelect
                                            key={fieldKey}
                                            label={field.label}
                                            value={fieldValue}
                                            onChange={(val) => handleItemChange(index, fieldKey, val)}
                                            loadMethod={field.loadMethod}
                                            description={field.description}
                                        />
                                    );
                                }

                                if (fieldType === 'fetchAndFill') {
                                    return (
                                        <FetchAndFillInput
                                            key={fieldKey}
                                            label={field.label}
                                            value={fieldValue}
                                            onChange={(val) => handleItemChange(index, fieldKey, val)}
                                            name={fieldKey}
                                            loadMethod={field.loadMethod}
                                            loadFromDbCollections={field.loadFromDbCollections}
                                            description={field.description}
                                        />
                                    );
                                }

                                if (fieldType === 'date') {
                                    return (
                                        <DateInput
                                            key={fieldKey}
                                            label={field.label}
                                            value={fieldValue}
                                            onChange={(val) => handleItemChange(index, fieldKey, val)}
                                            description={field.description}
                                        />
                                    );
                                }

                                if (fieldType === 'code' || fieldType === 'json') {
                                    return (
                                        <CodeInput
                                            key={fieldKey}
                                            type={fieldType}
                                            label={field.label}
                                            value={fieldValue}
                                            onChange={(val) => handleItemChange(index, fieldKey, val)}
                                            onSelect={(e) => handleChildInputContextChange(index, fieldKey, e)}
                                            onKeyUp={(e) => handleChildInputContextChange(index, fieldKey, e)}
                                            onClick={(e) => handleChildInputContextChange(index, fieldKey, e)}
                                            description={field.description}
                                            placeholder={field.placeholder}
                                        />
                                    );
                                }

                                if (fieldType === 'file' || fieldType === 'folder') {
                                    return (
                                        <FileInput
                                            key={fieldKey}
                                            type={fieldType}
                                            label={field.label}
                                            value={fieldValue}
                                            onChange={(val) => handleItemChange(index, fieldKey, val)}
                                            description={field.description}
                                        />
                                    );
                                }

                                return (
                                <div key={fieldKey} className="space-y-1">
                                    <label className="block text-[10px] font-medium text-gray-600">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={fieldType === 'number' ? 'number' : 'text'}
                                        value={fieldValue || ''}
                                        onChange={(e) => handleItemChange(index, fieldKey, e.target.value)}
                                        onSelect={(e) => handleChildInputContextChange(index, fieldKey, e)}
                                        onKeyUp={(e) => handleChildInputContextChange(index, fieldKey, e)}
                                        onClick={(e) => handleChildInputContextChange(index, fieldKey, e)}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                                        placeholder={field.placeholder}
                                    />
                                    {field.description && <p className="text-[10px] text-gray-400">{field.description}</p>}
                                </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                
                {value.length === 0 && (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
                        No items added
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArrayInput;
