import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-caption font-medium uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-input">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`block w-full rounded-input border border-border bg-surface-raised px-3.5 py-2.5 text-small text-text placeholder:text-text-muted transition-apple focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-caption text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-caption text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-caption font-medium uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`block w-full rounded-input border border-border bg-surface-raised px-3.5 py-2.5 text-small text-text placeholder:text-text-muted transition-apple focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-caption text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-caption text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
};
