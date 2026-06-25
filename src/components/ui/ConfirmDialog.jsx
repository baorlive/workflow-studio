import React from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

/**
 * ConfirmDialog Component
 * 
 * Confirmation dialog with cancel and confirm buttons
 * Supports destructive actions with different styling
 * 
 * @param {boolean} isOpen - Dialog open state
 * @param {function} onClose - Close handler
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {function} onConfirm - Confirm handler
 * @param {string} confirmLabel - Confirm button label
 * @param {string} cancelLabel - Cancel button label
 * @param {boolean} isDestructive - Whether action is destructive (uses red styling)
 */
export const ConfirmDialog = ({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isDestructive = false,
    type = isDestructive ? "danger" : "warning", // 'info', 'success', 'warning', 'danger'
    showCancel = true
}) => {
    // Icon and color mapping based on type
    const styles = {
        danger: {
            bg: "bg-[var(--button-danger-bg)]/10",
            text: "text-[var(--button-danger-bg)]",
            icon: "alertTriangle",
            btnVariant: "danger"
        },
        warning: {
            bg: "bg-[var(--button-secondary-bg)]",
            text: "text-[var(--color-text)]",
            icon: "alertTriangle",
            btnVariant: "primary" // Keep primary for warning as it was default
        },
        success: {
            bg: "bg-[var(--button-success-bg)]/10",
            text: "text-[var(--button-success-bg)]",
            icon: "checkCircle",
            btnVariant: "success" // Assuming success variant exists or fallback to primary
        },
        info: {
            bg: "bg-[var(--button-secondary-bg)]",
            text: "text-[var(--color-text)]",
            icon: "info",
            btnVariant: "primary"
        }
    };

    const style = styles[type] || styles.warning;

    // Use the variant defined in styles
    const buttonVariant = style.btnVariant;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    {showCancel && (
                        <Button onClick={onClose} variant="secondary">
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        onClick={onConfirm}
                        variant={buttonVariant}
                        autoFocus
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-[var(--button-radius)] border border-[var(--card-border)] shrink-0 ${style.bg}`}>
                    <Icon
                        name={style.icon}
                        size={24}
                        className={style.text}
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
