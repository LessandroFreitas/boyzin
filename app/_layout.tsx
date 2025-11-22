import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#f0f0f0");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="notificacao" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pages/login" />
          <Stack.Screen name="pages/home" />
          <Stack.Screen name="forms/formularioAnimal" />
          <Stack.Screen name="forms/formularioFazendeiro" />
          <Stack.Screen name="forms/formularioVeterinario" />
          <Stack.Screen name="pages/eventos" />
          <Stack.Screen name="pages/veterinarios" />
        </Stack>
      </ThemeProvider>
    </SafeAreaView>
  );
}
