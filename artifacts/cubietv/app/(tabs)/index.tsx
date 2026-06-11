import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const nd = Platform.OS !== "web";
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: nd }),
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: nd, speed: 6, bounciness: 4 }),
      ]),
      Animated.delay(200),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: nd }),
      Animated.delay(200),
      Animated.timing(barWidth, { toValue: 1, duration: 1600, useNativeDriver: false }),
    ]).start(() => {
      router.replace("/library");
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Animated.View
          style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <View style={styles.logoPlay} />
            </View>
            <Text style={styles.logoText}>CubieTV</Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Your home media, beautifully
        </Animated.Text>

        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: barWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    gap: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
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
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  barTrack: {
    marginTop: 32,
    width: 160,
    height: 2,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 1,
    overflow: "hidden",
  },
  barFill: {
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
