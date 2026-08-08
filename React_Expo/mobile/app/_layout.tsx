import { useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup =
      segments[0] === "login" ||
      segments[0] === "signup" ||
      segments[0] === "forgot-password";

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not on an auth screen
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Redirect to dashboard tabs if authenticated but on an auth screen
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F6F3" }}>
        <ActivityIndicator size="large" color="#3D5A80" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ title: "Reset Password", headerBackTitle: "Back" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Task" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
