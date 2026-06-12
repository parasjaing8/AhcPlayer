import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="library" />
      <Stack.Screen name="detail/[id]" />
      <Stack.Screen name="player/[id]" options={{ animation: "none" }} />
      <Stack.Screen name="search" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="source-setup" />
      <Stack.Screen name="discovery" />
      <Stack.Screen name="browse/[sourceId]" />
      <Stack.Screen name="personal" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <View style={styles.logoMark}>
          <View style={styles.logoPlay} />
        </View>
        <Text style={styles.logoText}>CubieTV</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlay: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftColor: "#fff",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 4,
  },
  logoText: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
