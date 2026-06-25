import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@components/ui/Icon';
import { Button } from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { ShareModal } from '@components/ui/ShareModal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import BackgroundAnimation from '@components/ui/BackgroundAnimation';
import PricingModal from '@components/ui/PricingModal';
import { Modal } from '@components/ui/Modal';
import { Dropdown } from '@components/ui/Dropdown';
import { Tooltip } from '@components/ui/Tooltip';
import { Toast } from '@components/ui/Toast';
import ErrorBoundary from '@components/ui/ErrorBoundary';
import TopNavBar from '@components/workflow/TopNavBar';
import TopToolbar from '@components/workflow/TopToolbar';
import WorkflowControls from '@components/workflow/WorkflowControls';
import Sidebar from '@components/workspace/Sidebar';
import WorkflowCard from '@components/workspace/WorkflowCard';
import FilterDropdown from '@components/workspace/FilterDropdown';
import UserProfile from '@components/workspace/UserProfile';
import FolderTree from '@components/workspace/FolderTree';
import CreateFolderModal from '@components/workspace/CreateFolderModal';
import WorkspaceDashboard from '@components/workspace/WorkspaceDashboard';
import Login from '@components/auth/Login';
import AccountSettings from '@components/settings/AccountSettings';
import CredentialSettings from '@components/settings/CredentialSettings';
import NewCredentialModal from '@components/settings/NewCredentialModal';
import PaymentSettings from '@components/settings/PaymentSettings';
import TemplateSolutionPage from '@components/templates/TemplateSolutionPage';
import WorkflowEditor from '@components/workflow/WorkflowEditor';
import { mockWorkflows } from '@data/mockWorkflows';
import { mockFolders } from '@data/mockFolders';
import { calculateFolderCounts } from './features/workspace/services/folderService';

const OVERRIDES_STORAGE_KEY = 'workflowstudio.design-system.overrides.v1';
const THEME_STORAGE_KEY = 'workflowstudio.design-system.theme.v1';
const REM_BASE_STORAGE_KEY = 'workflowstudio.design-system.rem-base.v1';
const COLOR_FALLBACK = '#000000';

