import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  findNodeHandle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { SectionRow } from "@/components/SectionRow";
import { SidebarOverlay } from "@/components/SidebarOverlay";
import {
  CONTINUE_WATCHING,
  FEATURED,
  MOVIES,
  RECENTLY_ADDED,
  SHOWS,
  type MediaItem,
} from "@/data/fakeData";

type FilterId = "all" | "movies" | "series";

const RAIL_W = 72;

interface NavItem {
  id: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  filter?: FilterId;
  action?: "personal" | "search" | "sidebar" | "settings";
}

const NAV_ITEMS: NavItem[] = [
  { id: "all",      icon: "grid",        label: "Home",     filter: "all" },
  { id: "movies",   icon: "film",        label: "Movies",   filter: "movies" },
  { id: "series",   icon: "tv",          label: "Series",   filter: "series" },
  { id: "personal", icon: "user",        label: "Personal", action: "personal" },
  { id: "search",   icon: "search",      label: "Search",   action: "search" },
  { id: "sources",  icon: "hard-drive",  label: "Sources",  action: "sidebar" },
  { id: "settings", icon: "settings",    label: "Settings", action: "settings" },
];

interface NavBtnProps {
  nav: NavItem;
  isActive: boolean;
  onNav: (nav: NavItem) => void;
}

