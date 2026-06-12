import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import colors from "@/constants/colors";
import type { MediaItem } from "@/data/fakeData";

interface MediaCardProps {
  item: MediaItem;
  preferFocus?: boolean;
  onItemFocus?: (item: MediaItem) => void;
  pressableRef?: React.Ref<any>;
}

const CARD_WIDTH = 130;
const CARD_HEIGHT = 195;

export function MediaCard({ item, preferFocus = false, onItemFocus, pressableRef }: MediaCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0)).current;

  const highlight = (on: boolean) => {
    Animated.spring(scale, { toValue: on ? 1.08 : 1, useNativeDriver: false, speed: 40 }).start();
    Animated.timing(borderOpacity, { toValue: on ? 1 : 0, duration: 120, useNativeDriver: false }).start();
    if (on) onItemFocus?.(item);
  };

  return (
    <Pressable
      ref={pressableRef}
      onPress={() => router.push(`/detail/${item.id}`)}
      onFocus={() => highlight(true)}
      onBlur={() => highlight(false)}
      onPressIn={() => highlight(true)}
      onPressOut={() => highlight(false)}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
      focusable
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
          <View style={[styles.poster, { backgroundColor: item.posterColor }]}>
            {item.posterUrl ? (
              <Image
                source={{ uri: item.posterUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Text style={styles.posterTitle} numberOfLines={3}>
                {item.title}
              </Text>
            )}
            {item.videoUrl && (
              <View style={styles.videoBadge}>
                <Text style={styles.videoBadgeDot}>●</Text>
              </View>
            )}
          </View>
        </Animated.View>
        <View style={styles.meta}>
          <Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.metaSub}>{item.year} · {item.rating}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, marginRight: 10 },
  border: { borderRadius: colors.radius, borderWidth: 2 },
  poster: {
    width: CARD_WIDTH - 4,
    height: CARD_HEIGHT,
    borderRadius: colors.radius - 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    overflow: "hidden",
  },
  posterTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  videoBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  videoBadgeDot: { color: "#22c55e", fontSize: 8 },
  meta: { marginTop: 6, paddingHorizontal: 2 },
  metaTitle: { color: colors.foreground, fontSize: 12, fontWeight: "600" },
  metaSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
