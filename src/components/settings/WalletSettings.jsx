import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import Icon from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FilterDropdown } from '../workspace/FilterDropdown';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name-az', label: 'Name (A–Z)' },
    { value: 'name-za', label: 'Name (Z–A)' },
];

const MOCK_WALLETS = [
    { id: 'w1', name: 'Main Wallet',    address: '0x4f3eDF983aC636a65a842CE7C78d9aa706d3b113', balance: 4.25,  currency: 'ETH', createdAt: '2026-01-10T09:00:00.000Z' },
    { id: 'w2', name: 'Dev Wallet',     address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', balance: 1.08,  currency: 'ETH', createdAt: '2025-11-05T14:22:10.000Z' },
    { id: 'w3', name: 'Rewards Wallet', address: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b', balance: 0.33,  currency: 'ETH', createdAt: '2025-08-19T08:55:44.000Z' },
    { id: 'w4', name: 'Savings',        address: '0xE11BA2b4D45Eaed5996Cd0823791E0C93114882D', balance: 12.70, currency: 'ETH', createdAt: '2025-03-02T11:30:00.000Z' },
];

function generateAddress() {
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return `0x${hex}`;
}

/* ── Copy button ────────────────────────────────────────────────────────────── */
const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            className="ml-1.5 p-1 rounded text-green-600 hover:bg-green-50 transition-colors shrink-0"
        >
            <Icon name={copied ? 'check' : 'copy'} size={14} />
        </button>
    );
};

const NETWORKS = [
    { id: 'ethereum',  label: 'Ethereum',        symbol: 'ETH',  color: '#627EEA' },
    { id: 'polygon',   label: 'Polygon',          symbol: 'MATIC', color: '#8247E5' },
    { id: 'bnb',       label: 'BNB Smart Chain',  symbol: 'BNB',  color: '#F0B90B' },
    { id: 'avalanche', label: 'Avalanche',         symbol: 'AVAX', color: '#E84142' },
    { id: 'arbitrum',  label: 'Arbitrum One',      symbol: 'ARB',  color: '#28A0F0' },
    { id: 'optimism',  label: 'Optimism',          symbol: 'OP',   color: '#FF0420' },
];

