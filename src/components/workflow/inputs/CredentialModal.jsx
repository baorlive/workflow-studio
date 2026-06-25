import React, { useState } from 'react';
import { X, Save, Key } from 'lucide-react';
import { nodesApi } from '../../../services/NodeApiService';

const CredentialModal = ({ isOpen, onClose, onSave, credentialType }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCredential = {
        name,
        value, // In a real app, this would be encrypted or handled securely
        type: credentialType,
        created: new Date().toISOString()
      };
      
      const savedCred = await nodesApi.saveCredential(newCredential);
      onSave(savedCred);
      onClose();
      // Reset form
      setName('');
      setValue('');
    } catch (err) {
      console.error('Failed to save credential:', err);
      setError('Failed to save credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-gray-200 rounded-lg text-primary-600 shadow-sm">
              <Key size={18} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Add New Credential
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg p-1.5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Credential Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production API Key"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder-gray-400"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
              API Key / Token
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your secret key"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder-gray-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" /> Save Credential
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialModal;
