import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

const baseInputClasses =
  'w-full rounded bg-bg-card border border-bg-hover px-4 py-2.5 text-text placeholder:text-text-dim ' +
  'focus:outline-none focus:border-accent-purple/60 focus:ring-1 focus:ring-accent-purple/30 transition-colors';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...rest },
  ref,
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(baseInputClasses, error && 'border-status-danger focus:border-status-danger', className)}
        {...rest}
      />
      {error && <p className="text-xs text-status-danger">{error}</p>}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...rest },
  ref,
) {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={clsx(baseInputClasses, 'min-h-[120px] resize-y', error && 'border-status-danger focus:border-status-danger', className)}
        {...rest}
      />
      {error && <p className="text-xs text-status-danger">{error}</p>}
    </div>
  );
});