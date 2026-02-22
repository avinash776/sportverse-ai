import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#1e1e1e', color: '#f44', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff6b6b', fontSize: 24 }}>⚠️ App Crashed — Runtime Error</h1>
          <pre style={{ color: '#ffa', whiteSpace: 'pre-wrap', marginTop: 20, fontSize: 14 }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap', marginTop: 10, fontSize: 12 }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
