import React, { useState, useEffect } from 'react';
import { nodesApi } from '../../../services/NodeApiService';
import { cn } from '../../../utils/cn';
import { Loader2 } from 'lucide-react';

const FetchAndFillInput = ({
  label,
  value,
  onChange,
  name,
  nodeData,
  loadMethod,
  loadFromDbCollections,
  description,
  isHidden
}) => {
  const [loading, setLoading] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    // If we have a value already, maybe we don't need to fetch?
    // Legacy code fetches on mount regardless of value, but sets value to data.user_id
    // We'll follow legacy behavior but be careful not to overwrite if not needed?
    // Actually legacy sets local state and calls setFieldValue.
    
    const fetchOptions = async () => {
      if (!loadMethod) return;
      
      setLoading(true);
      try {
        const data = await nodesApi.loadMethodNode(nodeData?.name || 'unknown_node', {
          ...nodeData,
          loadMethod,
          loadFromDbCollections
        });
        
        if (data && data.user_id) {
          setInternalValue(data.user_id);
          if (onChange && data.user_id !== value) {
            onChange(data.user_id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Legacy sets value to '' on error
        setInternalValue('');
        if (onChange) onChange('');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMethod]); // Only re-run if loadMethod changes, or mount.

  // Sync internal value with prop value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  if (isHidden) return null;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={internalValue}
          readOnly // It seems this is an auto-filled input, maybe readonly? Legacy uses TextField which is editable by default but value is controlled.
          // If the user can edit it, we should add onChange handler.
          // Legacy: <TextField value={value} name={name} />
          // It doesn't pass onChange to TextField, so it might be read-only effectively?
          // Wait, material-ui TextField without onChange is read-only in effect (uncontrolled warning or controlled without handler).
          // But here value is state. So user cannot type.
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
            loading && "opacity-50"
          )}
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export default FetchAndFillInput;
