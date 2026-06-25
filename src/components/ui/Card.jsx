import React from 'react';
import clsx from 'clsx';

const Card = ({ as: Component = 'div', className = '', ...props }) => {
    return (
        <Component
            className={clsx(
                'rounded-[calc(var(--card-radius)+2px)] border',
                'bg-[var(--card-bg)] border-[var(--card-border)]',
                'shadow-[var(--card-shadow)]',
                'p-[var(--card-padding)]',
                className
            )}
            {...props}
        />
    );
};

export default Card;
