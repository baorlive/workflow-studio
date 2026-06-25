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

const MOCK_KEYS = [
    { id: 'k1', name: 'airshow',     key: 'Ppj3DGXMYgoq5OOxkS9eWIf+g8P6r41+3fpqnzyQXXY=', createdAt: '2026-01-12T07:18:43.720Z' },
    { id: 'k2', name: 'chesshub-key', key: 'kMRtm0dBQacMnuPJBH/00736z1rfCkzq9r6tt/4wv9E=', createdAt: '2025-12-26T15:40:37.743Z' },
    { id: 'k3', name: 'blindbox-key', key: '4CyHlr/dSdYFyXas0dQF2WbsmWWgG/De39dtDei+Ix4=', createdAt: '2025-02-19T06:47:48.248Z' },
    { id: 'k4', name: 'stayNex-key',  key: 'N3gFwCW/cbCrZX1DrerR2r8VPnejCMDfMKkPeu4688g=', createdAt: '2025-02-14T06:10:09.568Z' },
    { id: 'k5', name: 'opex-key',     key: 'NT5NC34B9SH8wMZp8JbP660ZbzBfWbrzyEhpc0wQvQU=', createdAt: '2025-01-21T06:12:29.767Z' },
];

function generateKey() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/(.{44})/, '$1=');
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

/* ── Add / Edit Modal ───────────────────────────────────────────────────────── */
const ApiKeyModal = ({ isOpen, onClose, onSave, editingKey }) => {
    const [name, setName] = useState('');

    React.useEffect(() => {
        setName(editingKey ? editingKey.name : '');
    }, [editingKey, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), editingKey });
        onClose();
    };

    const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingKey ? 'Rename API Key' : 'Create New API Key'}
            size="sm"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {editingKey ? 'Save Changes' : 'Create Key'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Key Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={inputCls}
                        placeholder="e.g. my-project-key"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                        required
                    />
                </div>
                {!editingKey && (
                    <p className="text-sm text-gray-400">A secure API key will be generated automatically.</p>
                )}
            </form>
        </Modal>
    );
};

/* ── ApiKeySettings ─────────────────────────────────────────────────────────── */
const ApiKeySettings = () => {
    const [keys, setKeys] = useState(MOCK_KEYS);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        let result = q
            ? keys.filter(k => k.name.toLowerCase().includes(q))
            : [...keys];
        if (sortOrder === 'name-az') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOrder === 'name-za') result.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortOrder === 'oldest') result = result.reverse();
        return result;
    }, [keys, search, sortOrder]);

    const handleSave = ({ name, editingKey }) => {
        if (editingKey) {
            setKeys(prev => prev.map(k => k.id === editingKey.id ? { ...k, name } : k));
        } else {
            setKeys(prev => [{
                id: `k-${Date.now()}`,
                name,
                key: generateKey(),
                createdAt: new Date().toISOString(),
            }, ...prev]);
        }
    };

    const handleDelete = () => {
        setKeys(prev => prev.filter(k => k.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const openEdit = (k) => { setEditingKey(k); setIsModalOpen(true); };
    const openAdd  = () => { setEditingKey(null); setIsModalOpen(true); };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-sm font-bold">
                        {keys.length}
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
                            placeholder="Search keys…"
                            className="pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all w-48"
                            aria-label="Search API keys"
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
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide w-40">Key Name</th>
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">API Key</th>
                            <th className="text-left px-5 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide w-52">Created</th>
                            <th className="px-5 py-3 w-20" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                                    {search ? 'No keys match your search.' : 'No API keys yet.'}
                                </td>
                            </tr>
                        ) : filtered.map(k => (
                            <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{k.name}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center">
                                        <span className="font-mono text-sm text-gray-600 truncate max-w-xs">{k.key}</span>
                                        <CopyButton text={k.key} />
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-gray-500 text-sm whitespace-nowrap">{k.createdAt}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => openEdit(k)}
                                            title="Rename"
                                            className="text-primary-600 hover:text-primary-800 transition-colors"
                                        >
                                            <Icon name="edit" size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(k)}
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
            <ApiKeyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingKey={editingKey}
            />

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete API Key"
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

export default ApiKeySettings;
