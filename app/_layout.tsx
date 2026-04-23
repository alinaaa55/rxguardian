import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthCheck } from "../hooks/useAuthCheck";

import LoadingScreen from "./loading";

export default function RootLayout() {
  const { isReady } = useAuthCheck();

  if (!isReady) return <LoadingScreen />;

  return (
    <SafeAreaProvider>
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
  );
}
