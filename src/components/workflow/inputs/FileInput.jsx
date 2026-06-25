import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const FileInput = ({
  label,
  value,
  onChange,
  type = 'file', // 'file' or 'folder'
  description,
  error,
}) => {
  const fileInputRef = useRef(null);

  const getFileName = (fileData) => {
    if (!fileData) return '';
    try {
      const parts = fileData.split(',filename:');
      return parts.length > 1 ? parts[1] : 'Unknown file';
    } catch (e) {
      return 'Invalid file data';
    }
  };

  const getFolderName = (folderData) => {
    if (!folderData) return '';
    try {
        const parsed = JSON.parse(folderData);
        if (Array.isArray(parsed) && parsed.length > 0) {
            // Extract folder name from the first file path if possible, or just say "X files selected"
            return `${parsed.length} files selected`;
        }
        return 'Empty folder';
    } catch (e) {
        return 'Invalid folder data';
    }
  };

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (type === 'file') {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (!evt?.target?.result) return;
        const result = evt.target.result;
        // Format: data_url,filename:name
        const value = `${result},filename:${file.name}`;
        onChange(value);
      };
      reader.readAsDataURL(file);
    } else if (type === 'folder') {
      const files = Array.from(e.target.files);
      
      const readFile = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (evt?.target?.result) {
              const result = evt.target.result;
              // Format: data_url,filepath:relative_path
              const value = `${result},filepath:${file.webkitRelativePath || file.name}`;
              resolve(value);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      };

      Promise.all(files.map(readFile))
        .then((results) => {
          onChange(JSON.stringify(results));
        })
        .catch((err) => {
          console.error('Error reading files:', err);
          // Handle error appropriately
        });
    }
  };

  const getDisplayValue = () => {
      if (!value) return `Choose a ${type} to upload`;
      if (type === 'file') return getFileName(value);
      return getFolderName(value);
  };
  
  const displayValue = getDisplayValue();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100",
            error ? "border-red-500" : "border-gray-300 dark:border-gray-700",
            !value && "text-gray-400"
          )}
        >
          <span className="truncate mr-2">{displayValue}</span>
          <Upload className="h-4 w-4 opacity-50 flex-shrink-0" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          {...(type === 'folder' ? { webkitdirectory: '', directory: '' } : {})}
          multiple={type === 'folder'}
        />
      </div>
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

export default FileInput;
