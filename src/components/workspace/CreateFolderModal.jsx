import React, { useState } from 'react';
import Icon from '../ui/Icon';

/**
 * CreateFolderModal
 *
 * Extracted from WorkspaceDashboard (was inline at lines 515–562).
 * A simple modal dialog for naming a new folder.
 */
const CreateFolderModal = ({ onClose, onCreate }) => {
    const [folderName, setFolderName] = useState('');

    const handleCreate = () => {
        if (!folderName.trim()) return;
        onCreate(folderName.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Create New Folder</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                        aria-label="Close"
                    >
                        <Icon name="x" size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-4">
                        <label htmlFor="create-folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Folder Name
                        </label>
                        <input
                            id="create-folder-name"
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="e.g. Marketing Automations"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!folderName.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Create Folder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;
