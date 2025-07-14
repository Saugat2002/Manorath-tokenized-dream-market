import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          border: '1px solid #e57373',
          borderRadius: '4px',
          margin: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2>Something went wrong!</h2>
          <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.stack}
            <br />
            <br />
            <strong>Component Stack:</strong>
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 