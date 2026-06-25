import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import Icon from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FilterDropdown } from '../workspace/FilterDropdown';
import { NETWORKS } from '../../data/mockContracts';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name-az', label: 'Name (A–Z)' },
    { value: 'name-za', label: 'Name (Z–A)' },
];

/* ── Shared styles ─────────────────────────────────────────────────────────── */
const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all';
const labelCls = 'block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1';

/* ── Status badge ──────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const isVerified = status === 'verified';
    return (
        <span className={clsx(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-sm font-semibold',
            isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
        )}>
            <Icon name={isVerified ? 'checkCircle' : 'alertCircle'} size={11} />
            {isVerified ? 'Verified' : 'Unverified'}
        </span>
    );
};

/* ── Section divider ───────────────────────────────────────────────────────── */
const SectionDivider = ({ title }) => (
    <div className="space-y-2 pt-1">
        <div className="h-px bg-gray-100" />
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</span>
        </div>
    </div>
);

/* ── Add Contract Modal ────────────────────────────────────────────────────── */
const AddContractModal = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
        name: '',
        network: 'Mainnet',
        apiKey: '',
        registeredCredential: '',
        details: '',
    });

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleAdd = () => {
        if (!form.name.trim()) return;
        onAdd({
            id: `c-${Date.now()}`,
            name: form.name.trim(),
            address: '0x' + Math.random().toString(16).slice(2, 18).toUpperCase() + '...' + Math.random().toString(16).slice(2, 6).toUpperCase(),
            fullAddress: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            network: form.network,
            status: 'unverified',
            createdOn: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
            createdBy: 'you',
            createdByEmail: 'you@example.com',
            apiKey: form.apiKey || 'No Auth',
            registeredCredential: form.registeredCredential,
            details: form.details,
        });
        setForm({ name: '', network: 'Mainnet', apiKey: '', registeredCredential: '', details: '' });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Contract"
            size="sm"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleAdd}>Add</Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Warning */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <Icon name="alertTriangle" size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">You can only add a contract which has been publicly verified.</p>
                </div>

                {/* Contract Name */}
                <div>
                    <label className={labelCls}>Contract Name <span className="text-red-500">*</span></label>
                    <input className={inputCls} placeholder="e.g. WorkflowToken" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>

                {/* Networks */}
                <SectionDivider title="Networks" />
                <div>
                    <label className={labelCls}>Select Network</label>
                    <select className={inputCls} value={form.network} onChange={e => set('network', e.target.value)}>
                        {NETWORKS.map(n => <option key={n}>{n}</option>)}
                    </select>
                </div>

                {/* Credentials */}
                <SectionDivider title="Credentials" />
                <div>
                    <label className={labelCls}>API Key <span className="text-[var(--color-text-muted)] normal-case font-normal">(Optional)</span></label>
                    <input className={inputCls} placeholder="No Auth" value={form.apiKey} onChange={e => set('apiKey', e.target.value)} />
                </div>
                <div>
                    <label className={labelCls}>Registered Credential(s)</label>
                    <input className={inputCls} placeholder="$noAuth" value={form.registeredCredential} onChange={e => set('registeredCredential', e.target.value)} />
                </div>

                {/* Contract Details */}
                <SectionDivider title="Contract Details" />
                <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                        className={clsx(inputCls, 'resize-none min-h-[80px]')}
                        placeholder="Brief description of this contract"
                        value={form.details}
                        onChange={e => set('details', e.target.value)}
                    />
                </div>
            </div>
        </Modal>
    );
};

