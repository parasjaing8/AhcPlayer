import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { PlayerSettingsOverlay, type SettingsTab } from "./PlayerSettingsOverlay";

interface PlayerOverlayProps {
  title: string;
  visible: boolean;
  playing?: boolean;
  onTogglePlay?: () => void;
  onClose: () => void;
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const TOTAL = 7120; // 1h 58m 40s

export function PlayerOverlay({ title, visible, playing: playingProp, onTogglePlay, onClose }: PlayerOverlayProps) {
  const [playing, setPlaying] = useState(playingProp ?? true);
  const [position, setPosition] = useState(2533);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("audio");
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [visible]);

  // Sync play state from parent (TV remote fires into PlayerScreen, not this overlay)
  useEffect(() => {
    if (playingProp !== undefined) setPlaying(playingProp);
  }, [playingProp]);

  const seek = (delta: number) => {
    setPosition((p) => Math.max(0, Math.min(TOTAL, p + delta)));
  };

  const pct = position / TOTAL;

  return (
    <Animated.View
      style={[styles.overlay, { opacity, pointerEvents: visible ? "box-none" : "none" }]}
    >
      <View style={styles.topBar}>
        <Text style={styles.titleText}>{title}</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.seekRow}>
        <View style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${pct * 100}%` }]} />
          <View style={[styles.thumb, { left: `${pct * 100}%` as any }]} />
        </View>
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(TOTAL)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.ctrlBtn} onPress={() => seek(-10)}>
          <Feather name="rotate-ccw" size={20} color="#fff" />
          <Text style={styles.skipLabel}>10</Text>
        </Pressable>

        <Pressable
          style={styles.playPauseBtn}
          isTVSelectable
          hasTVPreferredFocus
          onPress={() => { setPlaying((p) => !p); onTogglePlay?.(); }}
        >
          <Feather
            name={playing ? "pause" : "play"}
            size={26}
            color="#000"
          />
        </Pressable>

        <Pressable style={styles.ctrlBtn} onPress={() => seek(10)}>
          <Feather name="rotate-cw" size={20} color="#fff" />
          <Text style={styles.skipLabel}>10</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          style={styles.trackBtn}
          onPress={() => { setSettingsTab("audio"); setSettingsVisible(true); }}
          isTVSelectable
        >
          <Feather name="volume-2" size={16} color={colors.muted} />
          <Text style={styles.trackBtnText}>Audio</Text>
        </Pressable>

        <Pressable
          style={styles.trackBtn}
          onPress={() => { setSettingsTab("subs"); setSettingsVisible(true); }}
          isTVSelectable
        >
          <Feather name="type" size={16} color={colors.muted} />
          <Text style={styles.trackBtnText}>Subs</Text>
        </Pressable>
      </View>

      <PlayerSettingsOverlay
        visible={settingsVisible}
        initialTab={settingsTab}
        onClose={() => setSettingsVisible(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.88)",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 14,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  closeBtn: {
    padding: 6,
  },
  seekRow: {
    gap: 8,
  },
  trackBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 2,
    overflow: "visible",
  },
  trackFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    marginLeft: -7,
  },
  timeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ctrlBtn: {
    alignItems: "center",
    position: "relative",
  },
  skipLabel: {
    position: "absolute",
    bottom: -2,
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  playPauseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: { flex: 1 },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  trackBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
  },
});
