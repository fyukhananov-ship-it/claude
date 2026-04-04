import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#c00' }}>
          <h1>Runtime Error</h1>
          <pre>{this.state.error.message}</pre>
          <pre style={{ fontSize: 11, color: '#666', marginTop: 10 }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

// Register service worker for PWA + push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/claude/sw.js')
      .then(reg => console.log('[CLO] SW registered, scope:', reg.scope))
      .catch(err => console.log('[CLO] SW registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/claude">
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
