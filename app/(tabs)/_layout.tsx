import { theme } from "@/constants/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#8E8E93",

        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 0,
        },

        tabBarLabelStyle: {
          fontFamily: theme.fonts.sansMedium,
          fontSize: theme.fontSizes.xs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Conta",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={26} name="account" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
