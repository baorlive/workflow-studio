import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

/**
 * ShareModal Component
 * 
 * Modal for sharing workflows with permission controls
 * Generates shareable link and allows copying to clipboard
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close handler
 * @param {string} workflowName - Name of workflow to share
 */
export const ShareModal = ({ isOpen, onClose, workflowName }) => {
    const [permission, setPermission] = useState('view');
    const [copied, setCopied] = useState(false);

    // Generate shareable link
    const link = `https://example.com/workflow/${workflowName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Share Workflow"
            footer={
                <Button onClick={onClose} variant="primary">
                    Done
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Share Link */}
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                        Share Link
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center bg-[var(--button-secondary-bg)] border border-[var(--card-border)] rounded-[calc(var(--button-radius)+4px)] px-3 py-2">
                            <Icon name="link" size={16} className="text-[var(--color-text-subtle)] mr-2" />
                            <input
                                type="text"
                                readOnly
                                value={link}
                                className="bg-transparent border-none focus:outline-none text-sm text-[var(--color-text-muted)] w-full"
                            />
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--button-radius)] bg-[var(--button-secondary-bg)] border border-[var(--card-border)] text-[var(--color-text-muted)] font-medium hover:bg-[var(--button-secondary-bg-hover)] transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Icon name="check" size={16} className="text-[var(--button-success-bg)]" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Icon name="copy" size={16} />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Permissions */}
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                        Permissions
                    </label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 p-3 border border-[var(--card-border)] rounded-[calc(var(--button-radius)+4px)] cursor-pointer hover:bg-[var(--button-secondary-bg)] transition-colors">
                            <input
                                type="radio"
                                name="permission"
                                value="view"
                                checked={permission === 'view'}
                                onChange={(e) => setPermission(e.target.value)}
                                className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                            />
                            <div>
                                <div className="text-sm font-medium text-[var(--color-text)]">View Only</div>
                                <div className="text-sm text-[var(--color-text-subtle)]">Anyone with the link can view this workflow</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-[var(--card-border)] rounded-[calc(var(--button-radius)+4px)] cursor-pointer hover:bg-[var(--button-secondary-bg)] transition-colors">
                            <input
                                type="radio"
                                name="permission"
                                value="edit"
                                checked={permission === 'edit'}
                                onChange={(e) => setPermission(e.target.value)}
                                className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                            />
                            <div>
                                <div className="text-sm font-medium text-[var(--color-text)]">Can Edit</div>
                                <div className="text-sm text-[var(--color-text-subtle)]">Anyone with the link can edit this workflow</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
