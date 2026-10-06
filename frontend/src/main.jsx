import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Fatal Application Error caught by root boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBF9F6', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #fed7aa', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              ⚡
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1c1917', margin: '0 0 8px' }}>Application Workspace Reset</h2>
            <p style={{ fontSize: '12px', color: '#78716c', lineHeight: '1.6', margin: '0 0 20px' }}>
              A UI rendering exception occurred: <br />
              <strong style={{ color: '#ea580c' }}>{this.state.error?.message || 'Unexpected state'}</strong>
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ background: '#1c1917', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Reload App
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Clear Cache & Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
