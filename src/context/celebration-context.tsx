'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { CelebrationModal } from '@/components/ui/celebration-modal';
import type { Profile } from '@/lib/demo-data';
import { chatService } from '@/services/chat.service';
import { notificationService } from '@/services/notification.service';
import { profileService } from '@/services/profile.service';
import { authService } from '@/services/auth.service';

export interface CelebrateOptions {
  match: Profile;
  notificationId?: string;
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
  const [activeNotificationId, setActiveNotificationId] = useState<string | undefined>();
  const [currentUser, setCurrentUser] = useState<CelebrateOptions['currentUser']>();
  const [customStartConversation, setCustomStartConversation] = useState<
    ((match: Profile) => Promise<void> | void) | undefined
  >();

  const currentUserIdRef = useRef<string | null>(null);

  // Helper to mark a celebrated match as acknowledged
  const acknowledgeCelebration = useCallback((notificationId?: string, partnerId?: string) => {
    if (notificationId) {
      notificationService.markAsRead(notificationId).catch(() => {});
    }
    if (typeof window !== 'undefined' && partnerId && currentUserIdRef.current) {
      try {
        const key = `ishtam_celebrated_${currentUserIdRef.current}`;
        const stored: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (!stored.includes(partnerId)) {
          localStorage.setItem(key, JSON.stringify([...stored, partnerId]));
        }
      } catch {}
    }
  }, []);

  const celebrateMatch = useCallback((options: CelebrateOptions) => {
    setActiveMatch(options.match);
    setActiveNotificationId(options.notificationId);
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
    if (activeMatch) {
      acknowledgeCelebration(activeNotificationId, activeMatch.id);
    }
    setIsOpen(false);
  }, [activeMatch, activeNotificationId, acknowledgeCelebration]);

  // Load current user profile details
  useEffect(() => {
    profileService
      .getProfile('me')
      .then((res: any) => {
        if (!res) return;
        const p = res.user || res;
        currentUserIdRef.current = p.id || res.id;
        const photos = p.photos || res.photos || [];
        const primary = photos.find((ph: any) => ph.isPrimary)?.url || photos[0]?.url || p.image;
        setCurrentUser({
          name: p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : 'You',
          image: primary || '',
          verified: p.isVerified ?? true,
          city: res.city || p.city || '',
        });
      })
      .catch(() => {});
  }, []);

  // 1. REAL-TIME: Listen to WebSocket match_celebration events when user is online
  useEffect(() => {
    const cleanup = chatService.onMatchCelebration((data) => {
      if (!data?.partner) return;
      const partner = data.partner;
      celebrateMatch({
        match: partner,
        notificationId: data.notificationId,
      });
    });

    return cleanup;
  }, [celebrateMatch]);

  // 2. OFFLINE CATCH-UP: If user was offline, check unread MATCH_ACCEPTED notifications on app load
  useEffect(() => {
    let isCancelled = false;

    async function checkPendingCelebrations() {
      try {
        const user = await authService.getCurrentUser().catch(() => null);
        if (!user?.id || isCancelled) return;
        currentUserIdRef.current = user.id;

        const notifs = await notificationService.getNotifications().catch(() => []);
        if (!Array.isArray(notifs) || notifs.length === 0 || isCancelled) return;

        // Find latest unread MATCH_ACCEPTED notification
        const unreadMatch = notifs.find(
          (n) => !n.isRead && n.type === 'MATCH_ACCEPTED' && n.referenceId
        );
        if (!unreadMatch || !unreadMatch.referenceId) return;

        // Check if user already saw and dismissed this partner popup
        const key = `ishtam_celebrated_${user.id}`;
        let celebratedList: string[] = [];
        try {
          celebratedList = JSON.parse(localStorage.getItem(key) || '[]');
        } catch {}

        if (celebratedList.includes(unreadMatch.referenceId)) {
          // Already seen locally, ensure notification is marked read
          notificationService.markAsRead(unreadMatch.id).catch(() => {});
          return;
        }

        // Fetch partner profile to display in the celebration modal
        const partnerProfile = await profileService.getProfile(unreadMatch.referenceId).catch(() => null);
        if (!partnerProfile || isCancelled) return;

        const photos = partnerProfile.photos || [];
        const primaryPhoto = photos.find((p: any) => p.isPrimary)?.url || photos[0]?.url || '';

        const calculatedAge =
          partnerProfile.age !== undefined && partnerProfile.age !== null
            ? partnerProfile.age
            : partnerProfile.dateOfBirth
            ? Math.floor((new Date().getTime() - new Date(partnerProfile.dateOfBirth).getTime()) / 31557600000)
            : 26;

        const mappedMatch: Profile = {
          id: partnerProfile.id || unreadMatch.referenceId,
          profileId: partnerProfile.profileId,
          name: partnerProfile.name || `${partnerProfile.firstName || ''} ${partnerProfile.lastName || ''}`.trim() || 'Match',
          age: calculatedAge,
          city: partnerProfile.city || '',
          state: partnerProfile.state || '',
          profession: partnerProfile.occupation || partnerProfile.profession || 'Professional',
          education: partnerProfile.education || 'Graduate',
          image: primaryPhoto,
          compatibility: (partnerProfile as any).compatibility || 94,
          verified: partnerProfile.isVerified ?? true,
          about: partnerProfile.bio || '',
          height: partnerProfile.height ? `${partnerProfile.height}cm` : '',
          maritalStatus: partnerProfile.maritalStatus || '',
          religion: partnerProfile.religion || '',
          motherTongue: partnerProfile.motherTongue || '',
          family: '',
          lifestyle: [],
          interests: [],
          lookingFor: '',
        };

        if (!isCancelled) {
          celebrateMatch({
            match: mappedMatch,
            notificationId: unreadMatch.id,
          });
        }
      } catch (err) {
        console.warn('[CelebrationProvider] Could not load pending match celebration:', err);
      }
    }

    // Small delay to let page mount smoothly before popping up
    const timer = setTimeout(() => {
      checkPendingCelebrations();
    }, 1200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [celebrateMatch]);

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
