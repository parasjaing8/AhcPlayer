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

interface MediaCardProps {
  item: MediaItem;
}

const CARD_WIDTH = 130;
const CARD_HEIGHT = 195;

export function MediaCard({ item }: MediaCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0)).current;

  const nativeDriver = Platform.OS !== "web";

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.06, useNativeDriver: nativeDriver, speed: 40 }),
      Animated.timing(borderOpacity, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: nativeDriver, speed: 40 }),
      Animated.timing(borderOpacity, { toValue: 0, duration: 120, useNativeDriver: false }),
    ]).start();
  };

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
          <View
            style={[styles.poster, { backgroundColor: item.posterColor }]}
          >
            <Text style={styles.posterTitle} numberOfLines={3}>
              {item.title}
            </Text>
          </View>
        </Animated.View>
        <View style={styles.meta}>
          <Text style={styles.metaTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.metaSub}>
            {item.year} · {item.rating}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: 10,
  },
  border: {
    borderRadius: colors.radius,
    borderWidth: 2,
  },
  poster: {
    width: CARD_WIDTH - 4,
    height: CARD_HEIGHT,
    borderRadius: colors.radius - 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  posterTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  meta: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  metaTitle: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  metaSub: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
