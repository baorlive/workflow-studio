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

/* ── Status badge ──────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const isRunning = status === 'running';
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-semibold',
                isRunning
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-[var(--color-text-muted)]'
            )}
        >
            <span
                className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    isRunning ? 'bg-green-500' : 'bg-gray-400'
                )}
            />
            {isRunning ? 'Running' : 'Stopped'}
        </span>
    );
};

const PLATFORM_LOGOS = {
    GCP: 'https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg',
    AWS: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
};

/* ── Platform badge ────────────────────────────────────────────────────────── */
const PlatformBadge = ({ platform }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-bold bg-primary-50 text-primary-700 border border-primary-100">
        <img src={PLATFORM_LOGOS[platform]} alt={platform} className="h-3 w-auto object-contain" />
        {platform}
    </span>
);

/* ── Detail row ────────────────────────────────────────────────────────────── */
const DetailRow = ({ label, value }) => (
    <div className="flex items-baseline justify-between py-3 border-b border-[var(--color-border)] last:border-0">
        <span className="text-sm text-[var(--color-text-muted)] font-medium">{label}</span>
        <span className="text-sm font-semibold text-[var(--color-text)] text-right max-w-[60%]">{value}</span>
    </div>
);

/* ── Server Detail Modal ───────────────────────────────────────────────────── */
const ServerDetailModal = ({ server, onClose, onEditResources }) => {
    if (!server) return null;
    return (
        <Modal
            isOpen={!!server}
            onClose={onClose}
            title="Server Detail"
            size="sm"
            footer={
                <div className="flex justify-center w-full">
                    <Button variant="primary" onClick={() => onEditResources(server)}>
                        Edit Resources
                    </Button>
                </div>
            }
        >
            <div className="divide-y divide-[var(--color-border)]">
                <DetailRow label="Server name" value={server.name} />
                <DetailRow label="Description" value={server.description} />
                <DetailRow label="Created on" value={server.createdOn} />
                <DetailRow
                    label="Created by"
                    value={
                        <span>
                            <span className="font-bold">{server.createdBy}</span>{' '}
                            <span className="text-[var(--color-text-muted)] font-normal">({server.createdByEmail})</span>
                        </span>
                    }
                />
                <DetailRow label="Platform" value={server.platform} />
                <DetailRow label="Namespace" value={server.namespace} />
                <DetailRow label="Deployment Mode" value={server.deploymentMode} />
                <DetailRow label="Memory" value={`${server.memory.toFixed(2)} GB`} />
                <DetailRow label="Number of CPU" value={server.cpu.toFixed(2)} />
            </div>
        </Modal>
    );
};

