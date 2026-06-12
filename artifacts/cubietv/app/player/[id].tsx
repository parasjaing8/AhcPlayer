import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// VLC is Android-only native module — guard against web/iOS build errors
let VLCPlayer: any = null;
if (Platform.OS === "android") {
  VLCPlayer = require("react-native-vlc-media-player").default;
}

export default function PlayerScreen() {
  const { id, url: urlParam, title: titleParam } = useLocalSearchParams<{
    id: string;
    url?: string;
    title?: string;
  }>();
  const insets = useSafeAreaInsets();

  const streamUrl = urlParam ? decodeURIComponent(urlParam) : null;
  const item = streamUrl ? null : (FAKE_MEDIA.find((m) => m.id === id) ?? FAKE_MEDIA[0]);
  const mediaTitle = titleParam ?? item?.title ?? "Playing";

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [seekTarget, setSeekTarget] = useState<number | undefined>(undefined);

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

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <Pressable style={styles.root} onPress={showOverlay}>
      {/* Video surface */}
      {VLCPlayer && streamUrl ? (
        <VLCPlayer
          ref={playerRef}
          source={{
            uri: streamUrl,
            hwDecoderEnabled: 1,
            networkCachingMs: 1000,
          }}
          style={StyleSheet.absoluteFillObject}
          paused={!playing}
          resizeMode="contain"
          seek={seekTarget}
          onProgress={({ currentTime, duration }: { currentTime: number; duration: number }) => {
            setPositionMs(currentTime);
            if (duration > 0) setDurationMs(duration);
          }}
          onBuffering={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onPaused={() => setBuffering(false)}
          onEnd={() => router.back()}
          onError={() => setBuffering(false)}
        />
      ) : (
        <View style={styles.videoSurface} />
      )}

      {/* Buffering spinner — shown outside overlay so visible when overlay is hidden */}
      {buffering && (
        <View style={styles.bufferWrap} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <Pressable
        style={[styles.backBtn, { top: topPad + 8 }]}
        onPress={() => router.back()}
        isTVSelectable
      >
        <Feather
          name="arrow-left"
          size={20}
          color={overlayVisible ? colors.foreground : "transparent"}
        />
      </Pressable>

      <PlayerOverlay
        title={mediaTitle}
        visible={overlayVisible}
        playing={playing}
        position={streamUrl ? positionMs : undefined}
        duration={streamUrl ? durationMs : undefined}
        onSeek={streamUrl ? handleSeek : undefined}
        buffering={buffering}
        onTogglePlay={() => { setPlaying((p) => !p); showOverlay(); }}
        onClose={() => setOverlayVisible(false)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  bufferWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});
