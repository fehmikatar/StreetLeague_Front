import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullScreen?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  fullScreen = false,
}: EmptyStateProps) {
  const containerClasses = fullScreen ? 'min-h-screen' : 'py-16';

  return (
    <div className={`${containerClasses} flex items-center justify-center px-4`}>
      <div className="text-center max-w-md">
        {Icon && (
          <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <h3 className="mb-3">{title}</h3>
        {description && <p className="text-muted-foreground mb-6">{description}</p>}
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

// Compact version for smaller sections
export function CompactEmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon?: LucideIcon;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-8">
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
