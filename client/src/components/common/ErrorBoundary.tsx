import { Component, type ErrorInfo, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          <Helmet>
            <title>Something Went Wrong | RV Foods</title>
          </Helmet>
          <div className="flex min-h-[80vh] flex-col items-center justify-center bg-[#FDFAF6] px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error mb-6 border border-error/25">
              <AlertOctagon className="h-10 w-10" />
            </div>

            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-text-primary leading-tight">
              Oops! Something went wrong
            </h1>
            <p className="mt-3 text-text-secondary text-sm md:text-base max-w-md">
              A temporary application crash occurred. Our kitchen is still fine, but we need to reset the page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 max-w-2xl text-left bg-zinc-900 border border-zinc-800 text-zinc-300 p-4 rounded-xl font-mono text-xs overflow-auto max-h-48 shadow-inner w-full">
                <p className="font-bold text-red-400 mb-1">{this.state.error.name}: {this.state.error.message}</p>
                <p className="whitespace-pre">{this.state.error.stack}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none">
              <Button
                onClick={this.handleReload}
                className="gap-2 font-semibold h-11 px-6 bg-primary hover:bg-primary-dark"
              >
                <RotateCcw className="h-4.5 w-4.5" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="gap-2 font-semibold h-11 px-6 border-border text-text-secondary hover:text-text-primary bg-white"
              >
                <Home className="h-4.5 w-4.5" />
                Back to Home
              </Button>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}
