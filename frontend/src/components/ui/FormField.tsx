import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  fullWidth?: boolean;
  helperText?: string;
  error?: string;
};

const FormField = ({
  label,
  htmlFor,
  children,
  fullWidth = false,
  helperText,
  error,
}: FormFieldProps) => {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold uppercase tracking-wider text-foreground mb-2"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-error">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;
