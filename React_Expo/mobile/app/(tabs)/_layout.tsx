import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3D5A80",
        tabBarInactiveTintColor: isDark ? "#A0A0A0" : "#666666",
        tabBarStyle: {
          backgroundColor: isDark ? "#12181B" : "#F7F6F3",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2D3748" : "#E1DED6",
          paddingBottom: 4,
          paddingTop: 4,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "grid" : "grid-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "checkbox" : "checkbox-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
