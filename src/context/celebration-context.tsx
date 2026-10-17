'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CelebrationModal } from '@/components/ui/celebration-modal';
import type { Profile } from '@/lib/demo-data';

export interface CelebrateOptions {
  match: Profile;
  currentUser?: {
    name?: string;
    image?: string;
    verified?: boolean;
    city?: string;
  };
  onStartConversation?: (match: Profile) => Promise<void> | void;
}

export interface CelebrationContextValue {
  celebrateMatch: (options: CelebrateOptions) => void;
  closeCelebration: () => void;
  isOpen: boolean;
  activeMatch: Profile | null;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<CelebrateOptions['currentUser']>();
  const [customStartConversation, setCustomStartConversation] = useState<
    ((match: Profile) => Promise<void> | void) | undefined
  >();

  const celebrateMatch = useCallback((options: CelebrateOptions) => {
    setActiveMatch(options.match);
    if (options.currentUser) {
      setCurrentUser(options.currentUser);
    }
    if (options.onStartConversation) {
      setCustomStartConversation(() => options.onStartConversation);
    } else {
      setCustomStartConversation(undefined);
    }
    setIsOpen(true);
  }, []);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      celebrateMatch,
      closeCelebration,
      isOpen,
      activeMatch,
    }),
    [celebrateMatch, closeCelebration, isOpen, activeMatch]
  );

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      <CelebrationModal
        isOpen={isOpen}
        onClose={closeCelebration}
        match={activeMatch}
        currentUser={currentUser}
        onStartConversation={customStartConversation}
      />
    </CelebrationContext.Provider>
  );
}

export function useCelebration(): CelebrationContextValue {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}
