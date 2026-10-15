import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RideHistory"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FavoriteRides"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
