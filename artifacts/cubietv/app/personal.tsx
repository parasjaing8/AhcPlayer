import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";

type AssetSection = { title: string; data: MediaLibrary.Asset[] };

const THUMB_W = 160;
const THUMB_H = 90;
const PAGE_SIZE = 40;

export default function PersonalScreen() {
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission?.granted) loadMedia();
  }, [permission?.granted]);

  const loadMedia = async () => {
    setLoading(true);
    const [v, p] = await Promise.all([
      MediaLibrary.getAssetsAsync({ mediaType: "video", first: PAGE_SIZE, sortBy: "creationTime" }),
      MediaLibrary.getAssetsAsync({ mediaType: "photo", first: PAGE_SIZE, sortBy: "creationTime" }),
    ]);
    setVideos(v.assets);
    setPhotos(p.assets);
    setLoading(false);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Feather name="lock" size={36} color={colors.muted} />
        <Text style={styles.permTitle}>Media Access Required</Text>
        <Text style={styles.permSub}>CubieTV needs permission to show your personal videos and photos.</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission} isTVSelectable hasTVPreferredFocus>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sections: AssetSection[] = [];
  if (videos.length > 0) sections.push({ title: "Videos", data: videos });
  if (photos.length > 0) sections.push({ title: "Photos", data: photos });

  if (sections.length === 0) {
    return (
      <View style={styles.center}>
        <Feather name="inbox" size={36} color={colors.muted} />
        <Text style={styles.permTitle}>No media found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} isTVSelectable hasTVPreferredFocus>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Personal Space</Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(s) => s.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
              data={section.data}
              horizontal
              keyExtractor={(a) => a.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
              renderItem={({ item: asset }) => (
                <AssetThumb asset={asset} isVideo={section.title === "Videos"} />
              )}
            />
          </View>
        )}
      />
    </View>
  );
}

function AssetThumb({ asset, isVideo }: { asset: MediaLibrary.Asset; isVideo: boolean }) {
  return (
    <Pressable
      style={({ focused }) => [styles.thumb, focused && styles.thumbFocused]}
      onPress={() => {
        if (isVideo) {
          router.push({
            pathname: "/player/[id]",
            params: { id: asset.id, url: encodeURIComponent(asset.uri), title: asset.filename },
          });
        }
      }}
      isTVSelectable
      focusable
    >
      <Image source={{ uri: asset.uri }} style={styles.thumbImg} contentFit="cover" />
      {isVideo && (
        <View style={styles.playOverlay}>
          <Feather name="play-circle" size={28} color="rgba(255,255,255,0.9)" />
          <Text style={styles.duration}>{formatDuration(asset.duration ?? 0)}</Text>
        </View>
      )}
      <Text style={styles.thumbLabel} numberOfLines={1}>{asset.filename}</Text>
    </Pressable>
  );
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceVariant,
  },
  headerTitle: { color: colors.foreground, fontSize: 20, fontWeight: "700" },
  content: { paddingVertical: 20, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  row: { paddingHorizontal: 20, gap: 10 },
  thumb: {
    width: THUMB_W,
    borderRadius: colors.radius,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  thumbFocused: {
    borderWidth: 2,
    borderColor: colors.focusHighlight,
    transform: [{ scale: 1.05 }],
  },
  thumbImg: { width: THUMB_W, height: THUMB_H },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: THUMB_H,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  duration: { color: "#fff", fontSize: 11, fontWeight: "600", textShadowColor: "#000", textShadowRadius: 3, textShadowOffset: { width: 0, height: 1 } },
  thumbLabel: { color: colors.muted, fontSize: 11, padding: 6 },
  permTitle: { color: colors.foreground, fontSize: 18, fontWeight: "700", textAlign: "center" },
  permSub: { color: colors.muted, fontSize: 14, textAlign: "center", lineHeight: 20 },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
