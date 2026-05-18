import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '240px',
        padding: '32px',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{ fontSize: '2.5rem' }}>⚠️</div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary, #111)', marginBottom: '6px', fontSize: '1rem' }}>
            Une erreur inattendue s'est produite
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', maxWidth: '360px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'Veuillez recharger ou réessayer.'}
          </p>
        </div>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: '8px',
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent, #FF385C)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }
}
