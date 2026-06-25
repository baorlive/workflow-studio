import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

export const Dropdown = ({
    trigger,
    items = [],
    align = 'right',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                setIsOpen(true);
                setFocusedIndex(0);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => (prev + 1) % items.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && items[focusedIndex]) {
                    handleItemClick(items[focusedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setFocusedIndex(-1);
                break;
            case 'Tab':
                setIsOpen(false);
                setFocusedIndex(-1);
                break;
        }
    };

    const handleItemClick = (item) => {
        item.onClick();
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    return (
        <div
            className={`relative inline-block text-left ${className}`}
            ref={dropdownRef}
            onKeyDown={handleKeyDown}
        >
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`
                        absolute z-50 mt-2 w-56 rounded-[var(--card-radius)] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] focus:outline-none
                        transform transition-all duration-200 ease-out origin-top-${align}
                        ${align === 'right' ? 'right-0' : 'left-0'}
                        animate-in fade-in zoom-in-95
                    `}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex="-1"
                >
                    <div className="py-1" role="none">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item)}
                                className={`
                                    group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150
                                    ${index === focusedIndex ? 'bg-[var(--button-secondary-bg)] text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}
                                    hover:bg-[var(--button-secondary-bg)] hover:text-[var(--color-text)]
                                `}
                                role="menuitem"
                                tabIndex="-1"
                                id={`menu-item-${index}`}
                                onMouseEnter={() => setFocusedIndex(index)}
                            >
                                {item.icon && (
                                    <span className="mr-3 text-[var(--color-text-subtle)] group-hover:text-[var(--color-text-muted)] transition-colors">
                                        <Icon name={item.icon} size={16} />
                                    </span>
                                )}
                                {item.label}
                                {item.selected && (
                                    <span className="ml-auto text-primary-600">
                                        <Icon name="check" size={16} />
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
