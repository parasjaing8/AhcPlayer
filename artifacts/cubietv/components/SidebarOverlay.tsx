import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { useSources } from "@/hooks/useSources";

interface SidebarOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const SIDEBAR_W = 260;

export function SidebarOverlay({ visible, onClose }: SidebarOverlayProps) {
  const { sources } = useSources();
  const translateX = useRef(new Animated.Value(-SIDEBAR_W)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const nd = Platform.OS !== "web";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: visible ? 0 : -SIDEBAR_W,
        duration: 220,
        useNativeDriver: nd,
      }),
      Animated.timing(backdropOpacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: nd,
      }),
    ]).start();
  }, [visible]);

  return (
    <View
      style={[StyleSheet.absoluteFillObject, styles.root]}
      pointerEvents={visible ? "box-none" : "none"}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Paras</Text>
            <Text style={styles.profileSub}>AiHomeCloud</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Sources</Text>
        <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
          {sources.length === 0 && (
            <Text style={styles.noSources}>No sources saved</Text>
          )}
          {sources.map((s) => (
            <SidebarItem
              key={s.id}
              icon="hard-drive"
              label={s.name}
              onPress={() => { onClose(); router.push({ pathname: `/browse/${s.id}`, params: { path: "" } }); }}
            />
          ))}
        </ScrollView>

        <View style={styles.divider} />

        <SidebarItem
          icon="settings"
          label="Settings"
          onPress={() => { onClose(); router.push("/settings"); }}
        />
        <SidebarItem
          icon="plus-circle"
          label="Add Source"
          onPress={() => { onClose(); router.push("/source-setup"); }}
        />
      </Animated.View>
    </View>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.item, active && styles.itemActive]}
      onPress={onPress}
      isTVSelectable
    >
      <Feather name={icon} size={17} color={active ? colors.primary : colors.muted} />
      <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{label}</Text>
      {active && <Feather name="check" size={14} color={colors.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 50 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_W,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: 48,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  profileName: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
  profileSub: { color: colors.muted, fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  noSources: {
    color: colors.muted,
    fontSize: 13,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontStyle: "italic",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  itemActive: { backgroundColor: "rgba(229,9,20,0.12)" },
  itemLabel: { color: colors.muted, fontSize: 15, fontWeight: "500", flex: 1 },
  itemLabelActive: { color: colors.foreground },
});
