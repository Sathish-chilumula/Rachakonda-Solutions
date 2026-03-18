import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChatWidget from '@/components/FloatingChatWidget';

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

import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // We can use a client component wrapper if we need usePathname, 
  // or just use a Layout conditional in the children.
  // However, the cleanest way in Next.js is to check if it's a CRM path.
  
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-gray-50 text-slate-900 antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

// Separate component to use client hooks
import LayoutWrapper from '@/components/LayoutWrapper';