function NavBtn({ nav, isActive, onNav }: NavBtnProps) {
  const focusAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () =>
    Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 50, bounciness: 0 }).start();
  const onBlur = () =>
    Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 50, bounciness: 0 }).start();

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isActive ? "rgba(229,9,20,0.10)" : "transparent", "rgba(255,255,255,0.28)"],
  });
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isActive ? colors.primary : "transparent", colors.focusHighlight],
  });
  const iconScale = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <Pressable onFocus={onFocus} onBlur={onBlur} onPress={() => onNav(nav)} isTVSelectable focusable style={styles.navBtnOuter}>
      <Animated.View style={[styles.navBtn, { backgroundColor: bgColor, borderLeftColor: borderColor }]}>
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Feather name={nav.icon} size={20} color={isActive ? colors.primary : "#fff"} />
        </Animated.View>
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{nav.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const [activeNav, setActiveNav] = useState<string>("all");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [heroItem, setHeroItem] = useState<MediaItem>(FEATURED[0]);
  const heroColorAnim = useRef(new Animated.Value(0)).current;
  const heroPrevColor = useRef(FEATURED[0].backdropColor);
  const heroNextColor = useRef(FEATURED[0].backdropColor);
  const playBtnRef = useRef<any>(null);
  const infoBtnRef = useRef<any>(null);
  const firstCardRef = useRef<any>(null);

  const filter = (NAV_ITEMS.find((n) => n.id === activeNav)?.filter) ?? "all";

  useEffect(() => {
    const t = setTimeout(() => {
      const handle = findNodeHandle(firstCardRef.current);
      if (handle) {
        playBtnRef.current?.setNativeProps({ nextFocusDown: handle });
        infoBtnRef.current?.setNativeProps({ nextFocusDown: handle });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [filter]);

  const onItemFocus = (item: MediaItem) => {
    if (item.id === heroItem.id) return;
    heroPrevColor.current = heroItem.backdropColor;
    heroNextColor.current = item.backdropColor;
    heroColorAnim.setValue(0);
    Animated.timing(heroColorAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    setHeroItem(item);
  };

  const heroBackground = heroColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [heroPrevColor.current, heroNextColor.current],
  });

  const handleNav = (nav: NavItem) => {
    if (nav.action === "search")   { router.push("/search");   return; }
    if (nav.action === "sidebar")  { setSidebarVisible(true);  return; }
    if (nav.action === "settings") { router.push("/settings"); return; }
    if (nav.action === "personal") { router.push("/personal"); return; }
    setActiveNav(nav.id);
  };

  return (
    <View style={styles.root}>
      {/* Left nav rail — absolutely positioned so it shares the same View tree as content,
          letting Android TV's spatial focus algorithm cross between them freely */}
      <View style={styles.rail}>
        <View style={styles.logoMark} focusable={false}>
          <View style={styles.logoPlay} focusable={false} />
        </View>
        <View style={styles.navList}>
          {NAV_ITEMS.map((nav) => (
            <NavBtn key={nav.id} nav={nav} isActive={nav.id === activeNav} onNav={handleNav} />
          ))}
        </View>
      </View>

      {/* Main content — left margin matches rail width */}
      <View style={styles.content}>
        <Animated.View style={[styles.hero, { backgroundColor: heroBackground }]}>
          <View style={styles.heroGradient} />
          <View style={styles.heroMeta}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{heroItem.type}</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>{heroItem.title}</Text>
            <Text style={styles.heroSubtitle}>
              {heroItem.year} · {heroItem.runtime} · {heroItem.rating}
            </Text>
            <Text style={styles.heroGenre}>{heroItem.genre}</Text>
            <Text style={styles.heroSynopsis} numberOfLines={2}>{heroItem.synopsis}</Text>
            <View style={styles.heroButtons}>
              <Pressable
                ref={playBtnRef}
                style={({ focused }) => [styles.playBtn, focused && styles.playBtnFocused]}
                onPress={() => router.push(`/player/${heroItem.id}`)}
                isTVSelectable
                hasTVPreferredFocus
              >
                <Feather name="play" size={14} color="#000" />
                <Text style={styles.playBtnText}>Play</Text>
              </Pressable>
              <Pressable
                ref={infoBtnRef}
                style={({ focused }) => [styles.infoBtn, focused && styles.infoBtnFocused]}
                onPress={() => router.push(`/detail/${heroItem.id}`)}
                isTVSelectable
              >
                <Text style={styles.infoBtnText}>More Info</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filter === "all" && (
            <SectionRow title="Continue Watching" data={CONTINUE_WATCHING} wide onItemFocus={onItemFocus} firstItemRef={firstCardRef} />
          )}
          {filter !== "series" && <SectionRow title="Movies" data={MOVIES} onItemFocus={onItemFocus} firstItemRef={filter === "movies" ? firstCardRef : undefined} />}
          {filter !== "movies" && <SectionRow title="TV Shows" data={SHOWS} onItemFocus={onItemFocus} firstItemRef={filter === "series" ? firstCardRef : undefined} />}
          {filter === "all" && <SectionRow title="Recently Added" data={RECENTLY_ADDED} onItemFocus={onItemFocus} />}
        </ScrollView>
      </View>

      <SidebarOverlay visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, flexDirection: "row" },

  rail: {
    width: RAIL_W,
    backgroundColor: "rgba(10,10,10,0.95)",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoPlay: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: "#fff",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 2,
  },
  navList: { flex: 1, alignItems: "center", width: "100%" },
  navBtnOuter: { width: RAIL_W },
  navBtn: {
    width: RAIL_W,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
    borderLeftWidth: 2,
  },
  navLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  navLabelActive: { color: colors.primary },

  content: { flex: 1 },

  hero: { height: 260, overflow: "hidden" },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,15,15,0.45)" },
  heroMeta: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    padding: 20,
    paddingBottom: 16,
    backgroundColor: "rgba(15,15,15,0.55)",
  },
  heroBadge: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  heroBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.3, marginBottom: 4 },
  heroSubtitle: { color: colors.muted, fontSize: 13, marginBottom: 2 },
  heroGenre: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 6 },
  heroSynopsis: { color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 17, marginBottom: 12 },
  heroButtons: { flexDirection: "row", gap: 10, alignItems: "center" },
  playBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 5, borderWidth: 1.5, borderColor: "transparent",
  },
  playBtnFocused: { borderColor: colors.focusHighlight, transform: [{ scale: 1.04 }] },
  playBtnText: { color: "#000", fontSize: 14, fontWeight: "700" },
  infoBtn: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 5, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)",
  },
  infoBtnFocused: { borderColor: colors.focusHighlight, backgroundColor: "rgba(255,255,255,0.1)" },
  infoBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 40 },
});
