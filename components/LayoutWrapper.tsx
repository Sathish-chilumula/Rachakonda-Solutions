'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import StickyApplyCTA from '@/components/StickyApplyCTA';
import ExitIntentPopup from '@/components/ExitIntentPopup';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCRM = pathname?.startsWith('/crm');

  return (
    <>
      {!isCRM && <Header />}
      <main className={isCRM ? "w-full" : "flex-grow"}>{children}</main>
      {!isCRM && <Footer />}
      {!isCRM && <FloatingChatWidget />}
      {!isCRM && <StickyApplyCTA />}
      {!isCRM && <ExitIntentPopup />}
    </>
  );
}
