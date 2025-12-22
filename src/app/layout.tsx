import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sales Pipeline CRM',
  description: 'Pipeline & reporting tool for insurance sales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
