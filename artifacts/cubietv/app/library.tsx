import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SectionRow } from "@/components/SectionRow";
import {
  CONTINUE_WATCHING,
  FEATURED,
  MOVIES,
  RECENTLY_ADDED,
  SHOWS,
} from "@/data/fakeData";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoPlay} />
          </View>
          <Text style={styles.logoText}>CubieTV</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/search")}>
            <Feather name="search" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/settings")}>
            <Feather name="settings" size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      >
        <HeroCarousel items={FEATURED} />
        <SectionRow title="Continue Watching" data={CONTINUE_WATCHING} wide />
        <SectionRow title="Movies" data={MOVIES} />
        <SectionRow title="TV Shows" data={SHOWS} />
        <SectionRow title="Recently Added" data={RECENTLY_ADDED} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "rgba(15,15,15,0.95)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
  },
  scroll: {
    flex: 1,
  },
});