/* ── Create Server Modal ───────────────────────────────────────────────────── */
const CreateServerModal = ({ isOpen, onClose, onCreate }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        platform: 'GCP',
        environment: 'Development',
        memory: '1.00',
        cpu: '0.50',
    });

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onCreate({
            id: `s-${Date.now()}`,
            name: form.name.trim(),
            description: form.description.trim() || 'No description',
            createdOn: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
            createdBy: 'you',
            createdByEmail: 'you@example.com',
            platform: form.platform,
            namespace: 'defaultgroup',
            deploymentMode: 'Regular',
            memory: parseFloat(form.memory) || 1,
            cpu: parseFloat(form.cpu) || 0.5,
            status: 'stopped',
            environment: form.environment,
        });
        setForm({ name: '', description: '', platform: 'GCP', environment: 'Development', memory: '1.00', cpu: '0.50' });
        onClose();
    };

    const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all';
    const labelCls = 'block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Server"
            size="sm"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit}>Create Server</Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className={labelCls}>Server Name <span className="text-red-500">*</span></label>
                    <input
                        className={inputCls}
                        placeholder="e.g. prod-api-01"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className={labelCls}>Description</label>
                    <input
                        className={inputCls}
                        placeholder="Short description of this server"
                        value={form.description}
                        onChange={e => handleChange('description', e.target.value)}
                    />
                </div>

                {/* Provider */}
                <div>
                    <label className={labelCls}>Provider</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            {
                                id: 'GCP',
                                label: 'Google Cloud',
                                logo: 'https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg',
                            },
                            {
                                id: 'AWS',
                                label: 'Amazon AWS',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
                            },
                        ].map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleChange('platform', p.id)}
                                className={clsx(
                                    'flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all',
                                    form.platform === p.id
                                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-primary-300 hover:bg-primary-50'
                                )}
                            >
                                <img src={p.logo} alt={p.label} className="h-4 w-auto object-contain" />
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Environment */}
                <div>
                    <label className={labelCls}>Environment</label>
                    <div className="flex p-1 rounded-xl bg-gray-50 gap-1 border border-gray-200">
                        {['Development', 'Production'].map(env => (
                            <button
                                key={env}
                                type="button"
                                onClick={() => handleChange('environment', env)}
                                className={clsx(
                                    'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                                    form.environment === env
                                        ? 'bg-white text-[var(--color-text)] shadow-sm'
                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                )}
                            >
                                {env}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resource Configuration */}
                <div>
                    <label className={labelCls}>Resource Configuration</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">Memory (GB)</label>
                            <input
                                type="number"
                                min="0.25"
                                max="64"
                                step="0.25"
                                className={inputCls}
                                value={form.memory}
                                onChange={e => handleChange('memory', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">CPU</label>
                            <input
                                type="number"
                                min="0.25"
                                max="32"
                                step="0.25"
                                className={inputCls}
                                value={form.cpu}
                                onChange={e => handleChange('cpu', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

/* ── Resource section (reusable inside EditResourcesModal) ─────────────────── */
const ResourceSection = ({ title, icon, memory, cpu, onMemoryChange, onCpuChange, inputCls }) => (
    <div className="space-y-3">
        <div className="space-y-2">
            <div className="h-px bg-gray-100" />
            <div className="flex items-center gap-2">
                <Icon name={icon} size={13} className="text-gray-400" />
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</span>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">Memory (GB)</label>
                <input type="number" min="0.25" max="64" step="0.25" className={inputCls} value={memory} onChange={e => onMemoryChange(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">Number of CPU</label>
                <input type="number" min="0.25" max="32" step="0.25" className={inputCls} value={cpu} onChange={e => onCpuChange(e.target.value)} />
            </div>
        </div>
    </div>
);

/* ── Edit Resources Modal ──────────────────────────────────────────────────── */
const EditResourcesModal = ({ server, isOpen, onClose, onSave }) => {
    const [wfMemory, setWfMemory] = useState('1.00');
    const [wfCpu, setWfCpu] = useState('0.50');
    const [dbMemory, setDbMemory] = useState('0.50');
    const [dbCpu, setDbCpu] = useState('0.25');

    React.useEffect(() => {
        if (server) {
            setWfMemory(server.memory.toFixed(2));
            setWfCpu(server.cpu.toFixed(2));
            setDbMemory((server.dbMemory ?? server.memory / 2).toFixed(2));
            setDbCpu((server.dbCpu ?? server.cpu / 2).toFixed(2));
        }
    }, [server]);

    const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all';

    const handleSave = () => {
        onSave(server.id, {
            memory: parseFloat(wfMemory) || server.memory,
            cpu: parseFloat(wfCpu) || server.cpu,
            dbMemory: parseFloat(dbMemory) || 0.5,
            dbCpu: parseFloat(dbCpu) || 0.25,
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Resources"
            size="md"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                </div>
            }
        >
            <div className="space-y-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Update resource allocation for <span className="font-semibold text-[var(--color-text)]">{server?.name}</span>.
                </p>

                <ResourceSection
                    title="Workflow Server Resources"
                    icon="server"
                    memory={wfMemory}
                    cpu={wfCpu}
                    onMemoryChange={setWfMemory}
                    onCpuChange={setWfCpu}
                    inputCls={inputCls}
                />

                <ResourceSection
                    title="Database Resources"
                    icon="database"
                    memory={dbMemory}
                    cpu={dbCpu}
                    onMemoryChange={setDbMemory}
                    onCpuChange={setDbCpu}
                    inputCls={inputCls}
                />
            </div>
        </Modal>
    );
};


/* ── Server Card ───────────────────────────────────────────────────────────── */
const ServerCard = ({ server, onClick }) => (
    <button
        className="w-full text-left bg-white border border-[var(--color-border)] rounded-xl p-5 hover:border-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 group"
        onClick={() => onClick(server)}
        aria-label={`View details for ${server.name}`}
    >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                    <Icon name="server" size={18} className="text-primary-600" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--color-text)] truncate">{server.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] truncate">{server.namespace}</p>
                </div>
            </div>
            <StatusBadge status={server.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">{server.description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
            <PlatformBadge platform={server.platform} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-[var(--color-text-muted)]">
                <Icon name="cpu" size={11} />
                {server.cpu} CPU
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-[var(--color-text-muted)]">
                <Icon name="hardDrive" size={11} />
                {server.memory} GB
            </span>
            <span className={clsx(
                'ml-auto inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide',
                server.environment === 'Production'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-blue-50 text-blue-600'
            )}>
                {server.environment}
            </span>
        </div>
    </button>
);

/* ── ServersPage ───────────────────────────────────────────────────────────── */
const ServersPage = ({ initialServers = [] }) => {
    const [servers, setServers] = useState(initialServers);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedServer, setSelectedServer] = useState(null);
    const [editingServer, setEditingServer] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filtered = useMemo(() => {
        setCurrentPage(1);
        const q = search.toLowerCase().trim();
        let result = q
            ? servers.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.platform.toLowerCase().includes(q) ||
                s.environment.toLowerCase().includes(q))
            : [...servers];
        if (sortOrder === 'name-az') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOrder === 'name-za') result.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortOrder === 'oldest') result.reverse();
        return result;
    }, [servers, search, sortOrder]);

    const PAGE_SIZE = 9;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pagedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleCreate = (newServer) => setServers(prev => [newServer, ...prev]);

    const handleEditResources = (server) => {
        setSelectedServer(null);
        setEditingServer(server);
    };

    const handleSaveResources = (id, { memory, cpu, dbMemory, dbCpu }) => {
        setServers(prev => prev.map(s => s.id === id ? { ...s, memory, cpu, dbMemory, dbCpu } : s));
    };

    return (
        <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-hidden">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="shrink-0 px-8 pt-6 pb-5 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between gap-6">
                    {/* Left: title + add button */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Servers</h1>
                        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
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
                                placeholder="Search servers…"
                                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all w-56"
                                aria-label="Search servers"
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
                            <p className="text-sm font-semibold text-gray-700">No servers match your search</p>
                            <p className="text-sm text-gray-400 mt-1">Try a different keyword</p>
                        </div>
                    ) : (
                        pagedData.map(server => (
                            <ServerCard key={server.id} server={server} onClick={setSelectedServer} />
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
                            {filtered.length} server{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Modals ──────────────────────────────────────────────────── */}
            <ServerDetailModal
                server={selectedServer}
                onClose={() => setSelectedServer(null)}
                onEditResources={handleEditResources}
            />

            <CreateServerModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreate}
            />

            {editingServer && (
                <EditResourcesModal
                    server={editingServer}
                    isOpen={!!editingServer}
                    onClose={() => setEditingServer(null)}
                    onSave={handleSaveResources}
                />
            )}
        </div>
    );
};

export default ServersPage;
