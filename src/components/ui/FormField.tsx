import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string | null;
}

export default function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-slate-600">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
}
