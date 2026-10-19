import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { router } from 'expo-router';
import { queryClient } from '../lib/queryClient';

interface AuthContextType {
  userToken: string | null;
  userData: { 
    id?: string,
    name?: string, 
    email?: string, 
    username?: string,
    studentId?: string,
    phoneNumber?: string,
    profileImage?: string,
    isOnboarded?: boolean,
    preferredLanguage?: string,
    onboarding?: any,
    academic?: { institution: string, faculty: string, level: string, status: string },
    preferences?: { stressSource: string, supportType: string, reminders: boolean },
    latestMood?: any,
    latestReflection?: any,
    streak?: number,
    points?: number
  } | null;
  signIn: (token: string, user?: any, initialPayload?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<AuthContextType['userData']>) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<AuthContextType['userData']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token on app launch
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const user = await AsyncStorage.getItem('userData');
      if (token) setUserToken(token);
      if (user) setUserData(JSON.parse(user));
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    subscription = DeviceEventEmitter.addListener('session_expired', () => {
      signOut();
    });
    
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const signIn = async (token: string, user?: any, initialPayload?: any) => {
    await AsyncStorage.setItem('userToken', token);
    if (user) {
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      setUserData(user);
    }

    // Instantly pre-seed caches so dashboard and profile render in 0ms without skeleton delay
    if (user && initialPayload?.dashboardSnapshot) {
      queryClient.setQueryData(['dashboard', 'aggregate', user.id], initialPayload.dashboardSnapshot);
      await AsyncStorage.setItem('dashboard_cache', JSON.stringify({
        journalHistory: initialPayload.dashboardSnapshot.oracleContext?.recentJournal || [],
        moodLogs: initialPayload.dashboardSnapshot.moodHistory || []
      })).catch(() => null);
      
      await AsyncStorage.setItem('garden_cache', JSON.stringify({
        totalCount: initialPayload.dashboardSnapshot.moodHistory?.length || 0,
        moodLogs: initialPayload.dashboardSnapshot.moodHistory || [],
        insights: initialPayload.profileSnapshot?.insights || null,
        history: (initialPayload.dashboardSnapshot.moodHistory || []).slice(0, 3),
        aiInsight: null,
        suggestedResources: []
      })).catch(() => null);
    }

    if (initialPayload?.profileSnapshot) {
      await AsyncStorage.setItem('profile_cache', JSON.stringify(initialPayload.profileSnapshot)).catch(() => null);
    }

    setUserToken(token);

    // Redirect based on onboarding status
    if (user && user.isOnboarded) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  const signOut = async () => {
    queryClient.clear();
    // Safely wipe user-specific session and data caches while preserving preferences
    const userKeys = [
      'userToken',
      'userData',
      'profile_cache',
      'dashboard_cache',
      'garden_cache',
      'progress_cache',
      'REACT_QUERY_OFFLINE_CACHE'
    ];
    await AsyncStorage.multiRemove(userKeys);
    setUserToken(null);
    setUserData(null);
    router.replace('/(auth)/login');
  };

  const updateUserData = async (data: Partial<AuthContextType['userData']>) => {
    const updated = { ...userData, ...data } as AuthContextType['userData'];
    setUserData(updated);
    await AsyncStorage.setItem('userData', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, signIn, signOut, updateUserData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
