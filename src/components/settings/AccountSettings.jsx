import React, { useState } from 'react';
import Icon from '../ui/Icon';
import CredentialSettings from './CredentialSettings';
import PaymentSettings from './PaymentSettings';
import ApiKeySettings from './ApiKeySettings';
import WalletSettings from './WalletSettings';

const AccountSettings = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState({
        firstName: 'Brian',
        lastName: 'Frederin',
        email: 'brianfrederin@email.com',
        avatar: 'https://cdn.kwork.com/files/portfolio/t3/24/a5bf8465becd2274bd38894122c7020e96115673-1711803733.jpg',
        twoFactor: true,
        supportAccess: true
    });

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'credential', label: 'Credential' },
        { id: 'payment', label: 'Payment' },
        { id: 'apikey', label: 'API Key' },
        { id: 'wallet', label: 'Wallet' },
        { id: 'others', label: 'Other' }
    ];
    const tokenInputClass = "w-full rounded-[var(--input-radius)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] text-[var(--input-font-size)] bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--input-ring-focus)] focus:border-[var(--input-border-focus)]";
    const tokenInputReadonlyClass = "flex-1 rounded-[var(--input-radius)] px-[var(--input-padding-x)] py-[var(--input-padding-y)] text-[var(--input-font-size)] bg-[var(--input-disabled-bg)] text-[var(--input-disabled-text)] border border-[var(--input-border)] cursor-not-allowed";

    return (
        <div className="flex flex-col h-full bg-[var(--color-surface-elevated)] text-[var(--color-text)]">
            {/* Header Area */}
            <div className="px-8 pt-8 pb-0 max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-colors"
                        title="Back to Dashboard"
                    >
                        <Icon name="arrowLeft" size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Account Settings</h1>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex items-center gap-2 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl mb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-3 py-2 rounded-lg text-base font-semibold transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-8 pt-8 pb-8 max-w-6xl mx-auto w-full">
                    {activeTab === 'profile' && (
                        <>
                            {/* My Profile Section */}
                            <section className="mb-10">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">My Profile</h2>
                                
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <img 
                                            src={user.avatar} 
                                            alt="Profile" 
                                            className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-3">
                                            <button className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm">
                                                <Icon name="plus" size={16} />
                                                Change Image
                                            </button>
                                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                                Remove Image
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500">We support PNGs, JPEGs and GIFs under 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                                        <input 
                                            type="text" 
                                            value={user.firstName}
                                            onChange={(e) => setUser({...user, firstName: e.target.value})}
                                            className={tokenInputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={user.lastName}
                                            onChange={(e) => setUser({...user, lastName: e.target.value})}
                                            className={tokenInputClass}
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200 mb-10" />

                            {/* Account Security Section */}
                            <section className="mb-10">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Account Security</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <div className="flex gap-4">
                                            <input 
                                                type="email" 
                                                value={user.email}
                                                readOnly
                                                className={tokenInputReadonlyClass}
                                            />
                                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                                Change email
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                        <div className="flex gap-4">
                                            <input 
                                                type="password" 
                                                value="**********"
                                                readOnly
                                                className={tokenInputReadonlyClass}
                                            />
                                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                                Change password
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">2-Step Verifications</h3>
                                            <p className="text-sm text-gray-500 mt-1">Add an additional layer of security to your account during login.</p>
                                        </div>
                                        <button 
                                            onClick={() => setUser({...user, twoFactor: !user.twoFactor})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.twoFactor ? 'bg-primary-500' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.twoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200 mb-10" />

                            {/* Support Access Section */}
                            <section>
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Support Access</h2>
                                
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Log out of all devices</h3>
                                            <p className="text-sm text-gray-500 mt-1">Log out of all other active sessions on other devices besides this one.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                            Log out
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-red-600">Delete my account</h3>
                                            <p className="text-sm text-gray-500 mt-1">Permanently delete the account and remove access from all workspaces.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors shadow-sm">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                    {activeTab === 'credential' && (
                        <CredentialSettings />
                    )}
                    {activeTab === 'payment' && (
                        <PaymentSettings />
                    )}
                    {activeTab === 'apikey' && (
                        <ApiKeySettings />
                    )}
                    {activeTab === 'wallet' && (
                        <WalletSettings />
                    )}
                    {activeTab === 'others' && (
                        <div className="text-center py-12 text-gray-500">
                            Other settings content coming soon
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
