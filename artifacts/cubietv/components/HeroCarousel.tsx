import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { TVButton } from "./TVButton";
import type { MediaItem } from "@/data/fakeData";

const { width: SCREEN_W } = Dimensions.get("window");
const HERO_HEIGHT = Math.round(SCREEN_W * 0.52);

function CarouselPlayBtn({ onPress }: { onPress: () => void }) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus
    >
      <Animated.View style={[styles.playBtn, {
        borderColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: ["transparent", colors.focusHighlight] }),
        transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
      }]}>
        <Feather name="play" size={16} color="#000" />
        <Text style={styles.playBtnText}>Play</Text>
      </Animated.View>
    </Pressable>
  );
}

interface HeroCarouselProps {
  items: MediaItem[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nativeDriver = Platform.OS !== "web";

  const goTo = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: nativeDriver }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: nativeDriver }),
    ]).start();
    setActive(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (active + 1) % items.length;
      goTo(next);
    }, 6000);
    return () => clearInterval(interval);
  }, [active, items.length]);

  const item = items[active];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: item.backdropColor, opacity: fadeAnim },
        ]}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.type}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {item.year} · {item.runtime} · {item.rating}
        </Text>
        <Text style={styles.genre}>{item.genre}</Text>
        <Text style={styles.synopsis} numberOfLines={2}>
          {item.synopsis}
        </Text>
        <View style={styles.buttons}>
          <CarouselPlayBtn onPress={() => router.push(`/player/${item.id}`)} />
          <TVButton
            label="More Info"
            variant="ghost"
            onPress={() => router.push(`/detail/${item.id}`)}
          />
        </View>
      </View>
      <View style={styles.dots}>
        {items.map((_, i) => (
          <Pressable key={i} onPress={() => goTo(i)}>
            <View
              style={[
                styles.dot,
                i === active ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    marginBottom: 24,
    overflow: "hidden",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,15,15,0.55)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    color: colors.foreground,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 6,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 3,
  },
  genre: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 8,
  },
  synopsis: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  playBtnFocused: {
    borderColor: colors.focusHighlight,
  },
  playBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    bottom: 14,
    right: 22,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
