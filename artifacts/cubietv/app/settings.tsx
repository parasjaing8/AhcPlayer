import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [hwDecode, setHwDecode] = useState(true);
  const [cachingMs, setCachingMs] = useState(600);
  const [defaultAudio, setDefaultAudio] = useState("English");
  const [defaultSubs, setDefaultSubs] = useState("Off");

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.heading}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader label="Sources" />

        <SettingRow>
          <Text style={styles.rowLabel}>My NAS (192.168.1.42)</Text>
          <View style={styles.rowActions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => router.push("/source-setup")}
            >
              <Text style={styles.actionBtnText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionBtnDanger]}>
              <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>
                Remove
              </Text>
            </Pressable>
          </View>
        </SettingRow>

        <Pressable
          style={styles.addSourceBtn}
          onPress={() => router.push("/source-setup")}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={styles.addSourceText}>Add Source</Text>
        </Pressable>

        <SectionHeader label="Playback" />

        <SettingRow label="Video Decode">
          <View style={styles.toggleGroup}>
            <ToggleOption
              label="Hardware"
              selected={hwDecode}
              onPress={() => setHwDecode(true)}
            />
            <ToggleOption
              label="Software"
              selected={!hwDecode}
              onPress={() => setHwDecode(false)}
            />
          </View>
        </SettingRow>

        <SettingRow label="Network Caching">
          <View style={styles.sliderRow}>
            <Pressable
              style={styles.sliderBtn}
              onPress={() => setCachingMs((v) => Math.max(100, v - 100))}
            >
              <Feather name="minus" size={14} color={colors.foreground} />
            </Pressable>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${((cachingMs - 100) / 1900) * 100}%` as any },
                ]}
              />
            </View>
            <Pressable
              style={styles.sliderBtn}
              onPress={() => setCachingMs((v) => Math.min(2000, v + 100))}
            >
              <Feather name="plus" size={14} color={colors.foreground} />
            </Pressable>
            <Text style={styles.sliderValue}>{cachingMs}ms</Text>
          </View>
        </SettingRow>

        <SettingRow label="Default Audio">
          <Pressable
            style={styles.dropdownBtn}
            onPress={() =>
              setDefaultAudio((a) =>
                a === "English" ? "French" : a === "French" ? "Japanese" : "English"
              )
            }
          >
            <Text style={styles.dropdownText}>{defaultAudio}</Text>
            <Feather name="chevron-down" size={14} color={colors.muted} />
          </Pressable>
        </SettingRow>

        <SettingRow label="Default Subtitles">
          <Pressable
            style={styles.dropdownBtn}
            onPress={() =>
              setDefaultSubs((s) =>
                s === "Off" ? "English" : s === "English" ? "French" : "Off"
              )
            }
          >
            <Text style={styles.dropdownText}>{defaultSubs}</Text>
            <Feather name="chevron-down" size={14} color={colors.muted} />
          </Pressable>
        </SettingRow>

        <SectionHeader label="About" />
        <SettingRow>
          <Text style={styles.rowLabel}>CubieTV v1.0.0</Text>
          <Text style={styles.mutedLabel}>UI Scaffold</Text>
        </SettingRow>
        <SettingRow>
          <Text style={styles.rowLabel}>Part of AiHomeCloud</Text>
        </SettingRow>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );
}

function SettingRow({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      {label && <Text style={styles.rowLabel}>{label}</Text>}
      {children}
    </View>
  );
}

function ToggleOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.toggleOption, selected && styles.toggleOptionSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <Text
        style={[
          styles.toggleLabel,
          selected && styles.toggleLabelSelected,
        ]}
      >
        {label}
      </Text>
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
  rowLabel: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
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
