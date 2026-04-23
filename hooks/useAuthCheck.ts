import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '../services/storage';

export function useAuthCheck() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [segments]);

  const checkAuth = async () => {
    try {
      const token = await storage.getToken();
      const isProfileComplete = await storage.isProfileComplete();
      const isOnboardingComplete = await storage.isOnboardingComplete();
      
      const inAuthGroup = segments[0] === 'login';
      const inProfileSetup = segments[0] === 'profile-setup';
      const inOnboarding = segments[0] === 'onboarding';

      if (!token) {
        if (!inAuthGroup) {
          router.replace('/login');
        }
      } else if (!isProfileComplete) {
        if (!inProfileSetup) {
          router.replace('/profile-setup');
        }
      } else if (!isOnboardingComplete) {
        if (!inOnboarding) {
          router.replace('/onboarding');
        }
      } else {
        if (inAuthGroup || inProfileSetup || inOnboarding) {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsReady(true);
    }
  };

  return { isReady };
}
