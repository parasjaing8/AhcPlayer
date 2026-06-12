import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { FAKE_MEDIA, MOVIES } from "@/data/fakeData";
import { MediaCard } from "@/components/MediaCard";
import { TVButton } from "@/components/TVButton";

const { width: W } = Dimensions.get("window");
const BACKDROP_H = Math.round(W * 0.5);

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const item = FAKE_MEDIA.find((m) => m.id === id) ?? FAKE_MEDIA[0];
  const moreLike = MOVIES.filter((m) => m.id !== item.id).slice(0, 8);

  return (
    <View style={styles.root}>
      <View style={[styles.backdrop, { backgroundColor: item.backdropColor, height: BACKDROP_H }]}>
        <View style={styles.backdropOverlay} />
      </View>

      <Pressable
        style={[styles.backBtn, { top: topPad + 8 }]}
        onPress={() => router.back()}
        isTVSelectable
      >
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </Pressable>

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
            <Pressable
              style={styles.playBtn}
              onPress={() => router.push(`/player/${item.id}`)}
              isTVSelectable
              hasTVPreferredFocus
            >
              <Feather name="play" size={16} color="#000" />
              <Text style={styles.playBtnText}>Play</Text>
            </Pressable>

            {(item.progressPct ?? 0) > 0 && (
              <TVButton
                label={`Resume`}
                variant="secondary"
                icon={<Feather name="play-circle" size={15} color={colors.foreground} />}
                onPress={() => router.push(`/player/${item.id}`)}
              />
            )}

            <TVButton
              label="Watchlist"
              variant="ghost"
              icon={<Feather name="plus" size={15} color="rgba(255,255,255,0.85)" />}
            />
            <TVButton
              label="Watched"
              variant="ghost"
              icon={<Feather name="check" size={15} color="rgba(255,255,255,0.85)" />}
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
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 6,
  },
  playBtnText: { color: "#000", fontSize: 15, fontWeight: "700" },
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
