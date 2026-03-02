import { CheckCircle } from 'lucide-react';

interface SuccessStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullScreen?: boolean;
}

export function SuccessState({
  title = 'Success!',
  message = 'Your action was completed successfully.',
  action,
  fullScreen = false,
}: SuccessStateProps) {
  const containerClasses = fullScreen ? 'min-h-screen' : 'py-16';

  return (
    <div className={`${containerClasses} flex items-center justify-center px-4`}>
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Toast-like inline success
export function InlineSuccess({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-primary font-semibold">{message}</span>
    </div>
  );
}
