import React from 'react';
import Icon from '../ui/Icon';

/**
 * TopToolbar Component - Floating action buttons
 * Unified style: Both Buttons are w-12 h-12 rounded-full
 */
const TopToolbar = ({ onAddNode, onOpenChat, isChatOpen, isNodePanelOpen }) => {
    return (
        <div className="absolute top-4 left-4 flex items-center gap-3 z-30">
            <button
                onClick={onAddNode}
                className={`w-12 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center group ${isNodePanelOpen
                    ? 'bg-primary-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                title={isNodePanelOpen ? "Close Panel" : "Add Node"}
            >
                <Icon
                    name={isNodePanelOpen ? "x" : "plus"}
                    size={24}
                    className={`transition-transform duration-200 ${!isNodePanelOpen && 'group-hover:rotate-90'}`}
                />
            </button>

            <button
                onClick={onOpenChat}
                className={`h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 px-5 group relative overflow-hidden ${isChatOpen
                    ? 'bg-black text-white'
                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                    }`}
                title="Open Workflow Assistant"
            >
                {!isChatOpen && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-50/0 via-primary-100/50 to-primary-50/0 animate-[shimmer_2s_infinite] pointer-events-none" />
                )}
                <Icon
                    name="bot"
                    size={24}
                    className={`transition-colors duration-300 relative z-10 ${isChatOpen ? 'text-white' : 'text-primary-600 group-hover:text-primary-700'}`}
                />
                <span className={`font-medium whitespace-nowrap transition-colors duration-300 relative z-10 ${isChatOpen ? 'text-white' : 'text-[var(--color-text)] group-hover:text-[var(--color-text)]'}`}>
                    Open Assistant
                </span>
            </button>
        </div>
    );
};

export default TopToolbar;
