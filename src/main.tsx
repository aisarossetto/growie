import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Growie Error Boundary Caught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#050021', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <div style={{ padding: '16px 24px', backgroundColor: 'rgba(138, 112, 214, 0.15)', borderRadius: '16px', border: '1px solid #8A70D6', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#00afef' }}>🚀 Growie CRM - Reinicialização de Segurança</h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>Sua sessão foi autenticada. Clique abaixo para carregar o Workspace.</p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #8A70D6, #00afef)', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Carregar Painel Principal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
