import React from 'react';

/**
 * ErrorBoundary — catches render errors in child tree and shows a fallback UI.
 * Wrap top-level views (WorkspaceDashboard, WorkflowEditor) with this component.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        if (import.meta.env.DEV) {
            console.error('[ErrorBoundary]', error, info.componentStack);
        }
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        An unexpected error occurred. You can try reloading this section.
                    </p>
                    <button
                        onClick={this.handleReload}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Reload
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <pre className="mt-4 text-left text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg overflow-auto">
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
