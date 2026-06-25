import React, { useState, useEffect } from 'react';
import { Key, Plus, RefreshCw } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { nodesApi } from '../../../services/NodeApiService';
import CredentialModal from './CredentialModal';

export const CredentialInput = ({
  label,
  value,
  onChange,
  credentialType, // e.g. 'serviceCredential'
  description,
  error,
}) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCredentials = async () => {
    if (!credentialType) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await nodesApi.getCredentials(credentialType);
      setCredentials(data || []);
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
      setFetchError('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [credentialType]);

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleSaveCredential = (newCred) => {
    setCredentials((prev) => [...prev, newCred]);
    onChange(newCred.id); // Auto-select new credential
  };

  const isDisabled = loading || credentials.length === 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            className={cn(
              "flex w-full appearance-none rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2",
              isDisabled
                ? "bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 focus:ring-primary-100 focus:border-primary-500 text-gray-900",
              !isDisabled && error
                ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                : "",
              !value && !isDisabled && "text-gray-500"
            )}
          >
            <option value="" disabled>
              {loading ? 'Loading...' : credentials.length === 0 ? 'No credentials found' : 'Select a credential'}
            </option>
            {credentials.map((cred) => (
              <option key={cred.id} value={cred.id}>
                {cred.name}
              </option>
            ))}
          </select>
          <Key className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
        
        <button
          type="button"
          onClick={fetchCredentials}
          aria-label="Refresh credentials"
          title="Refresh credentials"
          disabled={loading}
          className={cn(
            "p-2 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>

        <button
          type="button"
          onClick={handleCreateNew}
          aria-label="Add new credential"
          title="Add new credential"
          className={cn(
            "p-2 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none"
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {((error && !(loading || credentials.length === 0)) || fetchError) && (
        <p className="mt-1 text-sm text-red-500">
          {error || fetchError}
        </p>
      )}

      <CredentialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCredential}
        credentialType={credentialType}
      />
    </div>
  );
};

export default CredentialInput;
