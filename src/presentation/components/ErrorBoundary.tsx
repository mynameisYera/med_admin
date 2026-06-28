import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="content">
          <div className="alert alert-error">
            <strong>{this.props.fallbackTitle ?? 'Ошибка интерфейса'}</strong>
            <p style={{ marginTop: 8 }}>{this.state.error.message}</p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 12 }}
              onClick={() => this.setState({ error: null })}
            >
              Попробовать снова
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
