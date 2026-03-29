import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="ChatScreen" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="medicine-details" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="modal" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="meds" />
    </Stack>
  );
}
