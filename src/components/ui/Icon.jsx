import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Icon Component
 * 
 * Wrapper for Lucide React icons with consistent sizing and styling
 * 
 * @param {string} name - Icon name from lucide-react
 * @param {number} size - Icon size in pixels
 * @param {string} className - Additional CSS classes
 */
// Map custom node-type names to Lucide icon names
const NODE_ICON_MAP = {
    telegram_bot: 'Send',
    send_email: 'Mail',
    webhook: 'Webhook',
    postgres: 'Database',
    mysql: 'Database',
    http: 'Globe',
    gmail_sender: 'Mail',
    slack: 'Hash',
    twitter: 'AtSign',
    facebook_post: 'ThumbsUp',
    instagram_post: 'Camera',
    gsheets_reader: 'Table',
    gdrive_writer: 'HardDrive',
    gdocs_reader: 'FileText',
    gdocs_template_writer: 'FileText',
    google_drive: 'HardDrive',
    google_calendar: 'Calendar',
    hubspot: 'BarChart2',
    if_else: 'GitBranch',
    switch: 'ToggleRight',
    scheduler: 'Clock',
    discord: 'MessageCircle',
    nodejs: 'Terminal',
    stripe_api: 'CreditCard',
    binance_public: 'TrendingUp',
    notion: 'BookOpen',
    youtube_upload: 'Video',
    typeform_webhook: 'FormInput',
    wait: 'Timer',
    github_webhook: 'GitBranch',
    excel_upload: 'Table',
    pdf_upload: 'FileText',
    image_upload: 'Image',
    imageeditor: 'Pencil',
    solidity: 'Code',
    create_nft: 'Layers',
};

export const Icon = ({ name, size = 20, className = "" }) => {
    // Check if name is an image path (starts with / or includes extension)
    if (name && (name.startsWith('/') || name.includes('.'))) {
        return (
            <img
                src={name}
                alt="icon"
                style={{ width: size, height: size }}
                className={`object-contain ${className}`}
            />
        );
    }

    // Resolve custom node-type names, then try PascalCase
    const lucideName = NODE_ICON_MAP[name] || (name.charAt(0).toUpperCase() + name.slice(1));
    const IconComponent = LucideIcons[lucideName];

    if (!IconComponent) {
        if (import.meta.env.DEV) console.warn(`Icon "${name}" not found in lucide-react`);
        return <LucideIcons.Zap size={size} className={className} strokeWidth={2} />;
    }

    return <IconComponent size={size} className={className} strokeWidth={2} />;
};

export default Icon;
