import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import Icon from '../ui/Icon';
import { WORKFLOW_CARD_VISIBLE_ICONS } from '../../constants/ui';

const flattenFolders = (folders, level = 0) => {
    return folders.reduce((acc, folder) => {
        acc.push({ ...folder, level });
        if (folder.children) {
            acc = acc.concat(flattenFolders(folder.children, level + 1));
        }
        return acc;
    }, []);
};

export const WorkflowCard = memo(({ workflow, projectName, isDraft, onEdit, onShare, onDuplicate, onDelete, onMove, folders = [] }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showFolderMenu, setShowFolderMenu] = useState(false);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);
    const folderTriggerRef = useRef(null);
    const folderMenuRef = useRef(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                setShowMenu(false);
            }
            if (folderMenuRef.current && !folderMenuRef.current.contains(event.target) &&
                folderTriggerRef.current && !folderTriggerRef.current.contains(event.target)) {
                setShowFolderMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuAction = (e, action) => {
        e.stopPropagation();
        action && action(workflow);
        setShowMenu(false);
    };

    const handleMove = (e, folderId) => {
        e.stopPropagation();
        onMove && onMove(workflow.id, folderId);
        setShowFolderMenu(false);
    };

    const flatFolders = useMemo(() => flattenFolders(folders), [folders]);

    const isDraftProject = isDraft || projectName === 'Draft' || workflow.folderId === 'drafts' || !workflow.folderId;
    const projectBadgeLabel = projectName || (isDraftProject ? 'Draft' : '');
    const updatedLabel = (() => {
        const rawDate = String(workflow?.date || '').trim();
        if (!rawDate) return 'Updated recently';
        return /^updated\b/i.test(rawDate) ? rawDate : `Updated ${rawDate}`;
    })();

    const handleCardActivate = () => {
        if (!onEdit) return;
        onEdit(workflow);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCardActivate();
        }
    };

    // Icon display: show up to WORKFLOW_CARD_VISIBLE_ICONS, then show hidden count
    const icons = workflow.icons || [];
    const visibleIcons = icons.slice(0, WORKFLOW_CARD_VISIBLE_ICONS);
    const hiddenCount = Math.max(0, icons.length - WORKFLOW_CARD_VISIBLE_ICONS);
    // Static z-index classes (Tailwind JIT requires static strings)
    const iconZClasses = ['z-10', 'z-0'];

    return (
        <div
            className="group bg-white rounded-xl p-4 border border-[var(--color-border)] hover:border-white hover:shadow-md transition-all duration-200 cursor-pointer relative"
            role="button"
            tabIndex={0}
            aria-label={`Open workflow ${workflow.name}`}
            onClick={handleCardActivate}
            onKeyDown={handleKeyDown}
        >
            {/* Header: Icons + Count + Menu Trigger */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                    {visibleIcons.map((icon, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg border-2 border-[var(--color-surface-elevated)] flex items-center justify-center ${i === 0 ? 'bg-primary-50 text-primary-500' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'} ${iconZClasses[i] || 'z-0'}`}
                        >
                            <Icon name={icon} size={16} />
                        </div>
                    ))}
                    {hiddenCount > 0 && (
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-surface-elevated)] flex items-center justify-center text-sm font-semibold text-[var(--color-text-subtle)] z-0">
                            +{hiddenCount}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        ref={triggerRef}
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className={`p-1 rounded-md text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-all ${showMenu ? 'opacity-100 bg-[var(--color-surface)]' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                        <Icon name="moreHorizontal" size={16} />
                    </button>

                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 top-full mt-1 w-36 bg-[var(--color-surface-elevated)] rounded-lg shadow-xl border border-[var(--color-border)] py-1 z-20 text-left"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={(e) => handleMenuAction(e, onEdit)} className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] flex items-center gap-2">
                                <Icon name="edit" size={14} /> Edit
                            </button>
                            <button onClick={(e) => handleMenuAction(e, onShare)} className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] flex items-center gap-2">
                                <Icon name="share" size={14} /> Share
                            </button>
                            <button onClick={(e) => handleMenuAction(e, onDuplicate)} className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] flex items-center gap-2">
                                <Icon name="copy" size={14} /> Duplicate
                            </button>
                            <div className="h-px bg-[var(--color-border)] my-1"></div>
                            <button onClick={(e) => handleMenuAction(e, onDelete)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Icon name="trash" size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-1">
                <span className="text-sm font-medium text-[var(--color-text-muted)] opacity-30">{updatedLabel}</span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-[var(--card-title)] mb-3 text-[15px]">
                {workflow.name}
            </h3>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-auto">
                {(workflow.tags || []).map((tag, i) => {
                    let style = "bg-[var(--color-surface)] text-[var(--color-text-muted)]";
                    if (tag === 'Working in Progress') style = "bg-primary-50 text-primary-600";
                    if (tag === 'Deployed') style = "bg-green-50 text-green-600";
                    if (tag === 'Draft') style = "bg-[var(--color-surface)] text-[var(--color-text-muted)]";
                    return (
                        <span key={i} className={`text-sm font-semibold px-2.5 py-1 rounded-md ${style}`}>
                            {tag}
                        </span>
                    );
                })}
            </div>

            {/* Footer: Date & Comments */}
            <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3 relative">
                    {/* Project Badge */}
                    <button
                        ref={folderTriggerRef}
                        type="button"
                        aria-label={`Move to folder, current: ${projectBadgeLabel}`}
                        aria-expanded={showFolderMenu}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider max-w-[120px] cursor-pointer transition-colors ${isDraftProject
                                ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-subtle)] hover:bg-[var(--color-surface)]'
                                : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                            }`}
                        onClick={(e) => { e.stopPropagation(); setShowFolderMenu(!showFolderMenu); }}
                    >
                        <Icon name={isDraftProject ? "fileText" : "folder"} size={10} />
                        <span className="truncate">{projectBadgeLabel}</span>
                    </button>

                    {/* Folder Selection Menu */}
                    {showFolderMenu && (
                        <div
                            ref={folderMenuRef}
                            className="absolute left-0 bottom-full mb-1 w-48 bg-[var(--color-surface-elevated)] rounded-lg shadow-xl border border-[var(--color-border)] py-1 z-30 max-h-48 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] mb-1">
                                Move to folder
                            </div>
                            {flatFolders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={(e) => handleMove(e, folder.id)}
                                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--color-surface)] flex items-center gap-2 ${workflow.folderId === folder.id ? 'text-primary-600 bg-primary-50 font-medium' : 'text-[var(--color-text)]'}`}
                                    style={{ paddingLeft: `${folder.level * 12 + 12}px` }}
                                >
                                    <Icon name={folder.id === 'drafts' ? 'fileText' : 'folder'} size={12} />
                                    <span className="truncate">{folder.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <span className="text-sm font-medium text-gray-400"></span>
                </div>

                <div className="flex items-center gap-1 text-[var(--color-text-subtle)]">
                    <Icon name="messageSquare" size={14} />
                    <span className="text-sm font-medium">{workflow.comments}</span>
                </div>
            </div>
        </div>
    );
}, (prev, next) =>
    prev.workflow.id === next.workflow.id &&
    prev.workflow.updatedAt === next.workflow.updatedAt &&
    prev.workflow.name === next.workflow.name &&
    prev.projectName === next.projectName &&
    prev.folders === next.folders
);

WorkflowCard.displayName = 'WorkflowCard';

export default WorkflowCard;
