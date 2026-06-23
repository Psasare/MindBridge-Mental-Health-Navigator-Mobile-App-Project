import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { router } from 'expo-router';

interface AuthContextType {
  userToken: string | null;
  userData: { 
    id?: string,
    name?: string, 
    email?: string, 
    username?: string,
    isOnboarded?: boolean,
    preferredLanguage?: string,
    academic?: { institution: string, faculty: string, level: string, status: string },
    preferences?: { stressSource: string, supportType: string, reminders: boolean }
  } | null;
  signIn: (token: string, user?: any) => Promise<void>;
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

  const signIn = async (token: string, user?: any) => {
    await AsyncStorage.setItem('userToken', token);
    if (user) {
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      setUserData(user);
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
    await AsyncStorage.multiRemove(['userToken', 'userData']);
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
