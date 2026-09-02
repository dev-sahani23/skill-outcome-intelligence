import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  fullWidth?: boolean;
};

const FormField = ({ label, htmlFor, children, fullWidth = false }: FormFieldProps) => {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-300 mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;
