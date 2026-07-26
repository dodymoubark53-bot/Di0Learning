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
        <div style={{ padding: '20px', background: '#080c16', color: 'white', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: '#101626', padding: '30px', borderRadius: '16px', border: '1px solid #ef4444', maxWidth: '600px', width: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#ef4444', marginTop: 0, fontSize: '1.6rem' }}>Something went wrong</h2>
            <p style={{ color: '#94a3b8', margin: '15px 0', fontSize: '0.95rem' }}>An unexpected error occurred in the application view.</p>
            <pre style={{ background: '#080c16', padding: '15px', borderRadius: '8px', overflowX: 'auto', textAlign: 'left', fontSize: '0.8rem', color: '#fca5a5', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '200px' }}>
              {this.state.error?.stack || this.state.error?.toString() || 'Unknown Error'}
            </pre>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #9b51e0 100%)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Reload Application
              </button>
              <button 
                onClick={() => {
                  if (window.confirm("Clear application cache and reset local data?")) {
                    localStorage.clear();
                    window.location.href = "/";
                  }
                }} 
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Reset Data & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
