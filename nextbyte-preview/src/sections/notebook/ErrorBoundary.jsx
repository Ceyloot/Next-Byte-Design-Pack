import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { GlassCard, GlassButton, GlassAlert } from '@/components/glass';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message || 'Nieznany błąd renderowania.';
    const scope = this.props.scope || 'ta część aplikacji';

    return (
      <div className="flex items-center justify-center h-full min-h-[240px] p-6">
        <GlassCard padding="p-6" radius="rounded-2xl" className="max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1.5">Coś nie zadziałało</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Wystąpił błąd w komponencie „{scope}". Reszta aplikacji nadal działa.
          </p>
          <details className="text-left mb-4">
            <summary className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer">
              Szczegóły techniczne
            </summary>
            <GlassAlert intent="danger" className="mt-2 text-left">
              <pre className="text-[10px] text-foreground/70 whitespace-pre-wrap">{message}</pre>
            </GlassAlert>
          </details>
          <div className="flex gap-2 justify-center">
            <GlassButton onClick={this.handleReset} variant="solid" size="sm">
              <RotateCw size={14} />
              Spróbuj ponownie
            </GlassButton>
            <GlassButton onClick={this.handleReload} variant="solid" size="sm">
              Przeładuj aplikację
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }
}
