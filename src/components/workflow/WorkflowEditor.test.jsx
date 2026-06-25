
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkflowEditor } from './WorkflowEditor';
import { ToastProvider } from '../../contexts/ToastContext';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Zap: () => <div data-testid="icon-zap" />,
    Play: () => <div data-testid="icon-play" />,
    Send: () => <div data-testid="icon-send" />,
    GitBranch: () => <div data-testid="icon-git-branch" />,
    Clock: () => <div data-testid="icon-clock" />,
    User: () => <div data-testid="icon-user" />,
    RefreshCw: () => <div data-testid="icon-refresh-cw" />,
    Layers: () => <div data-testid="icon-layers" />,
    Shuffle: () => <div data-testid="icon-shuffle" />,
    Split: () => <div data-testid="icon-split" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
    Search: () => <div data-testid="icon-search" />,
    X: () => <div data-testid="icon-x" />,
    Move: () => <div data-testid="icon-move" />,
    Workflow: () => <div data-testid="icon-workflow" />,
    Maximize: () => <div data-testid="icon-maximize" />,
    Minus: () => <div data-testid="icon-minus" />,
    Plus: () => <div data-testid="icon-plus" />,
    MoreHorizontal: () => <div data-testid="icon-more-horizontal" />,
    MoreVertical: () => <div data-testid="icon-more-vertical" />,
    HelpCircle: () => <div data-testid="icon-help-circle" />,
    ChevronUp: () => <div data-testid="icon-chevron-up" />,
    ExternalLink: () => <div data-testid="icon-external-link" />,
    ChevronLeft: () => <div data-testid="icon-chevron-left" />,
    Settings: () => <div data-testid="icon-settings" />,
    Undo: () => <div data-testid="icon-undo" />,
    Redo: () => <div data-testid="icon-redo" />,
    Save: () => <div data-testid="icon-save" />,
    Share2: () => <div data-testid="icon-share-2" />,
    MessageSquare: () => <div data-testid="icon-message-square" />,
    Trash2: () => <div data-testid="icon-trash-2" />,
    Copy: () => <div data-testid="icon-copy" />,
    ArrowLeft: () => <div data-testid="icon-arrow-left" />,
    Database: () => <div data-testid="icon-database" />,
    FileText: () => <div data-testid="icon-file-text" />,
    Layout: () => <div data-testid="icon-layout" />,
    Filter: () => <div data-testid="icon-filter" />,
    Bell: () => <div data-testid="icon-bell" />,
    Folder: () => <div data-testid="icon-folder" />,
    Sliders: () => <div data-testid="icon-sliders" />,
    Brain: () => <div data-testid="icon-brain" />,
    ChevronRight: () => <div data-testid="icon-chevron-right" />,
    Edit: () => <div data-testid="icon-edit" />,
    Bot: () => <div data-testid="icon-bot" />,
    RotateCcw: () => <div data-testid="icon-rotate-ccw" />,
    RotateCw: () => <div data-testid="icon-rotate-cw" />,
    Loader: () => <div data-testid="icon-loader" />,
    Check: () => <div data-testid="icon-check" />,
    Share: () => <div data-testid="icon-share" />,
    Server: () => <div data-testid="icon-server" />,
    BarChart: () => <div data-testid="icon-bar-chart" />,
    Cpu: () => <div data-testid="icon-cpu" />,
    Repeat: () => <div data-testid="icon-repeat" />,
    Trash: () => <div data-testid="icon-trash" />,
    Info: () => <div data-testid="icon-info" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    ChevronDown: () => <div data-testid="icon-chevron-down" />,
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

const renderWithProviders = (ui) => render(<ToastProvider>{ui}</ToastProvider>);

describe('WorkflowEditor', () => {
    it('handles Scale to Fit correctly', () => {
        renderWithProviders(<WorkflowEditor />);
        const zoomIn = screen.getByTitle('Zoom In');
        const fitButton = screen.getByTitle('Scale to Fit');
        const zoomLabel = screen.getByLabelText(/Zoom level/);
        expect(zoomLabel).toHaveTextContent('100%');
        fireEvent.click(zoomIn);
        expect(zoomLabel).not.toHaveTextContent('100%');
        fireEvent.click(fitButton);
        expect(zoomLabel).toHaveTextContent('100%');
    });

    it('displays Draft folder when workflow has no folderId', () => {
        const mockWorkflow = {
            id: 'wf-draft',
            name: 'Draft Workflow',
            folderId: null
        };
        renderWithProviders(<WorkflowEditor workflow={mockWorkflow} />);
        
        const draftElements = screen.getAllByText('Draft');
        expect(draftElements.length).toBeGreaterThan(0);
    });

    it('renders initial nodes in ReactFlow', () => {
        const { container } = renderWithProviders(<WorkflowEditor />);
        const rfNodes = container.querySelectorAll('.react-flow__node');
        expect(rfNodes.length).toBeGreaterThan(0);
        expect(screen.getByText('Start Workflow')).toBeInTheDocument();
    });

    it('toggles Properties Panel on configuration button click', () => {
        const { container } = renderWithProviders(<WorkflowEditor />);

        // Ensure initial state: No panel
        expect(screen.queryByText('Configuration')).not.toBeInTheDocument();

        // Find configuration button for a node (Start Workflow is the first node)
        // We look for the button with title "Configure Node" inside the node
        // Or just getAllByTitle('Configure Node')[0]
        const configButtons = screen.getAllByTitle('Configure Node');
        expect(configButtons.length).toBeGreaterThan(0);
        const configButton = configButtons[0];

        // Click to open
        fireEvent.click(configButton);

        // Check if panel opened
        expect(screen.getByText('Configuration')).toBeInTheDocument();

        // Check if button title changed (active state)
        expect(configButton).toHaveAttribute('title', 'Close Configuration');
        expect(configButton).toHaveAttribute('aria-label', 'Close Configuration');
        expect(configButton).toHaveAttribute('aria-pressed', 'true');

        // Click to close
        fireEvent.click(configButton);

        // Check if panel closed
        // Note: PropertiesPanel returns null if no node, so it should be removed from DOM
        expect(screen.queryByText('Configuration')).not.toBeInTheDocument();

        // Check if button title reverted
        expect(configButton).toHaveAttribute('title', 'Configure Node');
        expect(configButton).toHaveAttribute('aria-label', 'Configure Node');
        expect(configButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('applies Scale to Fit after Auto Organize', async () => {
        renderWithProviders(<WorkflowEditor />);
        const zoomIn = screen.getByTitle('Zoom In');
        const autoButton = screen.getByTitle('Auto Organize');
        const zoomLabel = screen.getByLabelText(/Zoom level/);
        expect(zoomLabel).toHaveTextContent('100%');
        fireEvent.click(zoomIn);
        expect(zoomLabel).not.toHaveTextContent('100%');
        fireEvent.click(autoButton);
        await waitFor(() => {
            expect(zoomLabel).toHaveTextContent('100%');
        });
    });

    it('triggers auto-organize when clicked', async () => {
        renderWithProviders(<WorkflowEditor />);
        const autoButton = screen.getByTitle('Auto Organize');
        const zoomLabel = screen.getByLabelText(/Zoom level/);
        fireEvent.click(autoButton);
        await waitFor(() => {
            expect(zoomLabel).toHaveTextContent('100%');
        });
    });
});
