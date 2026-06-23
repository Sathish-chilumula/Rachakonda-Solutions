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
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  title: 'Rachakonda Solutions | Education & Career Guidance — Telangana & AP',
  description:
    'Expert education consultancy and free career guidance for students in Telangana and Andhra Pradesh. Explore colleges, exams, scholarships, government jobs, and career paths.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: [
    'education consultancy Telangana',
    'career guidance Hyderabad',
    'after 10th Telangana',
    'EAMCET coaching',
    'TS AP scholarships',
    'government jobs Telangana',
    'engineering colleges Andhra Pradesh',
    'Rachakonda Solutions',
  ],
  openGraph: {
    title: 'Rachakonda Solutions | Education & Career Guidance',
    description: 'Free career guidance for students in Telangana & Andhra Pradesh. Colleges, exams, scholarships, government jobs.',
    url: 'https://rachakonda.pages.dev',
    siteName: 'Rachakonda Solutions',
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Rachakonda Solutions',
  url: 'https://rachakonda.pages.dev',
  logo: 'https://rachakonda.pages.dev/icon.svg',
  description:
    'Expert education consultancy and career guidance for students in Telangana and Andhra Pradesh.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9640333313',
    contactType: 'customer support',
    areaServed: ['Telangana', 'Andhra Pradesh'],
    availableLanguage: ['English', 'Telugu'],
  },
  areaServed: ['Telangana', 'Andhra Pradesh'],
  serviceType: 'Education Consultancy and Career Guidance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="font-sans bg-gray-50 text-slate-900 antialiased min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
