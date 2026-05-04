import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-xl text-gray-400 mb-8 max-w-md text-center">
            We're having trouble loading the page. Refresh to try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#E50914] hover:bg-[#b20710] px-8 py-4 rounded font-bold text-lg"
          >
            Reload App
          </button>
          <details className="mt-8 p-4 bg-[#1f1f1f] rounded max-w-2xl max-h-96 overflow-auto">
            <summary className="cursor-pointer font-bold mb-2">Error details (click to expand)</summary>
            <pre className="text-sm text-gray-300 mt-2">{this.state.error?.message || this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

