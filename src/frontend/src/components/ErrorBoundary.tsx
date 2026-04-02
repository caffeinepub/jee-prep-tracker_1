import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div
            className="rounded-2xl px-8 py-10 max-w-md w-full"
            style={{
              background: "rgba(10,13,28,0.7)",
              border: "1px solid rgba(0,212,224,0.15)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <div
              className="text-lg font-semibold mb-2"
              style={{ color: "rgba(0,212,224,0.9)" }}
            >
              Timer failed to load
            </div>
            <div className="text-sm text-muted-foreground mb-6 leading-relaxed">
              This can happen if there is corrupted data in your browser storage
              from a previous version. Clearing the timer data will fix it —
              your syllabus progress is unaffected.
            </div>
            {this.state.error && (
              <div
                className="text-xs font-mono mb-5 px-3 py-2 rounded-lg text-left break-all"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "rgba(239,68,68,0.7)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "rgba(0,212,224,0.15)",
                color: "rgba(0,212,224,0.95)",
                border: "1px solid rgba(0,212,224,0.35)",
                boxShadow: "0 0 16px rgba(0,212,224,0.12)",
              }}
              onClick={() => {
                localStorage.removeItem("jee_daily_log");
                localStorage.removeItem("jee_weekly_target");
                localStorage.removeItem("jee_prep_start_date");
                window.location.reload();
              }}
            >
              Clear Timer Data &amp; Reload
            </button>
            <p className="text-[11px] text-muted-foreground/50 mt-3">
              Your syllabus, K3B, and daily tracker data are not affected.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