const token = (name, type = 'text', labelOverride) => ({
    name,
    type,
    label: labelOverride || name
        .replace(/^--/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
});

const PRIMITIVE_TOKEN_TABS = [
    {
        id: 'color-scales',
        label: 'Colors',
        description: 'Core colors + brand scale + gray scale.',
        tokens: [
            token('--primitive-color-brand', 'color', 'Brand Color'),
            token('--primitive-color-background', 'color', 'Background Color'),
            token('--primitive-color-text', 'color', 'Text Color'),
            token('--primitive-color-border', 'color', 'Border Color'),
            token('--primitive-color-brand-1', 'color', 'Brand #1'),
            token('--primitive-color-brand-2', 'color', 'Brand #2'),
            token('--primitive-color-brand-3', 'color', 'Brand #3'),
            token('--primitive-color-brand-4', 'color', 'Brand #4'),
            token('--primitive-color-gray-50', 'color', 'Gray 50'),
            token('--primitive-color-gray-100', 'color', 'Gray 100'),
            token('--primitive-color-gray-200', 'color', 'Gray 200'),
            token('--primitive-color-gray-300', 'color', 'Gray 300'),
            token('--primitive-color-gray-400', 'color', 'Gray 400'),
            token('--primitive-color-gray-500', 'color', 'Gray 500'),
            token('--primitive-color-gray-600', 'color', 'Gray 600'),
            token('--primitive-color-gray-700', 'color', 'Gray 700'),
            token('--primitive-color-gray-800', 'color', 'Gray 800'),
            token('--primitive-color-gray-900', 'color', 'Gray 900'),
            token('--primitive-color-gray-950', 'color', 'Gray 950'),
        ],
    },
    {
        id: 'spacing-steps',
        label: 'Spacing',
        description: 'Core spacing steps used for layout and component padding.',
        tokens: [
            token('--primitive-space-1'),
            token('--primitive-space-2'),
            token('--primitive-space-3'),
            token('--primitive-space-4'),
            token('--primitive-space-5'),
            token('--primitive-space-6'),
        ],
    },
    {
        id: 'radius-values',
        label: 'Radius',
        description: 'Corner radius values for cards, inputs, buttons, and overlays.',
        tokens: [
            token('--primitive-radius-sm'),
            token('--primitive-radius-md'),
            token('--primitive-radius-lg'),
            token('--primitive-radius-xl'),
        ],
    },
    {
        id: 'typography-sizes',
        label: 'Typography',
        description: 'Base font families and text size scale.',
        tokens: [
            token('--primitive-font-sans'),
            token('--primitive-font-mono'),
            token('--primitive-font-size-xs'),
            token('--primitive-font-size-sm'),
            token('--primitive-font-size-md'),
            token('--primitive-font-size-lg'),
            token('--primitive-font-size-xl'),
        ],
    },
    {
        id: 'button-input-sizings',
        label: 'Control Sizes',
        description: 'Base sizing for button and input paddings + font sizes.',
        tokens: [
            token('--primitive-size-button-padding-x-sm'),
            token('--primitive-size-button-padding-y-sm'),
            token('--primitive-size-button-padding-x-md'),
            token('--primitive-size-button-padding-y-md'),
            token('--primitive-size-button-padding-x-lg'),
            token('--primitive-size-button-padding-y-lg'),
            token('--primitive-size-button-font-size-sm'),
            token('--primitive-size-button-font-size-md'),
            token('--primitive-size-button-font-size-lg'),
            token('--primitive-size-input-padding-x'),
            token('--primitive-size-input-padding-y'),
            token('--primitive-size-input-font-size'),
        ],
    },
    {
        id: 'shadows',
        label: 'Shadows',
        description: 'Elevation shadows used by cards, controls, and overlays.',
        tokens: [
            token('--primitive-shadow-sm'),
            token('--primitive-shadow-md'),
        ],
    },
    {
        id: 'motion-durations',
        label: 'Motion',
        description: 'Animation durations and easing primitives.',
        tokens: [
            token('--primitive-duration-fast'),
            token('--primitive-duration-normal'),
            token('--primitive-duration-slow'),
            token('--primitive-ease-standard'),
        ],
    },
];

const TOKEN_GROUPS = [
    {
        id: 'semantic-core',
        layer: 'semantic',
        title: 'Semantic Tokens',
        description: 'Role-based semantic tokens for light/dark theme setup.',
        tokens: [
            token('--semantic-color-brand', 'color', 'Color Brand'),
            token('--semantic-color-background', 'color', 'Color Background'),
            token('--semantic-color-text', 'color', 'Color Text'),
            token('--semantic-color-border', 'color', 'Color Border'),
            token('--semantic-color-background-canvas', 'color', 'Color Canvas'),
            token('--semantic-color-background-elevated', 'color', 'Color Elevated'),
            token('--semantic-color-border-default', 'color', 'Color Border Default'),
            token('--semantic-color-text-primary', 'color', 'Color Text Primary'),
            token('--semantic-color-text-muted', 'color', 'Color Text Muted'),
            token('--semantic-color-text-subtle', 'color', 'Color Text Subtle'),
            token('--semantic-color-feedback-success', 'color', 'Color Success'),
            token('--semantic-color-feedback-warning', 'color', 'Color Warning'),
            token('--semantic-color-feedback-error', 'color', 'Color Error'),
            token('--semantic-color-feedback-info', 'color', 'Color Info'),
            token('--semantic-color-scrollbar-thumb', 'color', 'Scrollbar'),
            token('--semantic-color-scrollbar-thumb-hover', 'color', 'Scrollbar Hover'),
        ],
    },
    {
        id: 'component-button',
        layer: 'components',
        title: 'Button Tokens',
        description: 'Button-specific mappings from primitive tokens.',
        tokens: [
            token('--button-radius'),
            token('--button-transition-duration'),
            token('--button-padding-x-sm'),
            token('--button-padding-y-sm'),
            token('--button-font-size-sm'),
            token('--button-padding-x-md'),
            token('--button-padding-y-md'),
            token('--button-font-size-md'),
            token('--button-padding-x-lg'),
            token('--button-padding-y-lg'),
            token('--button-font-size-lg'),
            token('--button-primary-bg', 'color'),
            token('--button-primary-bg-hover', 'color'),
            token('--button-primary-text', 'color'),
            token('--button-primary-ring', 'color'),
            token('--button-primary-shadow'),
            token('--button-secondary-bg', 'color'),
            token('--button-secondary-bg-hover', 'color'),
            token('--button-secondary-text', 'color'),
            token('--button-secondary-border', 'color'),
            token('--button-secondary-ring', 'color'),
            token('--button-ghost-bg', 'color'),
            token('--button-ghost-bg-hover', 'color'),
            token('--button-ghost-text', 'color'),
            token('--button-ghost-ring', 'color'),
            token('--button-danger-bg', 'color'),
            token('--button-danger-bg-hover', 'color'),
            token('--button-danger-text', 'color'),
            token('--button-danger-ring', 'color'),
            token('--button-success-bg', 'color'),
            token('--button-success-bg-hover', 'color'),
            token('--button-success-text', 'color'),
            token('--button-success-ring', 'color'),
        ],
    },
    {
        id: 'component-input-card',
        layer: 'components',
        title: 'Input & Card Tokens',
        description: 'Input and card mappings from primitive tokens.',
        tokens: [
            token('--input-radius'),
            token('--input-padding-x'),
            token('--input-padding-y'),
            token('--input-font-size'),
            token('--input-bg', 'color'),
            token('--input-text', 'color'),
            token('--input-placeholder', 'color'),
            token('--input-border', 'color'),
            token('--input-border-focus', 'color'),
            token('--input-ring-focus', 'color'),
            token('--input-disabled-bg', 'color'),
            token('--input-disabled-text', 'color'),
            token('--card-radius'),
            token('--card-padding'),
            token('--card-bg', 'color'),
            token('--card-border', 'color'),
            token('--card-border-hover', 'color'),
            token('--card-shadow'),
            token('--card-shadow-hover'),
            token('--card-title', 'color'),
            token('--card-subtitle', 'color'),
        ],
    },
];

const PRODUCT_COMPONENTS = [
    {
        name: 'ToastProvider',
        path: 'src/contexts/ToastContext.jsx',
        role: 'Global toast context wrapper at app root.',
        composition: ['App Layout', 'Global Toast State'],
    },
    {
        name: 'Login',
        path: 'src/components/auth/Login.jsx',
        role: 'Authentication gate screen when user is not signed in.',
        composition: ['Input', 'Button'],
    },
    {
        name: 'Sidebar',
        path: 'src/components/workspace/Sidebar.jsx',
        role: 'Left navigation for workspace, templates, settings, and design system.',
        composition: ['FolderTree', 'UserProfile', 'CreateFolderModal'],
    },
    {
        name: 'WorkspaceDashboard',
        path: 'src/components/workspace/WorkspaceDashboard.jsx',
        role: 'Main workspace list and creation experience.',
        composition: ['WorkflowCard', 'FilterDropdown'],
    },
    {
        name: 'WorkflowEditor',
        path: 'src/components/workflow/WorkflowEditor.jsx',
        role: 'Workflow builder canvas and editor tools.',
        composition: ['TopNavBar', 'TopToolbar', 'NodeSelectorPanel', 'PropertiesPanel'],
    },
    {
        name: 'AccountSettings',
        path: 'src/components/settings/AccountSettings.jsx',
        role: 'Settings view for account, credentials, and payment.',
        composition: ['CredentialSettings', 'PaymentSettings'],
    },
    {
        name: 'DesignSystem',
        path: 'src/design-system.jsx',
        role: 'Design system management screen opened from app navigation.',
        composition: ['Primitive Tokens', 'Semantic Tokens', 'Component Tokens'],
    },
    {
        name: 'ShareModal',
        path: 'src/components/ui/ShareModal.jsx',
        role: 'Global share modal mounted in app root.',
        composition: ['Modal', 'Button', 'Input'],
    },
    {
        name: 'ConfirmDialog',
        path: 'src/components/ui/ConfirmDialog.jsx',
        role: 'Global destructive action confirmation dialog.',
        composition: ['Modal', 'Button'],
    },
    {
        name: 'ErrorBoundary',
        path: 'src/components/ui/ErrorBoundary.jsx',
        role: 'Crash guard around workspace and editor views.',
        composition: ['Fallback UI'],
    },
    {
        name: 'App',
        path: 'src/App.jsx',
        role: 'Root composition and active-view switchboard.',
        composition: ['Login', 'Sidebar', 'WorkspaceDashboard', 'WorkflowEditor', 'AccountSettings', 'DesignSystem', 'ShareModal', 'ConfirmDialog'],
    },
];

const UI_COMPONENTS = [
    { name: 'Button', path: 'src/components/ui/Button.jsx', tokens: '--button-*' },
    { name: 'Input', path: 'src/components/ui/Input.jsx', tokens: '--input-*' },
    { name: 'Checkbox', path: 'Not in /src yet', tokens: 'Planned token mapping' },
    { name: 'Badge', path: 'Not in /src yet', tokens: 'Planned token mapping' },
    { name: 'Card', path: 'src/components/ui/Card.jsx', tokens: '--card-*' },
    { name: 'Tabs', path: 'Not in /src yet', tokens: 'Planned token mapping' },
    { name: 'Modal', path: 'src/components/ui/Modal.jsx', tokens: '--color-*, --primitive-*' },
];

const CORE_COMPONENT_USAGE_FROM_APP = {
    Button: true,
    Input: true,
    Checkbox: false,
    Badge: false,
    Card: true,
    Tabs: false,
    Modal: true,
};

const SRC_COMPONENT_GROUPS = [
    {
        group: 'Auth',
        files: ['src/components/auth/Login.jsx'],
    },
    {
        group: 'UI',
        files: [
            'src/components/ui/BackgroundAnimation.jsx',
            'src/components/ui/Button.jsx',
            'src/components/ui/Card.jsx',
            'src/components/ui/ConfirmDialog.jsx',
            'src/components/ui/Dropdown.jsx',
            'src/components/ui/ErrorBoundary.jsx',
            'src/components/ui/Icon.jsx',
            'src/components/ui/Input.jsx',
            'src/components/ui/Modal.jsx',
            'src/components/ui/PricingModal.jsx',
            'src/components/ui/ShareModal.jsx',
            'src/components/ui/Toast.jsx',
            'src/components/ui/Tooltip.jsx',
        ],
    },
    {
        group: 'Workspace',
        files: [
            'src/components/workspace/CreateFolderModal.jsx',
            'src/components/workspace/FilterDropdown.jsx',
            'src/components/workspace/FolderTree.jsx',
            'src/components/workspace/Sidebar.jsx',
            'src/components/workspace/UserProfile.jsx',
            'src/components/workspace/WorkflowCard.jsx',
            'src/components/workspace/WorkspaceDashboard.jsx',
        ],
    },
    {
        group: 'Workflow',
        files: [
            'src/components/workflow/AssistantPanel.jsx',
            'src/components/workflow/ButtonEdge.jsx',
            'src/components/workflow/CanvasNode.jsx',
            'src/components/workflow/NodeHelpModal.jsx',
            'src/components/workflow/NodeSelectorPanel.jsx',
            'src/components/workflow/OutputPanel.jsx',
            'src/components/workflow/ParamField.jsx',
            'src/components/workflow/PropertiesPanel.jsx',
            'src/components/workflow/TopNavBar.jsx',
            'src/components/workflow/TopToolbar.jsx',
            'src/components/workflow/VariableSelector.jsx',
            'src/components/workflow/WorkflowConnection.jsx',
            'src/components/workflow/WorkflowControls.jsx',
            'src/components/workflow/WorkflowEditor.jsx',
            'src/components/workflow/WorkflowNode.jsx',
            'src/components/workflow/nodeIcons.js',
        ],
    },
    {
        group: 'Workflow Inputs',
        files: [
            'src/components/workflow/inputs/ArrayInput.jsx',
            'src/components/workflow/inputs/AsyncSelect.jsx',
            'src/components/workflow/inputs/CodeInput.jsx',
            'src/components/workflow/inputs/CredentialInput.jsx',
            'src/components/workflow/inputs/CredentialModal.jsx',
            'src/components/workflow/inputs/DateInput.jsx',
            'src/components/workflow/inputs/FetchAndFillInput.jsx',
            'src/components/workflow/inputs/FileInput.jsx',
        ],
    },
    {
        group: 'Settings',
        files: [
            'src/components/settings/AccountSettings.jsx',
            'src/components/settings/CredentialSettings.jsx',
            'src/components/settings/NewCredentialModal.jsx',
            'src/components/settings/PaymentSettings.jsx',
        ],
    },
    {
        group: 'Templates',
        files: ['src/components/templates/TemplateSolutionPage.jsx'],
    },
];

const COMPONENT_PRINCIPLES = [
    'Reusable in multiple places',
    'Focused on a single UI role',
    'Defined by variants, sizes, states, and behavior',
];

const PATTERN_PRINCIPLES = [
    'Composed from multiple components',
    'Solves a recurring product use case',
    'Contextual and larger in scope than a single component',
];

const PATTERN_USE_CASE_BY_COMPONENT = {
    App: 'Coordinate high-level product views and global overlays.',
    Sidebar: 'Provide consistent app navigation and workspace access.',
    WorkspaceDashboard: 'Browse, filter, and create workflows.',
    WorkflowEditor: 'Build and operate workflow graphs.',
    AccountSettings: 'Manage profile, credentials, and billing.',
    Login: 'Authenticate users with email/password or Google sign-in.',
    ShareModal: 'Handle cross-app sharing actions.',
    ConfirmDialog: 'Handle cross-app confirmation actions.',
    DesignSystem: 'Manage token and component rules in-product.',
    ToastProvider: 'Provide global notifications to app screens.',
    ErrorBoundary: 'Protect critical screens from runtime crashes.',
};

const PRODUCT_PATTERNS = PRODUCT_COMPONENTS.map((entry) => ({
    name: entry.name,
    useCase: PATTERN_USE_CASE_BY_COMPONENT[entry.name] || entry.role,
    components: entry.composition,
    structure: `${entry.name} => ${entry.composition.join(' + ')}`,
}));

const PRIMITIVE_TOKENS = PRIMITIVE_TOKEN_TABS.flatMap((tab) => tab.tokens);
const ALL_TOKENS = [...PRIMITIVE_TOKENS, ...TOKEN_GROUPS.flatMap((group) => group.tokens)];

const toHexFromRgb = (rgbValue) => {
    const rgbMatch = rgbValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgbMatch) return '';

    const [, r, g, b] = rgbMatch;
    const toHex = (channel) => Number(channel).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
};

