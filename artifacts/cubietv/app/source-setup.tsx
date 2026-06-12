import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { useSources, type SourceType } from "@/hooks/useSources";

type TestStatus = "idle" | "testing" | "success" | "fail";

const SOURCE_TYPES: { type: SourceType; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { type: "smb", label: "SMB / Windows Share", icon: "monitor" },
  { type: "ftp", label: "FTP", icon: "server" },
  { type: "http", label: "HTTP / Web", icon: "globe" },
  { type: "dlna", label: "DLNA / UPnP", icon: "radio" },
];

export default function SourceSetupScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { editId } = useLocalSearchParams<{ editId?: string }>();

  const [sourceType, setSourceType] = useState<SourceType>("smb");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("192.168.1.100");
  const [shareName, setShareName] = useState("Media");
  const [username, setUsername] = useState("guest");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [saving, setSaving] = useState(false);
  const { sources, addSource, updateSource } = useSources();

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (editId) {
      const s = sources.find((x) => x.id === editId);
      if (s) {
        setSourceType(s.type);
        setName(s.name);
        setAddress(s.address);
        setShareName(s.shareName);
        setUsername(s.username ?? "");
        setPassword(s.password ?? "");
      }
    }
  }, [editId, sources]);

  const scanNetwork = () => {
    setScanning(true);
    setFoundServers([]);
    setTimeout(() => {
      setFoundServers([
        "AiHomeCloud (192.168.1.42) — Samba · 2 shares",
        "DESKTOP-PC (192.168.1.10) — Samba · 1 share",
        "NAS-Box (192.168.1.20) — DLNA · 312 items",
      ]);
      setScanning(false);
    }, 2000);
  };

  const testConnection = () => {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(address.startsWith("192") || address.startsWith("http") ? "success" : "fail");
    }, 1500);
  };

  const save = async () => {
    setSaving(true);
    const data = {
      name: name || shareName || address,
      type: sourceType,
      address,
      shareName,
      username,
      password,
    };
    if (editId) {
      await updateSource(editId, data);
    } else {
      await addSource(data);
    }
    setSaving(false);
    router.replace("/settings");
  };

  const needsShare = sourceType === "smb" || sourceType === "ftp";
  const needsAuth = sourceType === "smb" || sourceType === "ftp";

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <FocusBtn style={styles.backBtn} onPress={() => router.back()} preferFocus>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </FocusBtn>
        <Text style={styles.heading}>{editId ? "Edit Source" : "Add Media Source"}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel label="Source Type" />
        <View style={styles.typeGrid}>
          {SOURCE_TYPES.map(({ type, label, icon }) => (
            <TypeToggle
              key={type}
              icon={icon}
              label={label}
              selected={sourceType === type}
              onPress={() => setSourceType(type)}
            />
          ))}
        </View>

        <SectionLabel label="Details" />
        <FocusField label="Display Name" value={name} onChangeText={setName} placeholder={shareName || address} />
        <FocusField label="Server Address" value={address} onChangeText={setAddress} placeholder={sourceType === "http" ? "http://192.168.1.100" : "192.168.1.100"} />
        {needsShare && (
          <FocusField label="Share / Path" value={shareName} onChangeText={setShareName} placeholder="Media" />
        )}
        {needsAuth && (
          <>
            <FocusField label="Username" value={username} onChangeText={setUsername} placeholder="guest" />
            <FocusField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          </>
        )}

        {(sourceType === "smb" || sourceType === "dlna") && (
          <>
            <SectionLabel label="Auto-Discover" />
            <FocusBtn style={styles.scanBtn} onPress={scanNetwork}>
              {scanning ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <Feather name="wifi" size={16} color={colors.foreground} />
              )}
              <Text style={styles.scanBtnText}>{scanning ? "Scanning..." : "Scan Network"}</Text>
            </FocusBtn>

            {foundServers.length > 0 && (
              <View style={styles.serverList}>
                {foundServers.map((s, i) => (
                  <FocusBtn
                    key={i}
                    style={styles.serverRow}
                    onPress={() => {
                      const ip = s.match(/(\d+\.\d+\.\d+\.\d+)/)?.[1] ?? "";
                      setAddress(ip);
                      setSourceType(s.includes("DLNA") ? "dlna" : "smb");
                    }}
                  >
                    <Feather name={s.includes("DLNA") ? "radio" : "monitor"} size={16} color={colors.muted} />
                    <Text style={styles.serverText}>{s}</Text>
                  </FocusBtn>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.actionRow}>
          <FocusBtn style={styles.secondaryBtn} onPress={testConnection}>
            {testStatus === "testing" ? (
              <ActivityIndicator size="small" color={colors.foreground} />
            ) : (
              <>
                <Feather
                  name={testStatus === "success" ? "check-circle" : testStatus === "fail" ? "x-circle" : "zap"}
                  size={16}
                  color={testStatus === "success" ? "#22c55e" : testStatus === "fail" ? colors.primary : colors.foreground}
                />
                <Text style={[
                  styles.secondaryBtnText,
                  testStatus === "success" && { color: "#22c55e" },
                  testStatus === "fail" && { color: colors.primary },
                ]}>
                  {testStatus === "success" ? "Connected" : testStatus === "fail" ? "Failed" : "Test Connection"}
                </Text>
              </>
            )}
          </FocusBtn>

          <FocusBtn style={styles.saveBtn} onPress={save}>
            {saving ? <ActivityIndicator size="small" color="#000" /> : <Feather name="save" size={16} color="#000" />}
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Source"}</Text>
          </FocusBtn>
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
        borderColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [StyleSheet.flatten(style)?.borderColor ?? colors.border, colors.focusHighlight] }),
        transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }],
      }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function FocusField({
  label, value, onChangeText, placeholder, secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

function TypeToggle({
  icon, label, selected, onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
    >
      <Animated.View style={[
        styles.typeBtn,
        selected && styles.typeBtnSelected,
        {
          borderColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [selected ? colors.primary : colors.border, colors.focusHighlight],
          }),
        },
      ]}>
        <Feather name={icon} size={16} color={selected ? colors.primary : colors.muted} />
        <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>{label}</Text>
        {selected && <Feather name="check" size={14} color={colors.primary} style={{ marginLeft: "auto" }} />}
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
  sectionLabel: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionLabelText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  typeGrid: {
    paddingHorizontal: 18,
    gap: 8,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(229,9,20,0.1)",
  },
  typeLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "500",
  },
  typeLabelSelected: {
    color: colors.foreground,
  },
  field: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: colors.surface,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden",
  },
  inputWrapperFocused: {
    borderColor: colors.focusHighlight,
  },
  input: {
    color: colors.foreground,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 18,
    padding: 14,
    borderRadius: colors.radius,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  scanBtnText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  serverList: {
    marginHorizontal: 18,
    marginTop: 10,
    borderRadius: colors.radius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  serverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  serverText: {
    color: colors.foreground,
    fontSize: 13,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    marginTop: 24,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: colors.radius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: colors.radius,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
  },
  saveBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
});
