'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking } from './non-blocking-updates';
import type { UserSettings } from '@/lib/types';

// Default settings if none are found in Firestore
const defaultSettings: UserSettings = {
  currency: 'ZAR',
  language: 'en-US',
  theme: 'dark',
  accent: '#16a34a',
  font: 'Inter',
  layout: 'sidebar-left',
  roundedCorners: true,
  compactMode: false,
};

interface SettingsContextState {
  settings: UserSettings;
  isSettingsLoading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const SettingsContext = createContext<SettingsContextState | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!user) return null;
    // Assuming a single settings document per user with a known ID 'main'
    return doc(firestore, `users/${user.uid}/settings`, 'main');
  }, [user, firestore]);

  const {
    data: settingsData,
    isLoading: isDocLoading,
    error,
  } = useDoc<UserSettings>(settingsRef);

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    setIsSettingsLoading(isDocLoading);
    if (settingsData) {
      setSettings(settingsData);
    } else if (!isDocLoading && user) {
      // If loading is finished, user exists, but no settings doc, create one.
      setDocumentNonBlocking(settingsRef!, defaultSettings, { merge: false });
      setSettings(defaultSettings);
    } else if (!user) {
      // If no user, reset to default
      setSettings(defaultSettings);
    }
  }, [settingsData, isDocLoading, user, settingsRef]);

  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      if (!settingsRef) return;
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings); // Optimistic update
      setDocumentNonBlocking(settingsRef, newSettings, { merge: true });
    },
    [settings, settingsRef]
  );
  
  if (error) {
    console.error("Error loading settings:", error);
  }

  return (
    <SettingsContext.Provider
      value={{ settings, isSettingsLoading, updateSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextState => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