const parseHexColor = (value) => {
    if (!value) return '';

    const trimmed = value.trim();
    if (!trimmed) return '';

    if (/^#([0-9a-f]{6})$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    const shortHexMatch = trimmed.match(/^#([0-9a-f]{3})$/i);
    if (shortHexMatch) {
        const [r, g, b] = shortHexMatch[1].split('');
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    return toHexFromRgb(trimmed);
};

const readJson = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error(`Failed to parse localStorage key: ${key}`, error);
        return fallback;
    }
};

const getRawTokenValue = (tokenName) => {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue(tokenName).trim();
};

const resolveTokenColor = (tokenName, fallbackValue = '') => {
    const root = document.documentElement;
    const probe = document.createElement('span');

    probe.style.color = `var(${tokenName})`;
    probe.style.position = 'absolute';
    probe.style.pointerEvents = 'none';
    probe.style.opacity = '0';

    root.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    root.removeChild(probe);

    return toHexFromRgb(resolved) || parseHexColor(fallbackValue) || COLOR_FALLBACK;
};

const applyOverrides = (overrides) => {
    Object.entries(overrides).forEach(([tokenName, value]) => {
        if (value !== undefined && value !== null && String(value).trim()) {
            document.documentElement.style.setProperty(tokenName, String(value).trim());
        }
    });
};

