import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "hasSeenOnboarding";

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function markOnboardingAsSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "true");
  } catch {}
}
