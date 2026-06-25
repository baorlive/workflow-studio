import React from 'react';
import clsx from 'clsx';

const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
    return (
        <input
            ref={ref}
            className={clsx(
                'w-full',
                'rounded-[var(--input-radius)]',
                'px-[var(--input-padding-x)] py-[var(--input-padding-y)]',
                'text-[var(--input-font-size)]',
                'bg-[var(--input-bg)] text-[var(--input-text)]',
                'border border-[var(--input-border)]',
                'placeholder:text-[var(--input-placeholder)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--input-ring-focus)] focus:border-[var(--input-border-focus)]',
                'disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-text)] disabled:cursor-not-allowed',
                className
            )}
            {...props}
        />
    );
});

export default Input;
