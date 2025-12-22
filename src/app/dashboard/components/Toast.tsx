'use client';

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

type ToastProps = {
  toast: ToastState | null;
};

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg text-xs text-white z-50
        ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}
      `}
    >
      {toast.message}
    </div>
  );
}
