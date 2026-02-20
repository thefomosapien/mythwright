import { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-foreground-muted"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-md border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:outline-none focus:ring-1 ${
            error
              ? "border-error focus:border-error focus:ring-error"
              : "border-border hover:border-border-hover focus:border-gold focus:ring-gold"
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-sm text-foreground-subtle">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
