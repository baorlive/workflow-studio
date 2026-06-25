import React from 'react';
import clsx from 'clsx';

/**
 * Button Component
 * 
 * Reusable button with multiple variants and sizes
 * 
 * @param {React.ReactNode} children - Button content
 * @param {'primary' | 'secondary' | 'ghost' | 'danger' | 'success'} variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} size - Button size
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className = '',
    disabled = false,
    autoFocus = false
}) => {
    const baseClasses = [
        "inline-flex items-center justify-center border",
        "rounded-[var(--button-radius)] font-[var(--button-font-weight)]",
        "transition-all select-none",
        "focus:outline-none",
        "text-[var(--btn-text)] border-[var(--btn-border)]",
        "bg-[var(--btn-bg)] shadow-[var(--btn-shadow)]",
        "hover:bg-[var(--btn-bg-hover)] hover:border-[var(--btn-border-hover)] hover:shadow-[var(--btn-shadow-hover)]",
        "active:bg-[var(--btn-bg-active)] active:border-[var(--btn-border-active)] active:shadow-[var(--btn-shadow-active)] active:translate-y-px"
    ].join(" ");

    const variantStyles = {
        primary: {
            '--btn-bg': 'var(--button-primary-bg)',
            '--btn-bg-hover': 'var(--button-primary-bg-hover)',
            '--btn-bg-active': 'var(--button-primary-bg-hover)',
            '--btn-text': 'var(--button-primary-text)',
            '--btn-border': 'transparent',
            '--btn-border-hover': 'transparent',
            '--btn-border-active': 'transparent',
            '--btn-shadow': 'var(--button-primary-shadow)',
            '--btn-shadow-hover': 'var(--primitive-shadow-md)',
            '--btn-shadow-active': 'inset 0 1px 2px rgba(15, 23, 42, 0.18)',
        },
        secondary: {
            '--btn-bg': 'var(--button-secondary-bg)',
            '--btn-bg-hover': 'var(--button-secondary-bg-hover)',
            '--btn-bg-active': 'var(--button-secondary-bg-hover)',
            '--btn-text': 'var(--button-secondary-text)',
            '--btn-border': 'var(--button-secondary-border)',
            '--btn-border-hover': 'var(--button-secondary-border)',
            '--btn-border-active': 'var(--button-secondary-border)',
            '--btn-shadow': 'var(--primitive-shadow-sm)',
            '--btn-shadow-hover': 'var(--primitive-shadow-md)',
            '--btn-shadow-active': 'inset 0 1px 2px rgba(15, 23, 42, 0.12)',
        },
        ghost: {
            '--btn-bg': 'var(--button-ghost-bg)',
            '--btn-bg-hover': 'var(--button-ghost-bg-hover)',
            '--btn-bg-active': 'var(--button-ghost-bg-hover)',
            '--btn-text': 'var(--button-ghost-text)',
            '--btn-border': 'transparent',
            '--btn-border-hover': 'transparent',
            '--btn-border-active': 'transparent',
            '--btn-shadow': 'none',
            '--btn-shadow-hover': 'none',
            '--btn-shadow-active': 'none',
        },
        danger: {
            '--btn-bg': 'var(--button-danger-bg)',
            '--btn-bg-hover': 'var(--button-danger-bg-hover)',
            '--btn-bg-active': 'var(--button-danger-bg-hover)',
            '--btn-text': 'var(--button-danger-text)',
            '--btn-border': 'transparent',
            '--btn-border-hover': 'transparent',
            '--btn-border-active': 'transparent',
            '--btn-shadow': 'var(--primitive-shadow-sm)',
            '--btn-shadow-hover': 'var(--primitive-shadow-md)',
            '--btn-shadow-active': 'inset 0 1px 2px rgba(15, 23, 42, 0.18)',
        },
        success: {
            '--btn-bg': 'var(--button-success-bg)',
            '--btn-bg-hover': 'var(--button-success-bg-hover)',
            '--btn-bg-active': 'var(--button-success-bg-hover)',
            '--btn-text': 'var(--button-success-text)',
            '--btn-border': 'transparent',
            '--btn-border-hover': 'transparent',
            '--btn-border-active': 'transparent',
            '--btn-shadow': 'var(--primitive-shadow-sm)',
            '--btn-shadow-hover': 'var(--primitive-shadow-md)',
            '--btn-shadow-active': 'inset 0 1px 2px rgba(15, 23, 42, 0.18)',
        },
    };

    const sizeStyles = {
        sm: {
            '--btn-px': 'var(--button-padding-x-sm)',
            '--btn-py': 'var(--button-padding-y-sm)',
            '--btn-fs': 'var(--button-font-size-sm)',
        },
        md: {
            '--btn-px': 'var(--button-padding-x-md)',
            '--btn-py': 'var(--button-padding-y-md)',
            '--btn-fs': 'var(--button-font-size-md)',
        },
        lg: {
            '--btn-px': 'var(--button-padding-x-lg)',
            '--btn-py': 'var(--button-padding-y-lg)',
            '--btn-fs': 'var(--button-font-size-lg)',
        },
    };

    const sizeClasses = "px-[var(--btn-px)] py-[var(--btn-py)] text-[var(--btn-fs)]";

    const disabledClasses = disabled
        ? "cursor-not-allowed opacity-[var(--button-disabled-opacity)] pointer-events-none"
        : "";

    return (
        <button
            className={clsx(
                baseClasses,
                sizeClasses,
                disabledClasses,
                className
            )}
            onClick={onClick}
            disabled={disabled}
            autoFocus={autoFocus}
            type="button"
            style={{
                ...variantStyles[variant],
                ...sizeStyles[size],
                transitionDuration: 'var(--button-transition-duration)',
            }}
        >
            {children}
        </button>
    );
};

export default Button;
