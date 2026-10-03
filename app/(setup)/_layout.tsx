import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="locationService" options={{ headerShown: false }} />
    </Stack>
  );
}
