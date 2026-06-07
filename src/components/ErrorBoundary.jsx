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
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#0f1729', color: 'white', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: '#1a2744', padding: '30px', borderRadius: '12px', border: '1px solid #ef4444', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ color: '#ef4444', marginTop: 0 }}>Something went wrong</h2>
            <p style={{ color: '#aaa', margin: '15px 0' }}>The application crashed due to an unexpected error. This might be because required settings/environment variables are missing.</p>
            <pre style={{ background: '#0f1729', padding: '15px', borderRadius: '6px', overflowX: 'auto', textAlign: 'left', fontSize: '0.85rem', color: '#fca5a5', border: '1px solid #374151' }}>
              {this.state.error?.toString() || 'Unknown Error'}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
