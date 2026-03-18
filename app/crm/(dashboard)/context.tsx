'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CRMContextType {
  profile: any;
  impersonatedUser: any;
  setImpersonatedUser: (user: any) => void;
  activeRole: string;
  isImpersonating: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children, initialProfile }: { children: ReactNode, initialProfile: any }) {
  const [profile] = useState(initialProfile);
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null);

  const activeRole = impersonatedUser?.role || profile?.role || 'sales';
  const isImpersonating = !!impersonatedUser;

  return (
    <CRMContext.Provider value={{ 
      profile, 
      impersonatedUser, 
      setImpersonatedUser, 
      activeRole, 
      isImpersonating 
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