/* ── Add / Edit Modal ───────────────────────────────────────────────────────── */
const WalletModal = ({ isOpen, onClose, onSave, editingWallet }) => {
    const [name, setName] = useState('');
    const [network, setNetwork] = useState('ethereum');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gasLimit, setGasLimit] = useState('21000');
    const [slippage, setSlippage] = useState('0.5');
    const [privateKey, setPrivateKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setName(editingWallet ? editingWallet.name : '');
            setNetwork(editingWallet ? (editingWallet.network ?? 'ethereum') : 'ethereum');
            setShowAdvanced(false);
            setGasLimit('21000');
            setSlippage('0.5');
            setPrivateKey('');
            setShowKey(false);
        }
    }, [editingWallet, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const net = NETWORKS.find(n => n.id === network);
        onSave({ name: name.trim(), network, currency: net?.symbol ?? 'ETH', editingWallet });
        onClose();
    };

    const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all';
    const labelCls = 'block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1.5';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingWallet ? 'Rename Wallet' : 'Add New Wallet'}
            size="md"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {editingWallet ? 'Save Changes' : 'Add Wallet'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Wallet Name */}
                <div>
                    <label className={labelCls}>
                        Wallet Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={inputCls}
                        placeholder="e.g. Main Wallet"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                {/* Wallet Network — only shown when creating */}
                {!editingWallet && (
                    <div>
                        <label className={labelCls}>Wallet Network</label>
                        <div className="grid grid-cols-2 gap-2">
                            {NETWORKS.map(n => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => setNetwork(n.id)}
                                    className={clsx(
                                        'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left',
                                        network === n.id
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-gray-50'
                                    )}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ background: n.color }}
                                    />
                                    <span className="truncate">{n.label}</span>
                                    <span className="ml-auto text-sm text-gray-400 font-mono shrink-0">{n.symbol}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Advanced Settings — only shown when creating */}
                {!editingWallet && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Icon name="settings" size={14} className="text-gray-400" />
                                Advanced Settings
                            </span>
                            <Icon
                                name={showAdvanced ? 'chevronUp' : 'chevronDown'}
                                size={14}
                                className="text-gray-400 transition-transform"
                            />
                        </button>

                        {showAdvanced && (
                            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100 bg-gray-50">
                                {/* Gas Limit & Slippage */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <label className={labelCls}>Gas Limit</label>
                                        <input
                                            type="number"
                                            min="21000"
                                            step="1000"
                                            className={inputCls}
                                            value={gasLimit}
                                            onChange={e => setGasLimit(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Slippage Tolerance (%)</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="50"
                                            step="0.1"
                                            className={inputCls}
                                            value={slippage}
                                            onChange={e => setSlippage(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Import private key */}
                                <div>
                                    <label className={labelCls}>Import Private Key <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                                    <div className="relative">
                                        <input
                                            type={showKey ? 'text' : 'password'}
                                            className={`${inputCls} pr-10`}
                                            placeholder="0x…"
                                            value={privateKey}
                                            onChange={e => setPrivateKey(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            tabIndex={-1}
                                        >
                                            <Icon name={showKey ? 'eyeOff' : 'eye'} size={15} />
                                        </button>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-400">Leave blank to auto-generate a new address.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </Modal>
    );
};

/* ── WalletSettings ─────────────────────────────────────────────────────────── */
const WalletSettings = () => {
    const [wallets, setWallets] = useState(MOCK_WALLETS);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        let result = q
            ? wallets.filter(w => w.name.toLowerCase().includes(q) || w.address.toLowerCase().includes(q))
            : [...wallets];
        if (sortOrder === 'name-az') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOrder === 'name-za') result.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortOrder === 'oldest') result = result.reverse();
        return result;
    }, [wallets, search, sortOrder]);

    const handleSave = ({ name, network, currency, editingWallet }) => {
        if (editingWallet) {
            setWallets(prev => prev.map(w => w.id === editingWallet.id ? { ...w, name } : w));
        } else {
            setWallets(prev => [{
                id: `w-${Date.now()}`,
                name,
                address: generateAddress(),
                balance: 0,
                currency: currency ?? 'ETH',
                network: network ?? 'ethereum',
                createdAt: new Date().toISOString(),
            }, ...prev]);
        }
    };

    const handleDelete = () => {
        setWallets(prev => prev.filter(w => w.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const openEdit = (w) => { setEditingWallet(w); setIsModalOpen(true); };
    const openAdd  = () => { setEditingWallet(null); setIsModalOpen(true); };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">My Wallet</h2>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-sm font-bold">
                        {wallets.length}
                    </span>
                    <Button variant="primary" size="sm" onClick={openAdd}>
                        <Icon name="plus" size={14} />
                        Add New
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search wallets…"
                            className="pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all w-48"
                            aria-label="Search wallets"
                        />
                    </div>
                    {/* Sort */}
                    <FilterDropdown
                        label="Sort by"
                        value={sortOrder}
                        options={SORT_OPTIONS}
                        onChange={setSortOrder}
                        icon="arrowUpDown"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide w-40">Wallet Name</th>
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Address</th>
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide w-32">Balance</th>
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide w-52">Created</th>
                            <th className="px-5 py-3 w-20" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                                    {search ? 'No wallets match your search.' : 'No wallets yet.'}
                                </td>
                            </tr>
                        ) : filtered.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{w.name}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center">
                                        <span className="font-mono text-sm text-gray-600 truncate max-w-xs">{w.address}</span>
                                        <CopyButton text={w.address} />
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                    <span className="font-semibold text-gray-900">{w.balance.toFixed(2)}</span>
                                    <span className="ml-1 text-sm text-gray-400">{w.currency}</span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-500 text-sm whitespace-nowrap">{w.createdAt}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => openEdit(w)}
                                            title="Rename"
                                            className="text-primary-600 hover:text-primary-800 transition-colors"
                                        >
                                            <Icon name="edit" size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(w)}
                                            title="Delete"
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Icon name="trash" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Modal */}
            <WalletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingWallet={editingWallet}
            />

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Wallet"
                size="sm"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                }
            >
                <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteTarget?.name}</span>?
                    This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default WalletSettings;
