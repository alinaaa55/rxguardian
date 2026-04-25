import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthCheck } from "../hooks/useAuthCheck";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { useEffect, useRef } from "react";
import { notificationService } from "../services/notificationService";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";

import LoadingScreen from "./loading";

function NotificationHandler() {
  const { voiceReminders } = useSettings();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        if (voiceReminders) {
          const { title, body } = notification.request.content;
          Speech.speak(`${title}. ${body}`, { rate: 0.9 });
        }
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        // Handle user tapping on notification if needed
      });
    } catch (error) {
      console.warn('Could not register notification listeners in current environment.');
    }

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [voiceReminders]);

  return null;
}

export default function RootLayout() {
  const { isReady } = useAuthCheck();

  useEffect(() => {
    notificationService.requestPermissions();
  }, []);

  if (!isReady) return <LoadingScreen />;

  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <NotificationHandler />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="medicine-details" />
          <Stack.Screen name="login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="loading" />
          <Stack.Screen name="modal" />
          <Stack.Screen name="scan" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="profile-setup" />
        </Stack>
      </SafeAreaProvider>
    </SettingsProvider>
  );
}



