import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import LayoutWrapper from '@/components/LayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const viewport: Viewport = {
  themeColor: '#1E3A8A',
};

export const metadata: Metadata = {
  title: 'Rachakonda Solutions | Education & Finance',
  description: 'Empowering Education & Financial Growth. Premium business solutions.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-gray-50 text-slate-900 antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
