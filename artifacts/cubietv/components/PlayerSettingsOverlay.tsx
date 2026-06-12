import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";

export type SettingsTab = "audio" | "subs";

const AUDIO_TRACKS = [
  { id: "1", label: "English", detail: "AC3 5.1" },
  { id: "2", label: "Hindi", detail: "AAC 2.0" },
  { id: "3", label: "Japanese", detail: "DTS 5.1" },
];

const SUB_TRACKS = [
  { id: "0", label: "Off", detail: "" },
  { id: "1", label: "English", detail: "SRT" },
  { id: "2", label: "Hindi", detail: "SRT" },
  { id: "3", label: "French", detail: "ASS" },
];

interface PlayerSettingsOverlayProps {
  visible: boolean;
  initialTab?: SettingsTab;
  onClose: () => void;
}

export function PlayerSettingsOverlay({
  visible,
  initialTab = "audio",
  onClose,
}: PlayerSettingsOverlayProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [selectedAudio, setSelectedAudio] = useState("1");
  const [selectedSub, setSelectedSub] = useState("0");
  const opacity = useRef(new Animated.Value(0)).current;
  const nd = Platform.OS !== "web";

  useEffect(() => {
    if (visible) setTab(initialTab);
  }, [visible, initialTab]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: nd,
    }).start();
  }, [visible]);

  const tracks = tab === "audio" ? AUDIO_TRACKS : SUB_TRACKS;
  const selected = tab === "audio" ? selectedAudio : selectedSub;
  const setSelected = tab === "audio" ? setSelectedAudio : setSelectedSub;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity, pointerEvents: visible ? "box-none" : "none" } as any,
      ]}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.panel}>
        <View style={styles.tabRow}>
          <TabBtn label="Audio" active={tab === "audio"} onPress={() => setTab("audio")} />
          <TabBtn label="Subtitles" active={tab === "subs"} onPress={() => setTab("subs")} />
          <Pressable style={styles.closeBtn} onPress={onClose} isTVSelectable>
            <Feather name="x" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {tracks.map((t, i) => (
            <Pressable
              key={t.id}
              style={[styles.trackRow, t.id === selected && styles.trackRowSelected]}
              onPress={() => setSelected(t.id)}
              isTVSelectable
              hasTVPreferredFocus={i === 0}
            >
              <View style={[styles.radioOuter, t.id === selected && styles.radioOuterSelected]}>
                {t.id === selected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.trackLabel, t.id === selected && styles.trackLabelSelected]}>
                {t.label}
              </Text>
              {t.detail ? <Text style={styles.trackDetail}>{t.detail}</Text> : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

function TabBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress} isTVSelectable>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    backgroundColor: "#1C1C1C",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: "55%",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 32,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  tabActive: { backgroundColor: "rgba(229,9,20,0.15)" },
  tabLabel: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  tabLabelActive: { color: colors.primary },
  closeBtn: { marginLeft: "auto" as any, padding: 6 },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trackRowSelected: { backgroundColor: "rgba(229,9,20,0.08)" },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  trackLabel: { color: colors.muted, fontSize: 15, fontWeight: "500", flex: 1 },
  trackLabelSelected: { color: colors.foreground, fontWeight: "600" },
  trackDetail: {
    color: colors.muted,
    fontSize: 12,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
});
