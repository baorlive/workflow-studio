import React from 'react';
import Icon from '../ui/Icon';
import { Dropdown } from '../ui/Dropdown';

const DEFAULT_USER = {
    name: 'Brian Frederin',
    email: 'brianfrederin@email.com',
    avatar: null, // initials-based — no external CDN dependency
};

const getInitials = (name = '') =>
    name.split(' ').map(p => p[0] || '').join('').slice(0, 2).toUpperCase();

const UserProfile = ({ user: userProp, onOpenSettings, onLogout }) => {
    const user = userProp || DEFAULT_USER;
    const initials = getInitials(user.name);

    const menuItems = [
        { label: 'Profile', icon: 'user', onClick: () => onOpenSettings && onOpenSettings() },
        { label: 'Account Settings', icon: 'settings', onClick: () => onOpenSettings && onOpenSettings() },
        { label: 'Log out', icon: 'logOut', onClick: () => onLogout && onLogout() }
    ];

    const AvatarTrigger = (
        <button
            className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center overflow-hidden transition-all focus:outline-none"
            aria-label="User menu"
        >
            {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-sm font-bold select-none">{initials}</span>
            )}
        </button>
    );

    return (
        <div className="rounded-lg p-3 flex items-center gap-3 transition-colors bg-gray-50 hover:bg-gray-100">
            <Dropdown
                trigger={AvatarTrigger}
                items={menuItems}
                align="left"
                className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900">{user.name}</p>
                <p className="text-sm truncate text-gray-500">{user.email}</p>
            </div>

            <button
                onClick={() => onOpenSettings && onOpenSettings()}
                className="p-1.5 rounded-md transition-colors focus:outline-none text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                aria-label="Application Settings"
            >
                <Icon name="settings" size={16} />
            </button>
        </div>
    );
};

export default UserProfile;
