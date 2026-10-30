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
    'Premier education consultancy and career guidance for students in Telangana and Andhra Pradesh. Explore colleges, entrance exams, scholarships, and government jobs.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: [
    'education consultancy Telangana',
    'career guidance Gajwel',
    'career guidance Hyderabad',
    'after 10th Telangana',
    'EAMCET counseling TS AP',
    'TS AP scholarships',
    'government jobs Telangana',
    'engineering colleges Andhra Pradesh',
    'Rachakonda Solutions',
  ],
  openGraph: {
    title: 'Rachakonda Solutions | Education & Career Guidance',
    description: 'Premier career guidance platform for students in Telangana & Andhra Pradesh. Colleges, exams, scholarships, government jobs.',
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
    'Premier education consultancy, competitive exam preparation, and career guidance for students across Telangana and Andhra Pradesh.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Prashantha Complex, 2nd & 3rd Floor, Above LIC office, Beside Gajwel Bus Stand Main Road',
    addressLocality: 'Gajwel',
    addressRegion: 'Telangana',
    postalCode: '502278',
    addressCountry: 'IN',
  },
  hasMap: 'https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw',
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
