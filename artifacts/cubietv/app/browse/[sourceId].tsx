import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { useSources } from "@/hooks/useSources";
import { browseSource, buildPlayUrl, formatSize, isMediaFile, isVideoFile, type FileEntry } from "@/services/AhcClient";

export default function BrowseScreen() {
  const { sourceId, path = "" } = useLocalSearchParams<{ sourceId: string; path?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { sources } = useSources();

  const source = sources.find((s) => s.id === sourceId);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!source) return;
    setLoading(true);
    setError(null);
    try {
      const result = await browseSource(source, path as string);
      setEntries(result);
    } catch {
      setError("Could not load directory.");
    } finally {
      setLoading(false);
    }
  }, [source, path]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  const openEntry = useCallback((entry: FileEntry) => {
    if (entry.type === "dir") {
      router.push({ pathname: `/browse/${sourceId}`, params: { path: entry.path } });
    } else if (source && isMediaFile(entry)) {
      const url = buildPlayUrl(source, entry.path);
      router.push({
        pathname: `/player/stream`,
        params: { url: encodeURIComponent(url), title: entry.name },
      });
    }
  }, [source, sourceId]);

  const breadcrumbs = ["Home", ...(path as string).split("/").filter(Boolean)];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <BackBtn onPress={() => router.back()} />
        <View style={styles.titleArea}>
          <Text style={styles.sourceName} numberOfLines={1}>
            {source?.name ?? "Browse"}
          </Text>
          <BreadcrumbRow crumbs={breadcrumbs} />
        </View>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Feather name="wifi-off" size={32} color={colors.muted} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={load} isTVSelectable hasTVPreferredFocus>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && entries.length === 0 && (
        <View style={styles.center}>
          <Feather name="folder" size={32} color={colors.muted} />
          <Text style={styles.emptyText}>Empty folder</Text>
        </View>
      )}

      {!loading && !error && entries.length > 0 && (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.path}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <EntryRow
              entry={item}
              onPress={() => openEntry(item)}
              preferFocus={index === 0}
            />
          )}
        />
      )}
    </View>
  );
}

function BackBtn({ onPress }: { onPress: () => void }) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus
    >
      <Animated.View style={[styles.backBtn, {
        backgroundColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.surface, colors.focusHighlight] }),
      }]}>
        <Animated.View style={{ transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] }}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function BreadcrumbRow({ crumbs }: { crumbs: string[] }) {
  return (
    <View style={styles.breadcrumbs}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Feather name="chevron-right" size={11} color={colors.muted} />}
          <Text
            style={[styles.crumb, i === crumbs.length - 1 && styles.crumbActive]}
            numberOfLines={1}
          >
            {c}
          </Text>
        </React.Fragment>
      ))}
    </View>
  );
}

function EntryRow({
  entry,
  onPress,
  preferFocus,
}: {
  entry: FileEntry;
  onPress: () => void;
  preferFocus?: boolean;
}) {
  const isDir = entry.type === "dir";
  const isVideo = isVideoFile(entry);
  const isMedia = isMediaFile(entry);
  const focusAnim = useRef(new Animated.Value(0)).current;

  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
    >
      <Animated.View style={[styles.row, {
        backgroundColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: ["transparent", "rgba(255,255,255,0.08)"] }),
        borderLeftColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: ["transparent", colors.focusHighlight] }),
        borderLeftWidth: 3,
      }]}>
        <View style={[styles.iconWrap, isDir && styles.iconWrapDir]}>
          <Feather
            name={isDir ? "folder" : isVideo ? "film" : isMedia ? "music" : "file"}
            size={18}
            color={isDir ? colors.primary : isMedia ? colors.foreground : colors.muted}
          />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
          {entry.size != null && (
            <Text style={styles.rowMeta}>{formatSize(entry.size)}</Text>
          )}
          {entry.ext && !isMedia && entry.type === "file" && (
            <Text style={styles.rowMeta}>{entry.ext.toUpperCase()}</Text>
          )}
        </View>
        <Feather
          name={isDir ? "chevron-right" : isMedia ? "play-circle" : "download"}
          size={18}
          color={isMedia ? colors.primary : colors.muted}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    marginTop: 2,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: { flex: 1 },
  sourceName: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
  },
  breadcrumbs: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 3,
  },
  crumb: { color: colors.muted, fontSize: 12 },
  crumbActive: { color: colors.foreground, fontWeight: "600" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  errorText: { color: colors.muted, fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 15 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  list: { paddingHorizontal: 0, paddingVertical: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDir: { backgroundColor: "rgba(229,9,20,0.1)" },
  rowInfo: { flex: 1 },
  rowName: { color: colors.foreground, fontSize: 14, fontWeight: "500" },
  rowMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
