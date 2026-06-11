import React, { useCallback, useEffect, useRef, useState } from "react";
import {
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

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const item = FAKE_MEDIA.find((m) => m.id === id) ?? FAKE_MEDIA[0];

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [playing, setPlaying] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showOverlay = useCallback(() => {
    setOverlayVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOverlayVisible(false), 4000);
  }, []);

  useEffect(() => {
    showOverlay();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  // D-pad / remote control: any directional key shows overlay; select toggles play/pause
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

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <Pressable style={styles.root} onPress={showOverlay}>
      <View style={styles.videoSurface} />

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
        title={item.title}
        visible={overlayVisible}
        playing={playing}
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
