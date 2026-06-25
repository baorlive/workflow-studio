import React, { useState, useRef, useEffect, memo } from 'react';
import Icon from '../ui/Icon';

/**
 * FilterDropdown Component
 *
 * Dropdown filter with icon, label, and options.
 * Includes click-outside detection and keyboard navigation (Escape, Enter/Space, ArrowUp/Down).
 */
export const FilterDropdown = memo(({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const optionRefs = useRef([]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus the highlighted option
    useEffect(() => {
        if (isOpen && focusedIndex >= 0) {
            optionRefs.current[focusedIndex]?.focus();
        }
    }, [isOpen, focusedIndex]);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    const handleTriggerKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(prev => !prev);
            if (!isOpen) setFocusedIndex(0);
        }
        if (e.key === 'Escape') { setIsOpen(false); setFocusedIndex(-1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); setIsOpen(true); setFocusedIndex(0); }
    };

    const handleOptionKeyDown = (e, index) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(Math.min(index + 1, options.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(Math.max(index - 1, 0)); }
        if (e.key === 'Escape') { setIsOpen(false); setFocusedIndex(-1); }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(options[index].value);
            setIsOpen(false);
            setFocusedIndex(-1);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setIsOpen(!isOpen); setFocusedIndex(-1); }}
                onKeyDown={handleTriggerKeyDown}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors focus:outline-none"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {icon && <Icon name={icon} size={14} className="text-gray-500" />}
                {label && <span className="text-gray-500">{label}:</span>}
                <span className="text-gray-900">{selectedLabel}</span>
                <Icon
                    name="chevronDown"
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div role="listbox" className="max-h-60 overflow-y-auto">
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                ref={el => optionRefs.current[index] = el}
                                onClick={() => { onChange(option.value); setIsOpen(false); setFocusedIndex(-1); }}
                                onKeyDown={(e) => handleOptionKeyDown(e, index)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors ${value === option.value
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700'
                                }`}
                                role="option"
                                aria-selected={value === option.value}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Icon name="check" size={14} className="text-primary-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;
