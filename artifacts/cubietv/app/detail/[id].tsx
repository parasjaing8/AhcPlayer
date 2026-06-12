import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { FAKE_MEDIA, MOVIES } from "@/data/fakeData";
import { MediaCard } from "@/components/MediaCard";

const { width: W } = Dimensions.get("window");
const BACKDROP_H = Math.round(W * 0.5);

const KEY_WATCHLIST = (id: string) => `@cubietv:watchlist:${id}`;
const KEY_WATCHED = (id: string) => `@cubietv:watched:${id}`;

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const item = FAKE_MEDIA.find((m) => m.id === id) ?? FAKE_MEDIA[0];
  const moreLike = MOVIES.filter((m) => m.id !== item.id).slice(0, 8);

  const [watchlisted, setWatchlisted] = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY_WATCHLIST(item.id)),
      AsyncStorage.getItem(KEY_WATCHED(item.id)),
    ]).then(([w, wd]) => {
      setWatchlisted(w === "1");
      setWatched(wd === "1");
    });
  }, [item.id]);

  const toggleWatchlist = useCallback(async () => {
    const next = !watchlisted;
    setWatchlisted(next);
    await AsyncStorage.setItem(KEY_WATCHLIST(item.id), next ? "1" : "0");
  }, [watchlisted, item.id]);

  const toggleWatched = useCallback(async () => {
    const next = !watched;
    setWatched(next);
    await AsyncStorage.setItem(KEY_WATCHED(item.id), next ? "1" : "0");
  }, [watched, item.id]);

  return (
    <View style={styles.root}>
      <View style={[styles.backdrop, { backgroundColor: item.backdropColor, height: BACKDROP_H }]}>
        <View style={styles.backdropOverlay} />
      </View>

      <FocusBtn
        style={[styles.backBtn, { top: topPad + 8 }]}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </FocusBtn>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: BACKDROP_H * 0.45 }} />

        <View style={styles.body}>
          <View style={styles.topSection}>
            <View style={[styles.poster, { backgroundColor: item.posterColor }]}>
              <Text style={styles.posterTitle} numberOfLines={4}>{item.title}</Text>
            </View>

            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.metaLine}>
                {item.year} · {item.rating} · {item.runtime}
              </Text>
              <Text style={styles.genre}>{item.genre}</Text>
              <Text style={styles.synopsis} numberOfLines={4}>{item.synopsis}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <PlayBtn
              label="Play"
              icon="play"
              onPress={() => router.push(`/player/${item.id}`)}
              primary
              preferFocus
            />

            {(item.progressPct ?? 0) > 0 && (
              <PlayBtn
                label="Resume"
                icon="play-circle"
                onPress={() => router.push(`/player/${item.id}`)}
              />
            )}

            <PlayBtn
              label={watchlisted ? "In List" : "Watchlist"}
              icon={watchlisted ? "check-circle" : "plus"}
              onPress={toggleWatchlist}
              active={watchlisted}
            />
            <PlayBtn
              label={watched ? "Watched" : "Mark Watched"}
              icon="check"
              onPress={toggleWatched}
              active={watched}
            />
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>More Like This</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moreList}
          >
            {moreLike.map((m) => (
              <MediaCard key={m.id} item={m} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function FocusBtn({
  children, onPress, style, preferFocus,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  preferFocus?: boolean;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
    >
      <Animated.View style={[style, {
        borderColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(255,255,255,0.2)", colors.focusHighlight] }),
        transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
      }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function PlayBtn({
  label, icon, onPress, primary, active, preferFocus,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  primary?: boolean;
  active?: boolean;
  preferFocus?: boolean;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
    >
      <Animated.View style={[
        styles.actionBtn,
        primary && styles.actionBtnPrimary,
        active && styles.actionBtnActive,
        {
          borderColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [primary ? "#fff" : active ? colors.primary : "rgba(255,255,255,0.25)", colors.focusHighlight],
          }),
          transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
        },
      ]}>
        <Feather name={icon} size={15} color={primary ? "#000" : active ? colors.primary : "rgba(255,255,255,0.85)"} />
        <Text style={[styles.actionBtnText, primary && styles.actionBtnTextPrimary, active && styles.actionBtnTextActive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,15,15,0.5)",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 18 },
  topSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: colors.radius,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    flexShrink: 0,
  },
  posterTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  meta: { flex: 1, justifyContent: "flex-end" },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  metaLine: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 3,
  },
  genre: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 10,
  },
  synopsis: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  actionBtnPrimary: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  actionBtnActive: {
    backgroundColor: "rgba(229,9,20,0.15)",
    borderColor: colors.primary,
  },
  actionBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtnTextPrimary: {
    color: "#000",
    fontWeight: "700",
  },
  actionBtnTextActive: {
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 18,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },
  moreList: { gap: 0 },
});
