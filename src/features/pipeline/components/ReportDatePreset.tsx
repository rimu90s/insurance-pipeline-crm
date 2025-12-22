'use client';

type ReportPreset = "today" | "yesterday" | "7d" | "30d";

interface Props {
  preset: ReportPreset;
  setPreset: (p: ReportPreset) => void;
}

export default function ReportDatePreset({ preset, setPreset }: Props) {
  const buttons: { label: string; value: ReportPreset }[] = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
  ];

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-col">
        <p className="text-[11px] font-medium text-slate-600">
          Periode laporan
        </p>
        <p className="text-[10px] text-slate-500">
          Hitung ulang ringkasan dan tren berdasarkan tanggal anchor yang dipilih.
        </p>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {buttons.map((btn) => {
          const active = btn.value === preset;
          return (
            <button
              key={btn.value}
              type="button"
              onClick={() => setPreset(btn.value)}
              className={
                active
                  ? "px-3 py-1.5 text-[11px] rounded-lg bg-slate-900 text-white shadow-sm"
                  : "px-3 py-1.5 text-[11px] rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
