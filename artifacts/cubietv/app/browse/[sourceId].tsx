import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { browseSource, formatSize, isVideoFile, smbUrl, type FileEntry } from "@/services/AhcClient";

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
      const result = await browseSource(source, path);
      setEntries(result);
    } catch (e) {
      setError("Could not load directory.");
    } finally {
      setLoading(false);
    }
  }, [source, path]);

  useEffect(() => { load(); }, [load]);

  const openEntry = (entry: FileEntry) => {
    if (entry.type === "dir") {
      router.push({ pathname: `/browse/${sourceId}`, params: { path: entry.path } });
    } else if (source && isVideoFile(entry)) {
      const url = smbUrl(source, entry.path);
      router.push({
        pathname: `/player/stream`,
        params: { url: encodeURIComponent(url), title: entry.name },
      });
    }
  };

  const breadcrumbs = ["Home", ...path.split("/").filter(Boolean)];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} isTVSelectable>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
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

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
    >
      <View style={[styles.iconWrap, isDir && styles.iconWrapDir]}>
        <Feather
          name={isDir ? "folder" : isVideo ? "film" : "file"}
          size={18}
          color={isDir ? colors.primary : isVideo ? colors.foreground : colors.muted}
        />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
        {entry.size != null && (
          <Text style={styles.rowMeta}>{formatSize(entry.size)}</Text>
        )}
        {entry.ext && !isVideo && entry.type === "file" && (
          <Text style={styles.rowMeta}>{entry.ext.toUpperCase()}</Text>
        )}
      </View>
      <Feather
        name={isDir ? "chevron-right" : isVideo ? "play-circle" : "download"}
        size={18}
        color={isVideo ? colors.primary : colors.muted}
      />
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
    backgroundColor: colors.surface,
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
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.surfaceVariant },
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
