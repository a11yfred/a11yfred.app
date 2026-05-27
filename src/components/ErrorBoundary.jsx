import { Component } from 'react'
import Screen from './A11yScreen.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Screen
          variant="error"
          ariaLabel="Application Error"
          heading="Oops! Something went wrong"
          body={this.state.error?.message || 'An unexpected error occurred. Please refresh the page to continue.'}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
