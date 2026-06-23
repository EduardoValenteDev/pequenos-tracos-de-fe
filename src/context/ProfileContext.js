import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AVATAR_ID, DEFAULT_SKIN_TONE } from '../data/avatars';
import { log } from '../utils/logger';

const PROFILE_KEY = '@ptf_profile';

const DEFAULT_PROFILE = {
  name: '',
  avatarId: DEFAULT_AVATAR_ID,
  skinTone: DEFAULT_SKIN_TONE,
};

const ProfileContext = createContext({
  profile: DEFAULT_PROFILE,
  saveProfile: async () => {},
  loading: true,
});

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => { if (raw) setProfile(JSON.parse(raw)); })
      .catch(e => log('ProfileContext.load:', e))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = useCallback(async (updates) => {
    const updated = { ...profile, ...updates };
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);
    } catch (e) {
      log('ProfileContext.save:', e);
    }
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
