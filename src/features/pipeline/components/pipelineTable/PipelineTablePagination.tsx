'use client';

import React from 'react';

export default function PipelineTablePagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
      <p>
        Halaman <span className="font-semibold text-slate-800">{currentPage}</span> dari{' '}
        <span className="font-semibold text-slate-800">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
