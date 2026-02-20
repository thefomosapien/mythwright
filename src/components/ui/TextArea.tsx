import { forwardRef } from "react";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { label, error, maxLength, showCount = false, id, className = "", value, ...props },
    ref
  ) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-foreground-muted"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          className={`w-full rounded-md border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:outline-none focus:ring-1 ${
            error
              ? "border-error focus:border-error focus:ring-error"
              : "border-border hover:border-border-hover focus:border-gold focus:ring-gold"
          }`}
          {...props}
        />
        <div className="mt-1 flex justify-between">
          <div>
            {error && <p className="text-sm text-error">{error}</p>}
          </div>
          {showCount && maxLength && (
            <p className="text-sm text-foreground-subtle">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
