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

interface PlayerOverlayProps {
  title: string;
  visible: boolean;
  playing?: boolean;
  onTogglePlay?: () => void;
  onClose: () => void;
  position?: number;
  duration?: number;
  onSeek?: (deltaSec: number) => void;
  onSeekAbsolute?: (ms: number) => void;
  buffering?: boolean;
  error?: string | null;
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PlayerOverlay({
  title, visible, playing: playingProp = true, onTogglePlay, onClose,
  position: positionMs = 0, duration: durationMs = 0,
  onSeek, onSeekAbsolute, buffering, error,
}: PlayerOverlayProps) {
  const [playing, setPlaying] = useState(playingProp);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [visible]);

  useEffect(() => {
    setPlaying(playingProp);
  }, [playingProp]);

  const positionSec = Math.floor(positionMs / 1000);
  const totalSec = durationMs > 0 ? Math.floor(durationMs / 1000) : 0;
  const pct = totalSec > 0 ? Math.min(1, positionSec / totalSec) : 0;

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={visible ? "box-none" : "none"}
    >
      {/* Title bar */}
      <View style={styles.topBar}>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Progress bar */}
      {totalSec > 0 && (
        <View style={styles.seekRow}>
          <View style={styles.trackBg}>
            <View style={[styles.trackFill, { width: `${pct * 100}%` as any }]} />
            <View style={[styles.thumb, { left: `${pct * 100}%` as any }]} />
          </View>
          <Text style={styles.timeText}>
            {formatTime(positionSec)} / {formatTime(totalSec)}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <CtrlBtn icon="rotate-ccw" label="-30" onPress={() => onSeek?.(-30)} />
        <CtrlBtn icon="rotate-ccw" label="-10" onPress={() => onSeek?.(-10)} />

        <Pressable
          style={styles.playPauseBtn}
          isTVSelectable
          hasTVPreferredFocus={visible}
          onPress={() => { setPlaying((p) => !p); onTogglePlay?.(); }}
        >
          <Feather name={playing ? "pause" : "play"} size={28} color="#000" />
        </Pressable>

        <CtrlBtn icon="rotate-cw" label="+10" onPress={() => onSeek?.(10)} />
        <CtrlBtn icon="rotate-cw" label="+30" onPress={() => onSeek?.(30)} />

        <View style={{ flex: 1 }} />

        <CtrlBtn icon="x" onPress={onClose} />
      </View>
    </Animated.View>
  );
}

function CtrlBtn({ icon, label, onPress }: { icon: any; label?: string; onPress?: () => void }) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
    >
      <Animated.View style={[styles.ctrlBtn, {
        backgroundColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: ["transparent", "rgba(255,255,255,0.2)"] }),
        transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
      }]}>
        <Feather name={icon} size={20} color="#fff" />
        {label && <Text style={styles.skipLabel}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.88)",
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 16,
  },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleText: { color: "#fff", fontSize: 16, fontWeight: "600", flex: 1 },
  errorText: { color: colors.primary, fontSize: 13, fontWeight: "500" },
  seekRow: { gap: 8 },
  trackBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "visible",
  },
  trackFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  thumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    marginLeft: -7,
  },
  timeText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "500", textAlign: "right" },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctrlBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 2,
  },
  skipLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: "700" },
  playPauseBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
});
