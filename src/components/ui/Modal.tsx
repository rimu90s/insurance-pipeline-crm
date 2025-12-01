import React from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      {/* Wrapper buat kasih jarak atas-bawah */}
      <div className="w-full max-w-xl px-4">
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {title}
              </h3>
              {description && (
                <p className="text-[11px] text-slate-500">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Tutup
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
