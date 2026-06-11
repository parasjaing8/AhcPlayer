import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import colors from "@/constants/colors";
import type { MediaItem } from "@/data/fakeData";

interface WideMediaCardProps {
  item: MediaItem;
}

const CARD_W = 200;
const CARD_H = 113;

export function WideMediaCard({ item }: WideMediaCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0)).current;

  const nativeDriver = Platform.OS !== "web";

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.06, useNativeDriver: nativeDriver, speed: 40 }),
      Animated.timing(borderOpacity, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: nativeDriver, speed: 40 }),
      Animated.timing(borderOpacity, { toValue: 0, duration: 100, useNativeDriver: false }),
    ]).start();
  };

  const pct = item.progressPct ?? 0;

  return (
    <Pressable
      onPress={() => router.push(`/detail/${item.id}`)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Animated.View
          style={[
            styles.border,
            {
              borderColor: borderOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ["transparent", colors.focusHighlight],
              }),
            },
          ]}
        >
          <View style={[styles.thumb, { backgroundColor: item.posterColor }]}>
            <Text style={styles.thumbTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {pct > 0 && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
              </View>
            )}
          </View>
        </Animated.View>
        <View style={styles.meta}>
          <Text style={styles.metaTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.metaSub}>{item.episodeInfo ?? item.runtime}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_W, marginRight: 10 },
  border: { borderRadius: colors.radius, borderWidth: 2 },
  thumb: {
    width: CARD_W - 4,
    height: CARD_H,
    borderRadius: colors.radius - 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    overflow: "hidden",
  },
  thumbTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    textAlignVertical: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
  },
  meta: { marginTop: 6, paddingHorizontal: 2 },
  metaTitle: { color: colors.foreground, fontSize: 12, fontWeight: "600" },
  metaSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
