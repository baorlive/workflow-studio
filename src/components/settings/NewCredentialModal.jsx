import React, { useState, useMemo } from 'react';
import Icon from '../ui/Icon';
import { Modal } from '../ui/Modal';

const CREDENTIAL_TYPES = [
    { id: 'alchemy', name: 'Alchemy API', category: 'Blockchain', description: 'Ethereum, Polygon, Arbitrum, Optimism APIs' },
    { id: 'infura', name: 'Infura', category: 'Blockchain', description: 'Web3 infrastructure and tooling' },
    { id: 'seed_node', name: 'Seed Node Endpoints', category: 'Blockchain', description: 'Direct node connection via HTTP/WSS' },
    { id: 'stripe', name: 'Stripe', category: 'Payment', description: 'Payment processing platform' },
    { id: 'rabbitmq', name: 'RabbitMQ', category: 'Messaging', description: 'Message broker software' },
    { id: 'aws', name: 'AWS Access', category: 'Cloud', description: 'Amazon Web Services credentials' },
    { id: 'gcp', name: 'Google Cloud', category: 'Cloud', description: 'Google Cloud Platform service account' },
    { id: 'azure', name: 'Azure', category: 'Cloud', description: 'Microsoft Azure service principal' },
    { id: 'sendgrid', name: 'SendGrid', category: 'Communication', description: 'Email delivery service' },
    { id: 'twilio', name: 'Twilio', category: 'Communication', description: 'SMS and voice communication' },
    { id: 'slack', name: 'Slack Webhook', category: 'Communication', description: 'Incoming webhooks for Slack' },
    { id: 'discord', name: 'Discord Webhook', category: 'Communication', description: 'Incoming webhooks for Discord' },
    { id: 'github', name: 'GitHub Token', category: 'Development', description: 'Repository automation and workflow access' },
    { id: 'notion', name: 'Notion', category: 'Productivity', description: 'Workspace pages and databases' },
    { id: 'postgres', name: 'PostgreSQL', category: 'Database', description: 'Managed relational database access' },
    { id: 'supabase', name: 'Supabase', category: 'Database', description: 'Hosted database and auth platform' },
    { id: 'mongodb', name: 'MongoDB Atlas', category: 'Database', description: 'Cloud document database' },
];

const NewCredentialModal = ({ isOpen, onClose, onSave }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // Filter credential types
    const filteredTypes = useMemo(() => {
        if (!searchQuery) return CREDENTIAL_TYPES;
        const query = searchQuery.toLowerCase();
        return CREDENTIAL_TYPES.filter(type => 
            type.name.toLowerCase().includes(query) || 
            type.category.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Handle selection
    const handleSelectType = (type) => {
        setSelectedType(type);
        setFormData({});
        setErrors({});
    };

    // Form field configurations based on type
    const getFormFields = (typeId) => {
        switch (typeId) {
            case 'seed_node':
                return [
                    { name: 'name', label: 'Credential Name', type: 'text', placeholder: 'e.g. Mainnet Node', required: true },
                    { name: 'httpProvider', label: 'HTTP Provider', type: 'url', placeholder: 'https://...', required: true },
                    { name: 'wssProvider', label: 'WSS Provider', type: 'url', placeholder: 'wss://...', required: true }
                ];
            case 'aws':
                return [
                    { name: 'name', label: 'Credential Name', type: 'text', placeholder: 'e.g. Production AWS', required: true },
                    { name: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...', required: true },
                    { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Private key', required: true },
                    { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true }
                ];
            default:
                return [
                    { name: 'name', label: 'Credential Name', type: 'text', placeholder: 'e.g. My API Key', required: true },
                    { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk_...', required: true }
                ];
        }
    };

    // Validation logic
    const validateField = (name, value, type) => {
        if (type === 'url') {
            const urlPattern = /^(https?|wss?):\/\/[^\s/$.?#].[^\s]*$/i;
            return urlPattern.test(value) ? '' : 'Invalid URL format (must start with http/https/ws/wss)';
        }
        if (!value) return 'This field is required';
        return '';
    };

    const handleInputChange = (name, value, type) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Validate immediately for feedback
        const error = validateField(name, value, type);
        if (error && value) {
             setErrors(prev => ({ ...prev, [name]: error }));
        } else if (!error) {
             setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Check if form is valid
    const isFormValid = useMemo(() => {
        if (!selectedType) return false;
        const fields = getFormFields(selectedType.id);
        
        for (const field of fields) {
            if (field.required && !formData[field.name]) return false;
            if (errors[field.name]) return false;
        }
        return true;
    }, [selectedType, formData, errors]);

    const handleSave = () => {
        if (isFormValid) {
            // Create new credential entry
            const newCredential = {
                id: `cred_${Date.now()}`,
                type: selectedType.id,
                name: formData.name,
                created: new Date().toISOString().split('T')[0],
                lastUsed: 'Just now',
                status: 'active',
                ...formData
            };
            
            onSave(newCredential);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedType(null);
        setFormData({});
        setErrors({});
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New Credential"
            size="4xl"
        >
            <div className="h-[500px] flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                {/* Left Sidebar - Selection */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Icon name="search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search credentials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredTypes.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleSelectType(type)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-white transition-colors flex items-start gap-3 ${
                                    selectedType?.id === type.id ? 'bg-white border-l-4 border-l-primary-600 shadow-sm' : 'border-l-4 border-l-transparent text-gray-600'
                                }`}
                            >
                                <div className={`mt-1 p-1.5 rounded bg-gray-100 text-gray-500 ${selectedType?.id === type.id ? 'bg-primary-50 text-primary-600' : ''}`}>
                                    <Icon name="key" size={16} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-medium ${selectedType?.id === type.id ? 'text-primary-700' : 'text-gray-900'}`}>
                                        {type.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{type.description}</p>
                                </div>
                            </button>
                        ))}
                        {filteredTypes.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No credential types found
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Configuration Form */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedType ? (
                        <>
                            <div className="px-8 py-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                        <Icon name="settings" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Configure {selectedType.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedType.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6 max-w-lg">
                                    {getFormFields(selectedType.id).map(field => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type={field.type === 'url' ? 'text' : field.type} // Use text input for URL to allow easier validation feedback
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                                                placeholder={field.placeholder}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm ${
                                                    errors[field.name] ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors[field.name] && (
                                                <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-8 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!isFormValid}
                                    className={`px-4 py-2 text-white text-sm font-medium rounded-md shadow-sm flex items-center gap-2 ${
                                        isFormValid 
                                            ? 'bg-primary-600 hover:bg-primary-700 transition-colors' 
                                            : 'bg-primary-300 cursor-not-allowed'
                                    }`}
                                >
                                    <Icon name="check" size={16} />
                                    Save Credential
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Icon name="search" size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Credential Type</h3>
                            <p className="max-w-xs mx-auto">
                                Choose a service from the sidebar to configure your new credential.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NewCredentialModal;
