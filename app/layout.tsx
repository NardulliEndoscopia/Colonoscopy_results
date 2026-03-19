import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ColonScope — Entiende tu colonoscopia',
  description: 'Herramienta educativa para entender tu informe de colonoscopia con IA. No sustituye al médico.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
