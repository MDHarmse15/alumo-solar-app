import React from "react";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { THEME } from "../theme";

export default function Layout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.backgroundColor,
        },
        headerTintColor: theme.textColor,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
      <Stack.Screen name="resettoroot" options={{ title: "Root" }} />
      {/* Ensure (tabs) is properly nested */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Home" }} />
    </Stack>
  );
}