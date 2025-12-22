import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="border border-slate-200 bg-slate-50/40 rounded-xl p-3 space-y-3">
      <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
        {title}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}
