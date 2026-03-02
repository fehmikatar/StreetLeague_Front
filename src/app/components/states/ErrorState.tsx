import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const containerClasses = fullScreen ? 'min-h-screen' : 'py-16';

  return (
    <div className={`${containerClasses} flex items-center justify-center px-4`}>
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Inline error for forms and smaller sections
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <span className="text-destructive">{message}</span>
    </div>
  );
}