const compactPrimitiveLabel = (tokenName) => {
    if (tokenName.startsWith('--primitive-radius-')) {
        const step = tokenName.replace('--primitive-radius-', '');
        return `${step} Radius`;
    }

    if (tokenName.startsWith('--primitive-space-')) {
        const step = tokenName.replace('--primitive-space-', '');
        return `${step} Space`;
    }

    return tokenName
        .replace('--primitive-', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


const RESTRICTED_TO_PRIMITIVE_PREFIXES = ['--semantic-', '--button-', '--input-', '--card-'];
const isPrimitiveReference = (value) => /^var\(--primitive-[a-z0-9-]+\)$/i.test(value.trim());
const isPrimitiveMappedToken = (tokenName) =>
    RESTRICTED_TO_PRIMITIVE_PREFIXES.some((prefix) => tokenName.startsWith(prefix));
const extractPrimitiveTokenName = (value) => {
    const match = value.trim().match(/^var\((--primitive-[a-z0-9-]+)\)$/i);
    return match ? match[1] : '';
};
const isPrimitiveSpacingToken = (tokenName) => tokenName.startsWith('--primitive-space-');
const remToPx = (remValue, baseRem) => {
    const match = String(remValue).trim().match(/^(-?\d*\.?\d+)rem$/i);
    if (!match) return null;
    return Number(match[1]) * baseRem;
};
const inferDefaultPrimitiveToken = (tokenName) => {
    const lower = tokenName.toLowerCase();
    if (lower.includes('radius')) return '--primitive-radius-md';
    if (lower.includes('padding') || lower.includes('space')) return '--primitive-space-4';
    if (lower.includes('font-size')) return '--primitive-font-size-sm';
    if (lower.includes('duration')) return '--primitive-duration-normal';
    if (lower.includes('ease')) return '--primitive-ease-standard';
    if (lower.includes('shadow')) return '--primitive-shadow-sm';
    if (lower.includes('border') || lower.includes('ring') || lower.includes('stroke')) return '--primitive-color-border';
    if (lower.includes('text') || lower.includes('title') || lower.includes('placeholder')) return '--primitive-color-text';
    if (lower.includes('background') || lower.includes('surface') || lower.includes('elevated') || lower.includes('bg')) return '--primitive-color-background';
    if (lower.includes('scrollbar')) return '--primitive-effect-scrollbar-light';
    return '--primitive-color-brand';
};
const getPrimitiveCandidates = (tokenName, tokenType) => {
    const allPrimitiveNames = PRIMITIVE_TOKENS.map((entry) => entry.name);
    const pick = (prefixes) => allPrimitiveNames.filter((name) => prefixes.some((prefix) => name.startsWith(prefix)));

    if (tokenType !== 'color') {
        if (tokenName.includes('radius')) return pick(['--primitive-radius-']);
        if (tokenName.includes('duration')) return pick(['--primitive-duration-']);
        if (tokenName.includes('ease')) return pick(['--primitive-ease-']);
        if (tokenName.includes('shadow')) return pick(['--primitive-shadow-']);
        if (tokenName.startsWith('--button-') && tokenName.includes('padding-x')) return pick(['--primitive-size-button-padding-x-']);
        if (tokenName.startsWith('--button-') && tokenName.includes('padding-y')) return pick(['--primitive-size-button-padding-y-']);
        if (tokenName.startsWith('--button-') && tokenName.includes('font-size')) return pick(['--primitive-size-button-font-size-']);
        if (tokenName.startsWith('--input-') && tokenName.includes('padding-x')) return pick(['--primitive-size-input-padding-x']);
        if (tokenName.startsWith('--input-') && tokenName.includes('padding-y')) return pick(['--primitive-size-input-padding-y']);
        if (tokenName.startsWith('--input-') && tokenName.includes('font-size')) return pick(['--primitive-size-input-font-size']);
        if (tokenName.startsWith('--card-padding')) return pick(['--primitive-space-']);
        if (tokenName.includes('font-size')) return pick(['--primitive-font-size-']);
        return [];
    }

    const lower = tokenName.toLowerCase();
    const coreColors = [
        '--primitive-color-brand',
        '--primitive-color-background',
        '--primitive-color-text',
        '--primitive-color-border',
    ].filter((name) => allPrimitiveNames.includes(name));
    const brandScale = pick(['--primitive-color-brand-']);
    const grayScale = pick(['--primitive-color-gray-']);

    if (/scrollbar|thumb/.test(lower)) return pick(['--primitive-effect-scrollbar-']);
    if (/ghost|secondary|disabled/.test(lower)) return [
        ...coreColors,
        ...grayScale,
        ...pick(['--primitive-effect-surface-dark-', '--primitive-effect-border-dark-']),
    ];
    if (/border|ring|stroke/.test(lower)) return coreColors.filter((name) =>
        ['--primitive-color-border', '--primitive-color-brand'].includes(name)
    ).concat(grayScale);
    if (/text|title|placeholder|muted|subtle/.test(lower)) return coreColors.filter((name) =>
        ['--primitive-color-text', '--primitive-color-background', '--primitive-color-brand'].includes(name)
    ).concat(grayScale);
    if (/background|surface|elevated|bg/.test(lower)) return coreColors.filter((name) =>
        ['--primitive-color-background', '--primitive-color-brand'].includes(name)
    ).concat(grayScale);
    if (/brand|primary|success|warning|danger|error|info/.test(lower)) return coreColors.filter((name) =>
        ['--primitive-color-brand', '--primitive-color-text', '--primitive-color-background'].includes(name)
    ).concat(brandScale);

    return coreColors;
};

const DesignSystem = ({ onBack }) => {
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('tokens');
    const [tokenManagerTab, setTokenManagerTab] = useState('primitive');
    const [primitiveTab, setPrimitiveTab] = useState(PRIMITIVE_TOKEN_TABS[0].id);
    const [tokenSearch, setTokenSearch] = useState('');
    const [tokenValues, setTokenValues] = useState({});
    const [defaultTokenValues, setDefaultTokenValues] = useState({});
    const [overrides, setOverrides] = useState({});
    const [isSharePreviewOpen, setIsSharePreviewOpen] = useState(false);
    const [isConfirmPreviewOpen, setIsConfirmPreviewOpen] = useState(false);
    const [isCoreModalOpen, setIsCoreModalOpen] = useState(false);
    const [previewWorkflowName, setPreviewWorkflowName] = useState('Revenue Insights Automation');
    const [previewFolderName] = useState('Marketing');
    const [previewSaveStatus, setPreviewSaveStatus] = useState('saved');
    const [previewIsRunning, setPreviewIsRunning] = useState(false);
    const [previewUndoCount, setPreviewUndoCount] = useState(6);
    const [previewRedoCount, setPreviewRedoCount] = useState(1);
    const [previewZoom, setPreviewZoom] = useState(1);
    const [previewIsPanning, setPreviewIsPanning] = useState(false);
    const [previewNodePanelOpen, setPreviewNodePanelOpen] = useState(false);
    const [previewChatOpen, setPreviewChatOpen] = useState(false);
    const [previewSidebarFolder, setPreviewSidebarFolder] = useState(null);
    const [previewSidebarMode, setPreviewSidebarMode] = useState('workflows');
    const [previewFilter, setPreviewFilter] = useState('All');
    const [previewNodeFilter, setPreviewNodeFilter] = useState('All');
    const [previewSort, setPreviewSort] = useState('newest');
    const [updateStatus, setUpdateStatus] = useState('');
    const [baseRem, setBaseRem] = useState(16);
    const saveTimerRef = useRef(null);
    const runTimerRef = useRef(null);
    const previewFoldersWithCounts = useMemo(() => calculateFolderCounts(mockFolders, mockWorkflows), []);
    const previewWorkflowCard = useMemo(() => mockWorkflows[0], []);

    const refreshTokenValues = (activeOverrides = {}) => {
        const nextValues = {};

        ALL_TOKENS.forEach((entry) => {
            nextValues[entry.name] = activeOverrides[entry.name] ?? getRawTokenValue(entry.name);
        });

        setTokenValues(nextValues);
    };

    const captureDefaultValues = (activeOverrides = {}) => {
        Object.keys(activeOverrides).forEach((tokenName) => {
            document.documentElement.style.removeProperty(tokenName);
        });

        const nextDefaults = {};
        ALL_TOKENS.forEach((entry) => {
            nextDefaults[entry.name] = getRawTokenValue(entry.name);
        });

        setDefaultTokenValues(nextDefaults);
        applyOverrides(activeOverrides);
    };

    useEffect(() => {
        const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || document.documentElement.dataset.theme || 'light';
        const savedOverrides = readJson(OVERRIDES_STORAGE_KEY, {});
        const savedRemBase = Number(localStorage.getItem(REM_BASE_STORAGE_KEY));

        document.documentElement.dataset.theme = initialTheme;
        setTheme(initialTheme);
        if (Number.isFinite(savedRemBase) && savedRemBase > 0) setBaseRem(savedRemBase);

        captureDefaultValues(savedOverrides);
        applyOverrides(savedOverrides);
        setOverrides(savedOverrides);
        refreshTokenValues(savedOverrides);
    }, []);

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            if (runTimerRef.current) clearTimeout(runTimerRef.current);
        };
    }, []);

    const filteredTokenGroups = useMemo(() => {
        const query = tokenSearch.trim().toLowerCase();
        if (!query) return TOKEN_GROUPS;

        return TOKEN_GROUPS.map((group) => ({
            ...group,
            tokens: group.tokens.filter((entry) =>
                entry.name.toLowerCase().includes(query) ||
                entry.label.toLowerCase().includes(query)
            ),
        })).filter((group) => group.tokens.length > 0);
    }, [tokenSearch]);
    const filteredSemanticGroups = useMemo(
        () => filteredTokenGroups.filter((group) => group.layer === 'semantic'),
        [filteredTokenGroups]
    );
    const filteredComponentGroups = useMemo(
        () => filteredTokenGroups.filter((group) => group.layer === 'components'),
        [filteredTokenGroups]
    );

    const activePrimitiveTab = useMemo(
        () => PRIMITIVE_TOKEN_TABS.find((tab) => tab.id === primitiveTab) || PRIMITIVE_TOKEN_TABS[0],
        [primitiveTab]
    );

    const filteredPrimitiveTokens = useMemo(() => {
        const query = tokenSearch.trim().toLowerCase();
        if (!query) return activePrimitiveTab.tokens;

        return activePrimitiveTab.tokens.filter((entry) =>
            entry.name.toLowerCase().includes(query) ||
            entry.label.toLowerCase().includes(query)
        );
    }, [activePrimitiveTab, tokenSearch]);

    const updateOverrides = (nextOverrides) => {
        setOverrides(nextOverrides);
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(nextOverrides));
    };

    const handleThemeChange = (nextTheme) => {
        document.documentElement.dataset.theme = nextTheme;
        setTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

        captureDefaultValues(overrides);
        applyOverrides(overrides);
        refreshTokenValues(overrides);
    };

    const handleTokenValueChange = (tokenName, nextValue) => {
        const trimmedValue = String(nextValue ?? '').trim();

        if (!trimmedValue) {
            const nextOverrides = { ...overrides };
            delete nextOverrides[tokenName];
            document.documentElement.style.removeProperty(tokenName);
            updateOverrides(nextOverrides);
            refreshTokenValues(nextOverrides);
            setUpdateStatus('');
            return;
        }

        if (isPrimitiveMappedToken(tokenName) && !isPrimitiveReference(trimmedValue)) {
            setUpdateStatus(`${tokenName} must reference a primitive token (example: var(--primitive-color-brand)).`);
            return;
        }

        document.documentElement.style.setProperty(tokenName, trimmedValue);

        const nextOverrides = {
            ...overrides,
            [tokenName]: trimmedValue,
        };

        setTokenValues((prev) => ({
            ...prev,
            [tokenName]: trimmedValue,
        }));
        updateOverrides(nextOverrides);
        setUpdateStatus('');
    };

    const handleTokenReset = (tokenName) => {
        const nextOverrides = { ...overrides };
        delete nextOverrides[tokenName];

        document.documentElement.style.removeProperty(tokenName);
        updateOverrides(nextOverrides);
        refreshTokenValues(nextOverrides);
    };

    const handleBaseRemChange = (nextBaseRemValue) => {
        const parsed = Number(nextBaseRemValue);
        if (!Number.isFinite(parsed) || parsed <= 0) return;
        setBaseRem(parsed);
        localStorage.setItem(REM_BASE_STORAGE_KEY, String(parsed));
    };

    const handleSpacingPxChange = (tokenName, pxValue) => {
        const normalized = String(pxValue ?? '').trim();
        if (!normalized) {
            handleTokenValueChange(tokenName, '');
            return;
        }

        const parsedPx = Number(normalized);
        if (!Number.isFinite(parsedPx)) return;
        const remValue = `${(parsedPx / baseRem).toFixed(4).replace(/\.?0+$/, '')}rem`;
        handleTokenValueChange(tokenName, remValue);
    };

    const handleResetAll = () => {
        ALL_TOKENS.forEach((entry) => {
            document.documentElement.style.removeProperty(entry.name);
        });

        localStorage.removeItem(OVERRIDES_STORAGE_KEY);
        setOverrides({});
        refreshTokenValues({});
    };

    const handlePreviewUndo = () => {
        if (previewUndoCount <= 0) return;
        setPreviewUndoCount((count) => Math.max(0, count - 1));
        setPreviewRedoCount((count) => count + 1);
        setPreviewSaveStatus('unsaved');
    };

    const handlePreviewRedo = () => {
        if (previewRedoCount <= 0) return;
        setPreviewRedoCount((count) => Math.max(0, count - 1));
        setPreviewUndoCount((count) => count + 1);
        setPreviewSaveStatus('unsaved');
    };

    const handlePreviewSave = () => {
        setPreviewSaveStatus('saving');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            setPreviewSaveStatus('saved');
        }, 900);
    };

    const handlePreviewRun = () => {
        setPreviewIsRunning(true);
        if (runTimerRef.current) clearTimeout(runTimerRef.current);
        runTimerRef.current = setTimeout(() => {
            setPreviewIsRunning(false);
        }, 1400);
    };

    const renderSourcePreview = (filePath) => {
        const commonCard = (title, content) => (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3">
                <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{title}</p>
                {content}
            </div>
        );

        switch (filePath) {
            case 'src/components/ui/BackgroundAnimation.jsx':
                return commonCard('BackgroundAnimation', (
                    <div className="relative h-24 rounded-lg overflow-hidden border border-[var(--color-border)]">
                        <BackgroundAnimation />
                    </div>
                ));
            case 'src/components/ui/Button.jsx':
                return commonCard('Button', (
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="primary">Primary</Button>
                        <Button size="sm" variant="secondary">Secondary</Button>
                        <Button size="sm" variant="ghost">Ghost</Button>
                    </div>
                ));
            case 'src/components/ui/Input.jsx':
                return commonCard('Input', (
                    <div className="space-y-2">
                        <Input placeholder="Preview input" />
                        <Input placeholder="Disabled input" disabled />
                    </div>
                ));
            case 'src/components/ui/Card.jsx':
                return commonCard('Card', (
                    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                        <p className="text-sm font-semibold" style={{ color: 'var(--card-title)' }}>Card Title</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--card-subtitle)' }}>Card subtitle text.</p>
                    </Card>
                ));
            case 'src/components/ui/Icon.jsx':
                return commonCard('Icon', (
                    <div className="flex items-center gap-3 text-[var(--color-text)]">
                        <Icon name="bot" size={18} />
                        <Icon name="settings" size={18} />
                        <Icon name="zap" size={18} />
                        <Icon name="share2" size={18} />
                    </div>
                ));
            case 'src/components/ui/Dropdown.jsx':
                return commonCard('Dropdown', (
                    <Dropdown
                        trigger={<button className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm">Open menu</button>}
                        items={[
                            { label: 'Profile', icon: 'user', onClick: () => {} },
                            { label: 'Settings', icon: 'settings', onClick: () => {} },
                        ]}
                    />
                ));
            case 'src/components/ui/Tooltip.jsx':
                return commonCard('Tooltip', (
                    <Tooltip content="Tooltip preview">
                        <button className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm">Hover me</button>
                    </Tooltip>
                ));
            case 'src/components/ui/Toast.jsx':
                return commonCard('Toast', (
                    <div className="relative h-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                        <Toast message="Token update saved" type="success" duration={null} onClose={() => {}} />
                    </div>
                ));
            case 'src/components/ui/Modal.jsx':
                return commonCard('Modal', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                        <Button size="sm" variant="secondary">Modal component (used by overlays)</Button>
                    </div>
                ));
            case 'src/components/ui/PricingModal.jsx':
                return commonCard('PricingModal', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                        <PricingModal isOpen={false} onClose={() => {}} />
                        <Button size="sm" variant="secondary">Pricing modal ready</Button>
                    </div>
                ));
            case 'src/components/ui/ShareModal.jsx':
                return commonCard('ShareModal', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                        <Button size="sm" variant="secondary" onClick={() => setIsSharePreviewOpen(true)}>Open ShareModal</Button>
                    </div>
                ));
            case 'src/components/ui/ConfirmDialog.jsx':
                return commonCard('ConfirmDialog', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                        <Button size="sm" variant="secondary" onClick={() => setIsConfirmPreviewOpen(true)}>Open ConfirmDialog</Button>
                    </div>
                ));
            case 'src/components/ui/ErrorBoundary.jsx':
                return commonCard('ErrorBoundary', (
                    <ErrorBoundary>
                        <div className="text-sm text-[var(--color-text-muted)]">ErrorBoundary wrapper preview</div>
                    </ErrorBoundary>
                ));
            case 'src/components/workspace/CreateFolderModal.jsx':
                return commonCard('CreateFolderModal', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                        <Button size="sm" variant="secondary">CreateFolderModal (overlay component)</Button>
                    </div>
                ));
            case 'src/components/workspace/FolderTree.jsx':
                return commonCard('FolderTree', (
                    <div className="rounded-lg border border-[var(--color-border)] p-2">
                        <FolderTree folders={previewFoldersWithCounts} onSelect={setPreviewSidebarFolder} selectedId={previewSidebarFolder?.id} />
                    </div>
                ));
            case 'src/components/workspace/WorkspaceDashboard.jsx':
                return commonCard('WorkspaceDashboard', (
                    <div className="h-[360px] overflow-auto rounded-lg border border-[var(--color-border)]">
                        <WorkspaceDashboard
                            onStartBuild={async () => {}}
                            workflows={mockWorkflows}
                            onEditWorkflow={() => {}}
                            onShareWorkflow={() => {}}
                            onDuplicateWorkflow={() => {}}
                            onDeleteWorkflow={() => {}}
                            onMoveWorkflow={() => {}}
                            onCreateBlankWorkflow={() => {}}
                            onViewTemplates={() => {}}
                            onViewWorkflows={() => {}}
                            onOpenSettings={() => {}}
                            mode="workflows"
                            folders={mockFolders}
                            setFolders={() => {}}
                            selectedFolder={null}
                            setSelectedFolder={() => {}}
                        />
                    </div>
                ));
            case 'src/components/workspace/WorkflowCard.jsx':
                return commonCard('WorkflowCard', (
                    <WorkflowCard
                        workflow={previewWorkflowCard}
                        projectName="Marketing"
                        folders={previewFoldersWithCounts}
                        onEdit={() => {}}
                        onShare={() => {}}
                        onDuplicate={() => {}}
                        onDelete={() => {}}
                        onMove={() => {}}
                    />
                ));
            case 'src/components/workspace/FilterDropdown.jsx':
                return commonCard('FilterDropdown', (
                    <FilterDropdown
                        label="Status"
                        value={previewFilter}
                        onChange={setPreviewFilter}
                        options={[
                            { value: 'All', label: 'All' },
                            { value: 'Working in Progress', label: 'Working in Progress' },
                            { value: 'Deployed', label: 'Deployed' },
                        ]}
                    />
                ));
            case 'src/components/workspace/UserProfile.jsx':
                return commonCard('UserProfile', <UserProfile onOpenSettings={() => {}} onLogout={() => {}} />);
            case 'src/components/workspace/Sidebar.jsx':
                return commonCard('Sidebar', (
                    <div className="h-[300px] overflow-hidden rounded-lg border border-[var(--color-border)]">
                        <Sidebar
                            selectedFolder={previewSidebarFolder}
                            setSelectedFolder={setPreviewSidebarFolder}
                            isTemplatesView={previewSidebarMode === 'templates'}
                            isSettingsOpen={false}
                            isDesignSystemOpen={false}
                            onViewWorkflows={() => setPreviewSidebarMode('workflows')}
                            onViewTemplates={() => setPreviewSidebarMode('templates')}
                            foldersWithCounts={previewFoldersWithCounts}
                            onCreateFolder={() => {}}
                            onOpenSettings={() => {}}
                            onOpenDesignSystem={() => {}}
                        />
                    </div>
                ));
            case 'src/components/workflow/TopNavBar.jsx':
                return commonCard('TopNavBar', (
                    <TopNavBar
                        folderName={previewFolderName}
                        workflowName={previewWorkflowName}
                        onNameChange={(name) => {
                            setPreviewWorkflowName(name);
                            setPreviewSaveStatus('unsaved');
                        }}
                        onUndo={handlePreviewUndo}
                        onRedo={handlePreviewRedo}
                        canUndo={previewUndoCount > 0}
                        canRedo={previewRedoCount > 0}
                        onSave={handlePreviewSave}
                        onSaveTemplate={handlePreviewSave}
                        onShare={() => setIsSharePreviewOpen(true)}
                        onRun={handlePreviewRun}
                        onSettings={() => setIsConfirmPreviewOpen(true)}
                        saveStatus={previewSaveStatus}
                        isRunning={previewIsRunning}
                        onBack={() => {}}
                        onExport={handlePreviewSave}
                        undoCount={previewUndoCount}
                    />
                ));
            case 'src/components/workflow/TopToolbar.jsx':
                return commonCard('TopToolbar', (
                    <div className="relative h-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                        <TopToolbar
                            onAddNode={() => {
                                setPreviewNodePanelOpen((open) => !open);
                                setPreviewSaveStatus('unsaved');
                            }}
                            onOpenChat={() => setPreviewChatOpen((open) => !open)}
                            isChatOpen={previewChatOpen}
                            isNodePanelOpen={previewNodePanelOpen}
                        />
                    </div>
                ));
            case 'src/components/workflow/WorkflowControls.jsx':
                return commonCard('WorkflowControls', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                        <WorkflowControls
                            zoom={previewZoom}
                            setZoom={setPreviewZoom}
                            onFitView={() => setPreviewZoom(1)}
                            onAutoLayout={() => setPreviewSaveStatus('unsaved')}
                            isPanning={previewIsPanning}
                            setIsPanning={setPreviewIsPanning}
                            onUndo={handlePreviewUndo}
                            onRedo={handlePreviewRedo}
                            canUndo={previewUndoCount > 0}
                            canRedo={previewRedoCount > 0}
                            undoCount={previewUndoCount}
                        />
                    </div>
                ));
            case 'src/components/auth/Login.jsx':
                return commonCard('Login', (
                    <div className="h-[360px] overflow-auto rounded-lg border border-[var(--color-border)]">
                        <Login onLogin={() => {}} />
                    </div>
                ));
            case 'src/components/settings/AccountSettings.jsx':
                return commonCard('AccountSettings', (
                    <div className="h-[360px] overflow-auto rounded-lg border border-[var(--color-border)]">
                        <AccountSettings onBack={() => {}} />
                    </div>
                ));
            case 'src/components/settings/CredentialSettings.jsx':
                return commonCard('CredentialSettings', (
                    <div className="h-[320px] overflow-auto rounded-lg border border-[var(--color-border)] p-3">
                        <CredentialSettings />
                    </div>
                ));
            case 'src/components/settings/NewCredentialModal.jsx':
                return commonCard('NewCredentialModal', (
                    <div className="relative h-24 rounded-lg border border-[var(--color-border)] flex items-center justify-center">
                        <NewCredentialModal isOpen={false} onClose={() => {}} onSave={() => {}} />
                        <Button size="sm" variant="secondary">NewCredentialModal (overlay)</Button>
                    </div>
                ));
            case 'src/components/settings/PaymentSettings.jsx':
                return commonCard('PaymentSettings', (
                    <div className="h-[320px] overflow-auto rounded-lg border border-[var(--color-border)] p-3">
                        <PaymentSettings />
                    </div>
                ));
            case 'src/components/templates/TemplateSolutionPage.jsx':
                return commonCard('TemplateSolutionPage', (
                    <div className="h-[360px] overflow-auto rounded-lg border border-[var(--color-border)]">
                        <TemplateSolutionPage onBack={() => {}} onEditWorkflow={() => {}} />
                    </div>
                ));
            case 'src/components/workflow/WorkflowEditor.jsx':
                return commonCard('WorkflowEditor', (
                    <div className="h-[360px] overflow-auto rounded-lg border border-[var(--color-border)]">
                        <WorkflowEditor
                            workflow={previewWorkflowCard}
                            folders={previewFoldersWithCounts}
                            onSave={() => {}}
                            onShare={() => {}}
                            onBack={() => {}}
                        />
                    </div>
                ));
            case 'src/components/workflow/nodeIcons.js':
                return commonCard('nodeIcons.js', (
                    <div className="flex flex-wrap items-center gap-3 text-[var(--color-text)]">
                        <Icon name="telegram_bot" size={18} />
                        <Icon name="send_email" size={18} />
                        <Icon name="webhook" size={18} />
                        <Icon name="postgres" size={18} />
                    </div>
                ));
            case 'src/components/workflow/AssistantPanel.jsx':
            case 'src/components/workflow/ButtonEdge.jsx':
            case 'src/components/workflow/CanvasNode.jsx':
            case 'src/components/workflow/NodeHelpModal.jsx':
            case 'src/components/workflow/NodeSelectorPanel.jsx':
            case 'src/components/workflow/OutputPanel.jsx':
            case 'src/components/workflow/ParamField.jsx':
            case 'src/components/workflow/PropertiesPanel.jsx':
            case 'src/components/workflow/VariableSelector.jsx':
            case 'src/components/workflow/WorkflowConnection.jsx':
            case 'src/components/workflow/WorkflowNode.jsx':
            case 'src/components/workflow/inputs/ArrayInput.jsx':
            case 'src/components/workflow/inputs/AsyncSelect.jsx':
            case 'src/components/workflow/inputs/CodeInput.jsx':
            case 'src/components/workflow/inputs/CredentialInput.jsx':
            case 'src/components/workflow/inputs/CredentialModal.jsx':
            case 'src/components/workflow/inputs/DateInput.jsx':
            case 'src/components/workflow/inputs/FetchAndFillInput.jsx':
            case 'src/components/workflow/inputs/FileInput.jsx':
                return commonCard(filePath.split('/').pop(), (
                    <div className="h-[240px] overflow-auto rounded-lg border border-[var(--color-border)]">
                        <WorkflowEditor
                            workflow={previewWorkflowCard}
                            folders={previewFoldersWithCounts}
                            onSave={() => {}}
                            onShare={() => {}}
                            onBack={() => {}}
                        />
                    </div>
                ));
            default:
                return commonCard(filePath.split('/').pop(), (
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary">Component Ready</Button>
                        <Input placeholder="Preview fallback input" />
                    </div>
                ));
        }
    };

    const renderTokenEditor = (entry, options = {}) => {
        const { compact = false } = options;
        const rawValue = tokenValues[entry.name] || '';
        const colorValue = entry.type === 'color'
            ? resolveTokenColor(entry.name, rawValue)
            : null;
        const displayLabel = compact && entry.name.startsWith('--primitive-')
            ? compactPrimitiveLabel(entry.name)
            : entry.label;
        const requiresPrimitiveMapping = isPrimitiveMappedToken(entry.name);
        const primitiveOptions = requiresPrimitiveMapping ? getPrimitiveCandidates(entry.name, entry.type) : [];
        const selectedPrimitive = extractPrimitiveTokenName(rawValue);
        const defaultPrimitive = extractPrimitiveTokenName(defaultTokenValues[entry.name] || '') || inferDefaultPrimitiveToken(entry.name);
        const currentPrimitive = selectedPrimitive || defaultPrimitive;
        const optionHasSelected = !currentPrimitive || primitiveOptions.includes(currentPrimitive);
        const optionsSet = new Set(primitiveOptions);
        if (selectedPrimitive) optionsSet.add(selectedPrimitive);
        if (defaultPrimitive) optionsSet.add(defaultPrimitive);
        const optionsForSelect = Array.from(optionsSet);

        return (
            <div key={entry.name} className="rounded-lg border border-[var(--color-border)] p-3 bg-[var(--card-bg)]">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">{displayLabel}</p>
                        <code className="text-sm text-[var(--color-text-muted)]">{entry.name}</code>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTokenReset(entry.name)}
                        className="text-sm"
                    >
                        Reset
                    </Button>
                </div>

                {requiresPrimitiveMapping ? (
                    <div className="space-y-2">
                        <select
                            value={currentPrimitive}
                            onChange={(event) => {
                                if (event.target.value === '__default__') {
                                    if (defaultPrimitive) handleTokenValueChange(entry.name, `var(${defaultPrimitive})`);
                                    return;
                                }
                                if (!event.target.value) return;
                                handleTokenValueChange(entry.name, `var(${event.target.value})`);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-sm"
                        >
                            <option value="">Select primitive token</option>
                            {defaultPrimitive && (
                                <option value="__default__">Default ({defaultPrimitive})</option>
                            )}
                            {optionsForSelect.map((primitiveName) => (
                                <option key={primitiveName} value={primitiveName}>
                                    {primitiveName}
                                </option>
                            ))}
                        </select>
                        <code className="block text-sm text-[var(--color-text-muted)]">
                            {currentPrimitive ? `var(${currentPrimitive})` : 'Must map to var(--primitive-...)'}
                        </code>
                        {primitiveOptions.length === 0 && (
                            <p className="text-sm text-[var(--color-warning)]">
                                No primitive candidates available for this token.
                            </p>
                        )}
                        {!optionHasSelected && (
                            <p className="text-sm text-[var(--color-warning)]">
                                Current mapping is outside recommended candidates.
                            </p>
                        )}
                    </div>
                ) : entry.type === 'color' ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={colorValue || COLOR_FALLBACK}
                            onChange={(event) => handleTokenValueChange(entry.name, event.target.value)}
                            className="h-10 w-12 rounded border border-[var(--color-border)] bg-transparent p-1"
                            aria-label={`${entry.name} color picker`}
                        />
                        <Input
                            value={rawValue}
                            onChange={(event) => handleTokenValueChange(entry.name, event.target.value)}
                            placeholder="e.g. #5b4de8 or var(--primitive-color-brand)"
                        />
                    </div>
                ) : isPrimitiveSpacingToken(entry.name) ? (
                    <div className="space-y-2">
                        <Input
                            type="number"
                            step="0.5"
                            value={(() => {
                                const px = remToPx(rawValue, baseRem);
                                return px === null ? '' : String(px);
                            })()}
                            onChange={(event) => handleSpacingPxChange(entry.name, event.target.value)}
                            placeholder="Enter px value"
                        />
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {rawValue || '0rem'} ({(() => {
                                const px = remToPx(rawValue, baseRem);
                                return px === null ? '0' : Number(px.toFixed(2));
                            })()}px)
                        </p>
                    </div>
                ) : (
                    <Input
                        value={rawValue}
                        onChange={(event) => handleTokenValueChange(entry.name, event.target.value)}
                        placeholder="Enter token value"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[var(--color-surface)] text-[var(--color-text)]">
            <div className="px-8 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)] transition-colors"
                            aria-label="Back"
                            title="Back"
                        >
                            <Icon name="arrowLeft" size={20} />
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold">Design System Manager</h1>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                Full token, component, and pattern map aligned with `/src/App.jsx` product architecture.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor="theme-select" className="text-sm font-medium text-[var(--color-text-muted)]">
                            Theme
                        </label>
                        <select
                            id="theme-select"
                            value={theme}
                            onChange={(event) => handleThemeChange(event.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)]"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>

                        <Button variant="secondary" size="sm" onClick={handleResetAll}>
                            Reset All Overrides
                        </Button>
                    </div>
                </div>

                {updateStatus && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-3">
                        {updateStatus}
                    </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Button
                        variant={activeTab === 'tokens' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('tokens')}
                    >
                        Tokens
                    </Button>
                    <Button
                        variant={activeTab === 'components' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('components')}
                    >
                        Components
                    </Button>
                    <Button
                        variant={activeTab === 'patterns' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveTab('patterns')}
                    >
                        Patterns
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
                {activeTab === 'tokens' && (
                    <>
                        <Card className="mb-4 bg-[var(--card-bg)] border-[var(--card-border)]">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">Token Inventory</h2>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        {ALL_TOKENS.length} tokens exposed: primitives, semantic mappings, and component-level tokens.
                                    </p>
                                </div>
                                <div className="w-full md:w-80">
                                    <Input
                                        value={tokenSearch}
                                        onChange={(event) => setTokenSearch(event.target.value)}
                                        placeholder="Search token name or label"
                                        aria-label="Search tokens"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)] shadow-[var(--card-shadow)]">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Button
                                    size="sm"
                                    variant={tokenManagerTab === 'primitive' ? 'primary' : 'secondary'}
                                    onClick={() => setTokenManagerTab('primitive')}
                                >
                                    Primitive
                                </Button>
                                <Button
                                    size="sm"
                                    variant={tokenManagerTab === 'semantic' ? 'primary' : 'secondary'}
                                    onClick={() => setTokenManagerTab('semantic')}
                                >
                                    Semantic
                                </Button>
                                <Button
                                    size="sm"
                                    variant={tokenManagerTab === 'components' ? 'primary' : 'secondary'}
                                    onClick={() => setTokenManagerTab('components')}
                                >
                                    Components
                                </Button>
                            </div>

                            {tokenManagerTab === 'primitive' && (
                                <>
                                    <header className="mb-4">
                                        <h3 className="text-base font-semibold">Primitive Tokens</h3>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                            Keep this layer raw and reusable. Semantic and component tokens should map from here.
                                        </p>
                                    </header>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {PRIMITIVE_TOKEN_TABS.map((tab) => (
                                            <Button
                                                key={tab.id}
                                                size="sm"
                                                variant={primitiveTab === tab.id ? 'primary' : 'secondary'}
                                                onClick={() => setPrimitiveTab(tab.id)}
                                            >
                                                {tab.label}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text)]">{activePrimitiveTab.label}</p>
                                                <p className="text-sm text-[var(--color-text-muted)] mt-1">{activePrimitiveTab.description}</p>
                                            </div>
                                            {activePrimitiveTab.id === 'typography-sizes' && (
                                                <div className="w-full sm:w-44">
                                                    <label className="text-sm uppercase tracking-wide text-[var(--color-text-muted)]">Base Rem (px)</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={baseRem}
                                                        onChange={(event) => handleBaseRemChange(event.target.value)}
                                                        aria-label="Base rem value in px"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-2">
                                            Tip: leave values raw (`#hex`, `px/rem`, timing). Avoid semantic naming in this card.
                                        </p>
                                    </div>

                                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                        {filteredPrimitiveTokens.map((entry) => renderTokenEditor(entry, { compact: true }))}
                                    </div>

                                    {filteredPrimitiveTokens.length === 0 && (
                                        <p className="text-sm text-[var(--color-text-muted)] mt-3">
                                            No primitive tokens in this tab matched "{tokenSearch}".
                                        </p>
                                    )}
                                </>
                            )}

                            {tokenManagerTab === 'semantic' && (
                                <div className="space-y-4">
                                    {filteredSemanticGroups.map((group) => (
                                        <div key={group.id}>
                                            <header className="mb-3">
                                                <h3 className="text-base font-semibold">{group.title}</h3>
                                                <p className="text-sm text-[var(--color-text-muted)] mt-1">{group.description}</p>
                                            </header>
                                            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                                {group.tokens.map(renderTokenEditor)}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredSemanticGroups.length === 0 && (
                                        <p className="text-sm text-[var(--color-text-muted)]">No semantic tokens matched "{tokenSearch}".</p>
                                    )}
                                </div>
                            )}

                            {tokenManagerTab === 'components' && (
                                <div className="space-y-4">
                                    {filteredComponentGroups.map((group) => (
                                        <div key={group.id}>
                                            <header className="mb-3">
                                                <h3 className="text-base font-semibold">{group.title}</h3>
                                                <p className="text-sm text-[var(--color-text-muted)] mt-1">{group.description}</p>
                                            </header>
                                            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                                {group.tokens.map(renderTokenEditor)}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredComponentGroups.length === 0 && (
                                        <p className="text-sm text-[var(--color-text-muted)]">No component tokens matched "{tokenSearch}".</p>
                                    )}
                                </div>
                            )}
                        </Card>

                        <Card className="mt-6 bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h3 className="text-base font-semibold mb-2">Current Overrides (JSON)</h3>
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                Stored in localStorage under `workflowstudio.design-system.overrides.v1`.
                            </p>
                            <pre className="text-sm bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto">
                                {JSON.stringify(overrides, null, 2)}
                            </pre>
                        </Card>
                    </>
                )}

                {activeTab === 'components' && (
                    <div className="space-y-4">
                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-2">Component Definition</h2>
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                A component is a reusable UI building block used in many places.
                            </p>
                            <ul className="space-y-1 text-sm text-[var(--color-text-muted)]">
                                {COMPONENT_PRINCIPLES.map((item) => (
                                    <li key={item}>- {item}</li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-3">Core Components</h2>
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                Live preview list for core components, with usage status from `/src/App.jsx`.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {UI_COMPONENTS.map((component) => {
                                    const isPlanned = component.path === 'Not in /src yet';
                                    const isUsedInApp = CORE_COMPONENT_USAGE_FROM_APP[component.name];
                                    return (
                                        <div
                                            key={component.name}
                                            className="rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <p className="text-sm font-semibold">{component.name}</p>
                                                <div className="flex items-center gap-2 mb-auto">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-semibold leading-none ${
                                                            isPlanned
                                                                ? 'border-amber-200 bg-amber-100 text-amber-700'
                                                                : 'border-emerald-200 bg-emerald-100 text-emerald-700'
                                                        }`}
                                                    >
                                                        {isPlanned ? 'Planned' : 'Ready'}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-semibold leading-none ${
                                                            isUsedInApp
                                                                ? 'border-blue-200 bg-blue-100 text-blue-700'
                                                                : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]'
                                                        }`}
                                                    >
                                                        {isUsedInApp ? 'Used in App' : 'Not used in App'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                                                {component.name === 'Button' && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button size="sm" variant="primary">Primary</Button>
                                                        <Button size="sm" variant="secondary">Secondary</Button>
                                                        <Button size="sm" variant="ghost">Ghost</Button>
                                                        <Button size="sm" variant="danger">Danger</Button>
                                                        <Button size="sm" variant="success">Success</Button>
                                                        <Button
                                                            size="md"
                                                            variant="secondary"
                                                            className="gap-2"
                                                        >
                                                            <Icon name="settings" size={14} />
                                                            Configure
                                                        </Button>
                                                    </div>
                                                )}
                                                {component.name === 'Input' && (
                                                    <div className="space-y-2">
                                                        <Input placeholder="Email" />
                                                        <Input placeholder="Disabled" disabled />
                                                    </div>
                                                )}
                                                {component.name === 'Checkbox' && (
                                                    <label className="inline-flex items-center gap-2 text-sm text-[var(--color-text)]">
                                                        <input type="checkbox" className="h-4 w-4 rounded border-[var(--color-border)]" />
                                                        Checkbox preview
                                                    </label>
                                                )}
                                                {component.name === 'Badge' && (
                                                    <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-2 py-1 text-sm font-semibold text-[var(--color-text)]">
                                                        Badge preview
                                                    </span>
                                                )}
                                                {component.name === 'Card' && (
                                                    <Card className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-[calc(var(--card-radius)+6px)]">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-lg font-semibold" style={{ color: 'var(--card-title)' }}>Invite teammates</p>
                                                                <p className="text-sm mt-1" style={{ color: 'var(--card-subtitle)' }}>
                                                                    Add people to collaborate on this project.
                                                                </p>
                                                            </div>
                                                            <button className="h-8 w-8 inline-flex items-center justify-center rounded-[var(--button-radius)] border border-[var(--card-border)] bg-[var(--button-secondary-bg)]">
                                                                <Icon name="x" size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="mt-4 rounded-[calc(var(--card-radius)+2px)] border border-[var(--card-border)] bg-[var(--color-surface)] p-4">
                                                            <div className="rounded-[calc(var(--button-radius)+6px)] border border-[var(--card-border)] bg-[var(--button-secondary-bg)] p-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-9 w-9 rounded-full border border-[var(--card-border)] bg-[var(--color-surface)] flex items-center justify-center text-sm font-semibold">AN</div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-blue-600">[email protected]</p>
                                                                            <p className="text-sm" style={{ color: 'var(--card-subtitle)' }}>you</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 inline-flex w-full items-center gap-2 rounded-[var(--button-radius)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5">
                                                                <button className="flex-1 h-10 rounded-[var(--button-radius)] px-3 text-sm text-[var(--color-text-muted)]">Yes</button>
                                                                <button className="flex-1 h-10 rounded-[var(--button-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold">Maybe</button>
                                                                <button className="flex-1 h-10 rounded-[var(--button-radius)] px-3 text-sm text-[var(--color-text-muted)]">No</button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                )}
                                                {component.name === 'Tabs' && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm text-[var(--color-text-muted)] mb-1">Standard</p>
                                                            <div className="inline-flex items-center gap-2 rounded-[var(--button-radius)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5">
                                                                <button className="min-w-[110px] h-10 rounded-[var(--button-radius)] px-4 text-sm font-medium text-[var(--color-text-muted)]">Sans Serif</button>
                                                                <button className="min-w-[110px] h-10 rounded-[var(--button-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text)] shadow-sm">
                                                                    Slab
                                                                </button>
                                                                <button className="min-w-[110px] h-10 rounded-[var(--button-radius)] px-4 text-sm font-medium text-[var(--color-text-muted)]">Mono</button>
                                                                <button className="min-w-[110px] h-10 rounded-[var(--button-radius)] px-4 text-sm font-medium text-[var(--color-text-muted)]">Rounded</button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-[var(--color-text-muted)] mb-1">Small</p>
                                                            <div className="inline-flex items-center gap-2 rounded-[var(--button-radius)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5">
                                                                <button className="min-w-[88px] h-8 rounded-[var(--button-radius)] px-3 text-sm font-medium text-[var(--color-text-muted)]">Sans Serif</button>
                                                                <button className="min-w-[88px] h-8 rounded-[var(--button-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text)] shadow-sm">
                                                                    Slab
                                                                </button>
                                                                <button className="min-w-[88px] h-8 rounded-[var(--button-radius)] px-3 text-sm font-medium text-[var(--color-text-muted)]">Mono</button>
                                                                <button className="min-w-[88px] h-8 rounded-[var(--button-radius)] px-3 text-sm font-medium text-[var(--color-text-muted)]">Rounded</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {component.name === 'Modal' && (
                                                    <Button size="sm" variant="secondary" onClick={() => setIsCoreModalOpen(true)}>
                                                        Open Modal Preview
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-[var(--color-text-muted)] mt-2">{component.tokens}</p>
                                            <p className="text-sm text-[var(--color-text-muted)] mt-1 break-all">{component.path}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <Modal
                                isOpen={isCoreModalOpen}
                                onClose={() => setIsCoreModalOpen(false)}
                                title="Modal Preview"
                                footer={<Button size="sm" variant="primary" onClick={() => setIsCoreModalOpen(false)}>Done</Button>}
                            >
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    This is the base Modal component preview used by app overlays.
                                </p>
                            </Modal>
                        </Card>

                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-3">Fetched From App.jsx</h2>
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                Live component composition currently imported/used by `/src/App.jsx`.
                            </p>
                            <div className="space-y-3">
                                {PRODUCT_COMPONENTS.map((component) => (
                                    <div key={component.name} className="rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3">
                                        <p className="text-sm font-semibold">{component.name}</p>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-1">{component.role}</p>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-1 break-all">{component.path}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-3">Component Rules</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3">
                                    <p className="font-semibold mb-1">Must Have</p>
                                    <p className="text-[var(--color-text-muted)]">Reusable API with clear variants, sizes, states, and behavior.</p>
                                </div>
                                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3">
                                    <p className="font-semibold mb-1">Avoid</p>
                                    <p className="text-[var(--color-text-muted)]">Product-specific layout composition (that belongs to Patterns).</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'patterns' && (
                    <div className="space-y-4">
                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-2">Pattern Definition</h2>
                            <p className="text-sm text-[var(--color-text-muted)] mb-3">
                                A pattern is a composition of components solving a recurring use case.
                            </p>
                            <ul className="space-y-1 text-sm text-[var(--color-text-muted)]">
                                {PATTERN_PRINCIPLES.map((item) => (
                                    <li key={item}>- {item}</li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-2">Product Patterns Used By App</h2>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Organized by recurring scenarios, each pattern composed from reusable components.
                            </p>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PRODUCT_PATTERNS.map((pattern) => (
                                <Card key={pattern.name} className="bg-[var(--card-bg)] border-[var(--card-border)]">
                                    <h3 className="text-base font-semibold">{pattern.name}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-2">{pattern.useCase}</p>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-2">
                                        Components: {pattern.components.join(' • ')}
                                    </p>
                                    <pre className="mt-3 text-sm bg-gray-950 text-gray-100 rounded-lg p-3 overflow-x-auto">
                                        {pattern.structure}
                                    </pre>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
                            <h2 className="text-lg font-semibold mb-3">Pattern Composition Map</h2>
                            <div className="space-y-3">
                                {PRODUCT_COMPONENTS.map((component) => (
                                    <div key={component.name} className="rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] p-3">
                                        <p className="text-sm font-semibold">{component.name}</p>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-1">{component.role}</p>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-1">{component.path}</p>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-2">
                                            Composition: {component.composition.join(' • ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignSystem;
