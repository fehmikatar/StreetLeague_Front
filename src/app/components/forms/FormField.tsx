import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, success, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {hint && !error && !success && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>{hint}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 text-xs text-primary">
          <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export function Input({ error, success, className = '', ...props }: InputProps) {
  const statusClasses = error
    ? 'border-destructive focus:ring-destructive'
    : success
    ? 'border-primary focus:ring-primary'
    : 'border-border focus:ring-primary';

  return (
    <input
      className={`w-full px-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${statusClasses} ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export function Textarea({ error, success, className = '', ...props }: TextareaProps) {
  const statusClasses = error
    ? 'border-destructive focus:ring-destructive'
    : success
    ? 'border-primary focus:ring-primary'
    : 'border-border focus:ring-primary';

  return (
    <textarea
      className={`w-full px-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${statusClasses} ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  success?: boolean;
}

export function Select({ error, success, className = '', children, ...props }: SelectProps) {
  const statusClasses = error
    ? 'border-destructive focus:ring-destructive'
    : success
    ? 'border-primary focus:ring-primary'
    : 'border-border focus:ring-primary';

  return (
    <select
      className={`w-full px-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${statusClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