/* ── Edit Contract Modal ───────────────────────────────────────────────────── */
const EditContractModal = ({ contract, isOpen, onClose, onSave, onDelete }) => {
    const [form, setForm] = useState({
        network: contract?.network ?? 'Mainnet',
        apiKey: contract?.apiKey ?? '',
        registeredCredential: contract?.registeredCredential ?? '',
        details: contract?.details ?? '',
    });
    const [copied, setCopied] = useState(false);

    React.useEffect(() => {
        if (contract) {
            setForm({
                network: contract.network,
                apiKey: contract.apiKey,
                registeredCredential: contract.registeredCredential,
                details: contract.details,
            });
        }
    }, [contract]);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleCopy = () => {
        navigator.clipboard.writeText(contract?.fullAddress ?? '').catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleSave = () => {
        onSave(contract.id, form);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Contract"
            size="sm"
            footer={
                <div className="flex gap-2 w-full">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={() => { onDelete(contract.id); onClose(); }}>Delete</Button>
                    <Button variant="primary" onClick={handleSave} className="ml-auto">Save</Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Address */}
                <div>
                    <label className={labelCls}>Address</label>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-mono text-[var(--color-text)] truncate flex-1">{contract?.address}</span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors shrink-0"
                            aria-label="Copy address"
                            title={copied ? 'Copied!' : 'Copy address'}
                        >
                            <Icon name={copied ? 'check' : 'copy'} size={14} />
                        </button>
                        <a
                            href={`https://etherscan.com/address/${contract?.fullAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors shrink-0"
                            aria-label="View on Etherscan"
                        >
                            <Icon name="externalLink" size={14} />
                        </a>
                    </div>
                </div>

                {/* Networks */}
                <SectionDivider title="Networks" />
                <div>
                    <label className={labelCls}>Select Network</label>
                    <select className={inputCls} value={form.network} onChange={e => set('network', e.target.value)}>
                        {NETWORKS.map(n => <option key={n}>{n}</option>)}
                    </select>
                </div>

                {/* Credentials */}
                <SectionDivider title="Credentials" />
                <div>
                    <label className={clsx(labelCls, 'flex items-center gap-1')}>
                        API Key <span className="text-[var(--color-text-muted)] normal-case font-normal">(Optional)</span>
                        <button type="button" className="text-[var(--color-text-muted)] hover:text-primary-600" aria-label="Info">
                            <Icon name="info" size={12} />
                        </button>
                    </label>
                    <input className={inputCls} placeholder="No Auth" value={form.apiKey} onChange={e => set('apiKey', e.target.value)} />
                </div>
                <div>
                    <label className={clsx(labelCls, 'flex items-center gap-1')}>
                        Registered Credential(s) — $noAuth
                        <button type="button" className="text-[var(--color-text-muted)] hover:text-primary-600" aria-label="Info">
                            <Icon name="info" size={12} />
                        </button>
                    </label>
                    <input className={inputCls} placeholder="" value={form.registeredCredential} onChange={e => set('registeredCredential', e.target.value)} />
                </div>

                {/* Contract Details */}
                <SectionDivider title="Contract Details" />
                <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                        className={clsx(inputCls, 'resize-none min-h-[80px]')}
                        value={form.details}
                        onChange={e => set('details', e.target.value)}
                    />
                </div>
            </div>
        </Modal>
    );
};


/* ── Contract Card ─────────────────────────────────────────────────────────── */
const ContractCard = ({ contract, onClick }) => (
    <button
        className="w-full text-left bg-white border border-[var(--color-border)] rounded-xl p-5 hover:border-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 group"
        onClick={() => onClick(contract)}
        aria-label={`Edit contract ${contract.name}`}
    >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                    <Icon name="fileCode" size={18} className="text-primary-600" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--color-text)] truncate">{contract.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] font-mono truncate">{contract.address}</p>
                </div>
            </div>
            <StatusBadge status={contract.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">{contract.details || 'No description'}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                <Icon name="globe" size={11} />
                {contract.network}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-[var(--color-text-muted)]">
                <Icon name="user" size={11} />
                {contract.createdBy}
            </span>
            <span className="ml-auto text-sm text-[var(--color-text-muted)]">{contract.createdOn}</span>
        </div>
    </button>
);

/* ── ContractsPage ─────────────────────────────────────────────────────────── */
const ContractsPage = ({ initialContracts = [] }) => {
    const [contracts, setContracts] = useState(initialContracts);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingContract, setEditingContract] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const filtered = useMemo(() => {
        setCurrentPage(1);
        const q = search.toLowerCase().trim();
        let result = q
            ? contracts.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.address.toLowerCase().includes(q) ||
                c.network.toLowerCase().includes(q))
            : [...contracts];
        if (sortOrder === 'name-az') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOrder === 'name-za') result.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortOrder === 'oldest') result.reverse();
        return result;
    }, [contracts, search, sortOrder]);

    const PAGE_SIZE = 9;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pagedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleAdd = (contract) => setContracts(prev => [contract, ...prev]);

    const handleSave = (id, form) => {
        setContracts(prev => prev.map(c => c.id === id ? { ...c, ...form } : c));
    };

    const handleDelete = (id) => {
        setContracts(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-hidden">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="shrink-0 px-8 pt-6 pb-5 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between gap-6">
                    {/* Left: title + add button */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
                        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
                            <Icon name="plus" size={14} />
                            Add New
                        </Button>
                    </div>
                    {/* Right: search + sort */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search contracts…"
                                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all w-56"
                                aria-label="Search contracts"
                            />
                        </div>
                        <FilterDropdown
                            label="Sort by"
                            value={sortOrder}
                            options={SORT_OPTIONS}
                            onChange={setSortOrder}
                            icon="arrowUpDown"
                        />
                    </div>
                </div>
            </div>

            {/* ── Grid ────────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.length === 0 && search ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-48 text-center">
                            <p className="text-sm font-semibold text-gray-700">No contracts match your search</p>
                            <p className="text-sm text-gray-400 mt-1">Try a different keyword</p>
                        </div>
                    ) : (
                        pagedData.map(contract => (
                            <ContractCard key={contract.id} contract={contract} onClick={setEditingContract} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                        >
                            <Icon name="chevronLeft" size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                        >
                            <Icon name="chevronRight" size={18} />
                        </button>
                        <span className="ml-2 text-sm text-gray-400">
                            {filtered.length} contract{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Modals ──────────────────────────────────────────────────── */}
            <AddContractModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleAdd}
            />

            {editingContract && (
                <EditContractModal
                    contract={editingContract}
                    isOpen={!!editingContract}
                    onClose={() => setEditingContract(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ContractsPage;
