import React from 'react';
import { cn } from '../../../utils/cn';

export const CodeInput = ({
  label,
  value,
  onChange,
  type = 'json', // 'json' or 'code'
  description,
  placeholder,
  error,
  onSelect,
  onKeyUp,
  onClick,
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onSelect={onSelect}
        onKeyUp={onKeyUp}
        onClick={onClick}
        placeholder={placeholder}
        className={cn(
          "flex w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 font-mono",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500",
          "min-h-[100px]"
        )}
        spellCheck="false"
      />
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default CodeInput;
