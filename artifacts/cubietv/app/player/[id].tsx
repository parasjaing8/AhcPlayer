import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { FAKE_MEDIA } from "@/data/fakeData";
import { PlayerOverlay } from "@/components/PlayerOverlay";
import { useTVRemote } from "@/hooks/useTVRemote";

let VLCPlayer: any = null;
if (Platform.OS === "android") {
  try { VLCPlayer = require("react-native-vlc-media-player").VLCPlayer; } catch {}
}

export default function PlayerScreen() {
  const { id, url: urlParam, title: titleParam, startMs } = useLocalSearchParams<{
    id: string;
    url?: string;
    title?: string;
    startMs?: string;
  }>();
  const insets = useSafeAreaInsets();

  const item = id && id !== "stream" ? FAKE_MEDIA.find((m) => m.id === id) ?? null : null;
  const streamUrl = urlParam
    ? decodeURIComponent(urlParam as string)
    : item?.videoUrl ?? null;
  const mediaTitle = (titleParam as string) ?? item?.title ?? "Now Playing";
  const initialMs = startMs ? parseInt(startMs as string, 10) : 0;

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [positionMs, setPositionMs] = useState(initialMs);
  const [durationMs, setDurationMs] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [seekTarget, setSeekTarget] = useState<number | undefined>(
    initialMs > 0 ? initialMs : undefined
  );
  const [error, setError] = useState<string | null>(null);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerRef = useRef<any>(null);

  const showOverlay = useCallback(() => {
    setOverlayVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOverlayVisible(false), 4000);
  }, []);

  useEffect(() => {
    showOverlay();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  // Back handler
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  useTVRemote(useCallback((evt) => {
    if (evt === "select" || evt === "playPause") {
      setPlaying((p) => !p);
      showOverlay();
    } else if (evt === "back") {
      router.back();
    } else {
      showOverlay();
    }
  }, [showOverlay]));

  const handleSeek = useCallback((deltaSec: number) => {
    const target = Math.max(0, Math.min(durationMs, positionMs + deltaSec * 1000));
    setSeekTarget(target);
    setPositionMs(target);
    showOverlay();
  }, [positionMs, durationMs, showOverlay]);

  const handleSeekAbsolute = useCallback((ms: number) => {
    setSeekTarget(ms);
    setPositionMs(ms);
    showOverlay();
  }, [showOverlay]);

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  return (
    <Pressable
      style={styles.root}
      onPress={showOverlay}
      isTVSelectable
      hasTVPreferredFocus={!overlayVisible}
    >
      {VLCPlayer && streamUrl ? (
        <VLCPlayer
          ref={playerRef}
          source={{
            uri: streamUrl,
            hwDecoderEnabled: 1,
            hwDecoderForced: 0,
            networkCachingMs: 1500,
          }}
          style={StyleSheet.absoluteFillObject}
          paused={!playing}
          resizeMode="contain"
          seek={seekTarget}
          onProgress={({ currentTime, duration }: { currentTime: number; duration: number }) => {
            setPositionMs(currentTime);
            if (duration > 0) setDurationMs(duration);
          }}
          onBuffering={({ bufferRate }: { bufferRate: number }) => setBuffering(bufferRate < 100)}
          onPlaying={() => { setBuffering(false); setError(null); }}
          onPaused={() => setBuffering(false)}
          onEnd={() => router.back()}
          onError={(e: any) => {
            setBuffering(false);
            setError("Playback error — check source URL");
          }}
        />
      ) : (
        <View style={styles.videoSurface} />
      )}

      {buffering && !error && (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.center} pointerEvents="none">
          <Feather name="alert-circle" size={36} color={colors.primary} />
        </View>
      )}

      <PlayerOverlay
        title={mediaTitle}
        visible={overlayVisible}
        playing={playing}
        position={streamUrl ? positionMs : undefined}
        duration={streamUrl ? durationMs : undefined}
        onSeek={streamUrl ? handleSeek : undefined}
        onSeekAbsolute={streamUrl ? handleSeekAbsolute : undefined}
        buffering={buffering}
        error={error}
        onTogglePlay={() => { setPlaying((p) => !p); showOverlay(); }}
        onClose={() => setOverlayVisible(false)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  videoSurface: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
