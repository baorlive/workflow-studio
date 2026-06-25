import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import NewCredentialModal from './NewCredentialModal';

const MOCK_CREDENTIALS = [
    { id: 'cred_1', type: 'alchemy', name: 'Mainnet Alchemy', created: '2023-10-15', lastUsed: '2 hours ago', status: 'active' },
    { id: 'cred_2', type: 'github', name: 'GitHub Actions Bot', created: '2023-11-02', lastUsed: '5 mins ago', status: 'active' },
    { id: 'cred_3', type: 'aws', name: 'AWS S3 Access', created: '2023-09-20', lastUsed: '1 day ago', status: 'expired' },
    { id: 'cred_4', type: 'stripe', name: 'Stripe Test', created: '2023-12-05', lastUsed: 'Never', status: 'active' },
];

const CredentialSettings = () => {
    const [credentials, setCredentials] = useState(MOCK_CREDENTIALS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [credentialToDelete, setCredentialToDelete] = useState(null);

    const handleSaveCredential = (newCredential) => {
        setCredentials([newCredential, ...credentials]);
        setSuccessMessage(`Credential "${newCredential.name}" saved successfully!`);
        setSuccessDialogOpen(true);
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        setCredentialToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (credentialToDelete) {
            setCredentials(credentials.filter(c => c.id !== credentialToDelete));
            setDeleteConfirmOpen(false);
            setCredentialToDelete(null);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header with Title and Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Credentials</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your API keys and service connections</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                >
                    <Icon name="plus" size={16} className="mr-2" />
                    New Credential
                </Button>
            </div>

            {/* Credential List Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {credentials.map((cred) => (
                            <tr key={cred.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-primary-50 rounded flex items-center justify-center text-primary-600">
                                            <Icon name="key" size={16} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{cred.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 capitalize">{cred.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{cred.created}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {cred.lastUsed}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                        cred.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {cred.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleDelete(cred.id)} 
                                        className="text-red-600 hover:text-red-900 ml-4 p-1 hover:bg-red-50 rounded"
                                        title="Delete credential"
                                    >
                                        <Icon name="trash" size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {credentials.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
                                    No credentials configured yet. Add one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Credential Modal */}
            <NewCredentialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCredential}
            />

            {/* Success Dialog */}
            <ConfirmDialog
                isOpen={successDialogOpen}
                onClose={() => setSuccessDialogOpen(false)}
                title="Success"
                message={successMessage}
                onConfirm={() => setSuccessDialogOpen(false)}
                confirmLabel="Done"
                type="success"
                showCancel={false}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                title="Delete Credential"
                message="Are you sure you want to delete this credential? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default CredentialSettings;
