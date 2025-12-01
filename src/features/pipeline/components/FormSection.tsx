'use client';

import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-3 md:px-4 md:py-4">
      <h3 className="mb-2 text-[11px] font-semibold tracking-[0.04em] text-slate-600">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
