import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

interface ServerEntry {
  name: string;
  ip: string;
  protocol: string;
  shares: string;
  icon: "monitor" | "package" | "radio";
}

const FAKE_SERVERS: ServerEntry[] = [
  {
    name: "AiHomeCloud",
    ip: "192.168.1.42",
    protocol: "Samba · minidlna",
    shares: "2 shares",
    icon: "monitor",
  },
  {
    name: "DESKTOP-PC",
    ip: "192.168.1.10",
    protocol: "Samba",
    shares: "1 share",
    icon: "package",
  },
  {
    name: "minidlna@NAS",
    ip: "192.168.1.20",
    protocol: "DLNA",
    shares: "312 items",
    icon: "radio",
  },
];

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [phase, setPhase] = useState<"scanning" | "done">("scanning");
  const [servers, setServers] = useState<ServerEntry[]>([]);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const timer = setTimeout(() => {
      pulse.stop();
      setServers(FAKE_SERVERS);
      setPhase("done");
    }, 2200);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, []);

  const selectServer = (server: ServerEntry) => {
    router.push(`/source-setup?ip=${server.ip}`);
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.heading}>Discovered Servers</Text>
      </View>

      {phase === "scanning" && (
        <View style={styles.scanningState}>
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
          />
          <View style={styles.scanIcon}>
            <Feather name="wifi" size={28} color={colors.foreground} />
          </View>
          <Text style={styles.scanningText}>Scanning your network...</Text>
          <ActivityIndicator
            size="small"
            color={colors.muted}
            style={{ marginTop: 8 }}
          />
        </View>
      )}

      {phase === "done" && (
        <View style={[styles.list, { paddingBottom: bottomPad + 24 }]}>
          {servers.map((server, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.serverCard,
                pressed && styles.serverCardPressed,
              ]}
              onPress={() => selectServer(server)}
            >
              <View style={styles.serverIconWrap}>
                <Feather name={server.icon} size={20} color={colors.muted} />
              </View>
              <View style={styles.serverInfo}>
                <Text style={styles.serverName}>{server.name}</Text>
                <Text style={styles.serverIp}>{server.ip}</Text>
                <Text style={styles.serverMeta}>
                  {server.protocol} · {server.shares}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}

          <Pressable
            style={styles.manualBtn}
            onPress={() => router.push("/source-setup")}
          >
            <Text style={styles.manualBtnText}>Add Manually Instead</Text>
          </Pressable>
        </View>
      )}
    </View>
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
  scanningState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pulseRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(229,9,20,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(229,9,20,0.3)",
  },
  scanIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanningText: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  serverCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: colors.radius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverCardPressed: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.primary,
  },
  serverIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  serverInfo: { flex: 1 },
  serverName: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "700",
  },
  serverIp: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  serverMeta: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginTop: 2,
  },
  manualBtn: {
    alignItems: "center",
    paddingVertical: 18,
    marginTop: 8,
  },
  manualBtnText: {
    color: colors.muted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
