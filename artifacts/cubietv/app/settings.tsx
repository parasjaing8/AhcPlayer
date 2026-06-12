import React, { useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { useSources } from "@/hooks/useSources";
import { useEffect } from "react";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { sources, removeSource } = useSources();
  const [hwDecode, setHwDecode] = useState(true);
  const [cachingMs, setCachingMs] = useState(600);
  const [defaultAudio, setDefaultAudio] = useState("English");
  const [defaultSubs, setDefaultSubs] = useState("Off");

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <FocusBtn
          onPress={() => router.back()}
          preferFocus
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </FocusBtn>
        <Text style={styles.heading}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader label="Sources" />

        {sources.length === 0 && (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No sources saved</Text>
          </View>
        )}

        {sources.map((s) => (
          <View key={s.id} style={styles.settingRow}>
            <View style={styles.sourceInfo}>
              <Feather name="hard-drive" size={16} color={colors.muted} style={{ marginRight: 8 }} />
              <Text style={styles.rowLabel} numberOfLines={1}>{s.name}</Text>
              <Text style={styles.sourceType}>{s.type.toUpperCase()}</Text>
            </View>
            <View style={styles.rowActions}>
              <FocusBtn
                style={styles.actionBtn}
                onPress={() => router.push({ pathname: "/source-setup", params: { editId: s.id } })}
              >
                <Text style={styles.actionBtnText}>Edit</Text>
              </FocusBtn>
              <FocusBtn
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => removeSource(s.id)}
              >
                <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>Remove</Text>
              </FocusBtn>
            </View>
          </View>
        ))}

        <FocusBtn
          style={styles.addSourceBtn}
          onPress={() => router.push("/source-setup")}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={styles.addSourceText}>Add Source</Text>
        </FocusBtn>

        <SectionHeader label="Playback" />

        <SettingRow label="Video Decode">
          <View style={styles.toggleGroup}>
            <ToggleOption label="Hardware" selected={hwDecode} onPress={() => setHwDecode(true)} />
            <ToggleOption label="Software" selected={!hwDecode} onPress={() => setHwDecode(false)} />
          </View>
        </SettingRow>

        <SettingRow label="Network Caching">
          <View style={styles.sliderRow}>
            <FocusBtn
              style={styles.sliderBtn}
              onPress={() => setCachingMs((v) => Math.max(100, v - 100))}
            >
              <Feather name="minus" size={14} color={colors.foreground} />
            </FocusBtn>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((cachingMs - 100) / 1900) * 100}%` as any }]} />
            </View>
            <FocusBtn
              style={styles.sliderBtn}
              onPress={() => setCachingMs((v) => Math.min(2000, v + 100))}
            >
              <Feather name="plus" size={14} color={colors.foreground} />
            </FocusBtn>
            <Text style={styles.sliderValue}>{cachingMs}ms</Text>
          </View>
        </SettingRow>

        <SettingRow label="Default Audio">
          <FocusBtn
            style={styles.dropdownBtn}
            onPress={() => setDefaultAudio((a) => a === "English" ? "French" : a === "French" ? "Japanese" : "English")}
          >
            <Text style={styles.dropdownText}>{defaultAudio}</Text>
            <Feather name="chevron-down" size={14} color={colors.muted} />
          </FocusBtn>
        </SettingRow>

        <SettingRow label="Default Subtitles">
          <FocusBtn
            style={styles.dropdownBtn}
            onPress={() => setDefaultSubs((s) => s === "Off" ? "English" : s === "English" ? "French" : "Off")}
          >
            <Text style={styles.dropdownText}>{defaultSubs}</Text>
            <Feather name="chevron-down" size={14} color={colors.muted} />
          </FocusBtn>
        </SettingRow>

        <SectionHeader label="About" />
        <View style={styles.settingRow}>
          <Text style={styles.rowLabel}>CubieTV v1.0.0</Text>
          <Text style={styles.mutedLabel}>AiHomeCloud</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FocusBtn({
  children, onPress, style, preferFocus,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  preferFocus?: boolean;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
    >
      <Animated.View style={[style, {
        borderWidth: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [StyleSheet.flatten(style)?.borderWidth ?? 0, 2] }),
        borderColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [StyleSheet.flatten(style)?.borderColor ?? colors.border, colors.focusHighlight] }),
        transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
      }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );
}

function SettingRow({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      {label && <Text style={styles.rowLabel}>{label}</Text>}
      {children}
    </View>
  );
}

function ToggleOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
    >
      <Animated.View style={[
        styles.toggleOption,
        selected && styles.toggleOptionSelected,
        {
          borderColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [selected ? colors.primary : colors.border, colors.focusHighlight],
          }),
        },
      ]}>
        <View style={[styles.radio, selected && styles.radioSelected]} />
        <Text style={[styles.toggleLabel, selected && styles.toggleLabelSelected]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptyRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontStyle: "italic",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  sourceInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  sourceType: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginRight: 8,
  },
  mutedLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDanger: {
    borderColor: "rgba(229,9,20,0.4)",
    backgroundColor: "rgba(229,9,20,0.12)",
  },
  actionBtnText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "600",
  },
  actionBtnTextDanger: {
    color: colors.primary,
  },
  addSourceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 18,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: colors.radius,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(229,9,20,0.4)",
    justifyContent: "center",
  },
  addSourceText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  toggleGroup: {
    flexDirection: "row",
    gap: 8,
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(229,9,20,0.12)",
  },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.muted,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  toggleLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  toggleLabelSelected: {
    color: colors.foreground,
  },
  sliderRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sliderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    overflow: "hidden",
  },
  sliderFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sliderValue: {
    color: colors.muted,
    fontSize: 13,
    width: 50,
    textAlign: "right",
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "500",
    minWidth: 70,
  },
});
