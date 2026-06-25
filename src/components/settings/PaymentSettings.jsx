import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const STORAGE_KEY = 'linkWallet';

const PaymentSettings = () => {
    const [email, setEmail] = useState('');
    const [autofill, setAutofill] = useState(true);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved && saved.email) {
                    setEmail(saved.email);
                    setAutofill(Boolean(saved.autofill));
                    setConnected(true);
                }
            }
        } catch {
            // ignore
        }
    }, []);

    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handleConnect = async () => {
        setError('');
        if (!validateEmail(email)) {
            setError('Enter a valid Link email');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const payload = { email, autofill, connectedAt: Date.now(), provider: 'link' };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            setConnected(true);
            setLoading(false);
            setSuccessMessage('Link wallet connected and saved.');
            setSuccessOpen(true);
        }, 900);
    };

    const handleDisconnect = () => {
        localStorage.removeItem(STORAGE_KEY);
        setConnected(false);
        setEmail('');
        setAutofill(true);
        setSuccessMessage('Link wallet disconnected.');
        setSuccessOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                        <p className="text-sm text-gray-500">Manage your Link wallet credentials and autofill preferences</p>
                    </div>
                </div>
                {connected && (
                    <span className="px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        Connected
                    </span>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div>
                        <img
                            src="https://brandlogos.net/wp-content/uploads/2025/04/link_stripe-logo_brandlogos.net_scfln.png"
                            alt="Link by Stripe"
                            className="h-6 md:h-7 max-w-full"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <p className="text-sm text-gray-500">
                            Link stores your payment details to autofill checkout. Your data is secured with end-to-end encryption.
                        </p>
                        <a
                            className="text-sm text-primary-600 underline"
                            href="https://link.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Learn more at link.com
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm"
                        />
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    {!connected ? (
                        <Button variant="primary" onClick={handleConnect} disabled={loading}>
                            {loading ? 'Connecting…' : 'Connect Link'}
                        </Button>
                    ) : (
                        <>
                            <Button variant="primary" onClick={handleConnect} disabled={loading}>
                                {loading ? 'Saving…' : 'Save Changes'}
                            </Button>
                            <Button variant="secondary" onClick={handleDisconnect}>
                                Disconnect
                            </Button>
                        </>
                    )}
                </div>

                {connected && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Connection</h4>
                        <p className="text-sm text-gray-600">
                            Email: <span className="font-medium text-gray-900">{email}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Autofill: <span className="font-medium text-gray-900">{autofill ? 'Enabled' : 'Disabled'}</span>
                        </p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={successOpen}
                onClose={() => setSuccessOpen(false)}
                title="Success"
                message={successMessage}
                onConfirm={() => setSuccessOpen(false)}
                confirmLabel="Done"
                type="success"
                showCancel={false}
            />
        </div>
    );
};

export default PaymentSettings;
