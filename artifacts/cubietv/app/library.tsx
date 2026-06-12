import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SectionRow } from "@/components/SectionRow";
import { SidebarOverlay } from "@/components/SidebarOverlay";
import {
  CONTINUE_WATCHING,
  FEATURED,
  MOVIES,
  RECENTLY_ADDED,
  SHOWS,
} from "@/data/fakeData";

type FilterId = "all" | "movies" | "series";

const FILTER_TABS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "movies", label: "Movies" },
  { id: "series", label: "Series" },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [filter, setFilter] = useState<FilterId>("all");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const showHero = filter === "all";
  const showContinue = filter === "all";
  const showMovies = filter !== "series";
  const showShows = filter !== "movies";
  const showRecent = filter === "all";

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable
          style={styles.menuBtn}
          onPress={() => setSidebarVisible(true)}
          isTVSelectable
        >
          <Feather name="menu" size={20} color={colors.foreground} />
        </Pressable>

        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoPlay} />
          </View>
          <Text style={styles.logoText}>CubieTV</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push("/search")}
            isTVSelectable
          >
            <Feather name="search" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push("/settings")}
            isTVSelectable
          >
            <Feather name="settings" size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Category tabs */}
      <View style={styles.tabBar}>
        {FILTER_TABS.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.tab, filter === t.id && styles.tabActive]}
            onPress={() => setFilter(t.id)}
            isTVSelectable
          >
            <Text style={[styles.tabLabel, filter === t.id && styles.tabLabelActive]}>
              {t.label}
            </Text>
            {filter === t.id && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      >
        {showHero && <HeroCarousel items={FEATURED} />}
        {showContinue && <SectionRow title="Continue Watching" data={CONTINUE_WATCHING} wide />}
        {showMovies && <SectionRow title="Movies" data={MOVIES} />}
        {showShows && <SectionRow title="TV Shows" data={SHOWS} />}
        {showRecent && <SectionRow title="Recently Added" data={RECENTLY_ADDED} />}
      </ScrollView>

      <SidebarOverlay
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "rgba(15,15,15,0.95)",
    gap: 10,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlay: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: "#fff",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 2,
  },
  logoText: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: { padding: 8, borderRadius: 8 },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 4,
    backgroundColor: "rgba(15,15,15,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "rgba(229,9,20,0.12)" },
  tabLabel: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  tabLabelActive: { color: colors.primary },
  tabUnderline: {
    position: "absolute",
    bottom: 4,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  scroll: { flex: 1 },
});
