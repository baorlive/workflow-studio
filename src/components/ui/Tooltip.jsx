import React, { useState, useId } from 'react';

export const Tooltip = ({ content, children, position = 'right' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const id = useId();
    const tooltipId = `tooltip-${id}`;

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        right: 'left-[-4px] top-1/2 -translate-y-1/2',
        left: 'right-[-4px] top-1/2 -translate-y-1/2',
        top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
        bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    };

    return (
        <div
            className="relative flex items-center"
            aria-describedby={isVisible ? tooltipId : undefined}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    id={tooltipId}
                    role="tooltip"
                    className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded whitespace-nowrap pointer-events-none animate-fade-in ${positionClasses[position]}`}
                >
                    {content}
                    {/* Arrow */}
                    <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;

