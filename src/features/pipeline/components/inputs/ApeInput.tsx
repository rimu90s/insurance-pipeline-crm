import React from 'react';

interface ApeInputProps {
  label: string;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
}

export default function ApeInput({ label, prefix, value, onChange }: ApeInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-slate-600">{label}</label>

      <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3">
        <span className="mr-2 text-[11px] text-slate-500">{prefix}</span>

        <input
          type="text"
          inputMode="numeric"
          className="w-full border-none bg-transparent py-2 text-[13px] focus:outline-none"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            onChange(raw);
          }}
        />
      </div>
    </div>
  );
}
