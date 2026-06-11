import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

type SourceType = "smb" | "dlna";
type TestStatus = "idle" | "testing" | "success" | "fail";

export default function SourceSetupScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [sourceType, setSourceType] = useState<SourceType>("smb");
  const [address, setAddress] = useState("192.168.1.100");
  const [shareName, setShareName] = useState("Media");
  const [username, setUsername] = useState("guest");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");

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
      setTestStatus(address.startsWith("192") ? "success" : "fail");
    }, 1500);
  };

  const save = () => {
    router.replace("/library");
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.heading}>Add Media Source</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel label="Source Type" />
        <View style={styles.typeRow}>
          <TypeToggle
            label="SMB / Windows Share"
            selected={sourceType === "smb"}
            onPress={() => setSourceType("smb")}
          />
          <TypeToggle
            label="DLNA / UPnP"
            selected={sourceType === "dlna"}
            onPress={() => setSourceType("dlna")}
          />
        </View>

        {sourceType === "smb" && (
          <>
            <SectionLabel label="SMB Details" />
            <FormField
              label="Server Address"
              value={address}
              onChangeText={setAddress}
              placeholder="192.168.1.100"
            />
            <FormField
              label="Share Name"
              value={shareName}
              onChangeText={setShareName}
              placeholder="Media"
            />
            <FormField
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="guest"
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </>
        )}

        <SectionLabel label="Auto-Discover" />
        <Pressable style={styles.scanBtn} onPress={scanNetwork}>
          {scanning ? (
            <ActivityIndicator size="small" color={colors.foreground} />
          ) : (
            <Feather name="wifi" size={16} color={colors.foreground} />
          )}
          <Text style={styles.scanBtnText}>
            {scanning ? "Scanning..." : "Scan Network"}
          </Text>
        </Pressable>

        {foundServers.length > 0 && (
          <View style={styles.serverList}>
            {foundServers.map((s, i) => (
              <Pressable
                key={i}
                style={styles.serverRow}
                onPress={() => {
                  const ip = s.match(/(\d+\.\d+\.\d+\.\d+)/)?.[1] ?? "";
                  setAddress(ip);
                  setSourceType(s.includes("DLNA") ? "dlna" : "smb");
                }}
              >
                <Feather
                  name={s.includes("DLNA") ? "radio" : "monitor"}
                  size={16}
                  color={colors.muted}
                />
                <Text style={styles.serverText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryBtn} onPress={testConnection}>
            {testStatus === "testing" ? (
              <ActivityIndicator size="small" color={colors.foreground} />
            ) : (
              <>
                <Feather
                  name={
                    testStatus === "success"
                      ? "check-circle"
                      : testStatus === "fail"
                        ? "x-circle"
                        : "zap"
                  }
                  size={16}
                  color={
                    testStatus === "success"
                      ? "#22c55e"
                      : testStatus === "fail"
                        ? colors.primary
                        : colors.foreground
                  }
                />
                <Text
                  style={[
                    styles.secondaryBtnText,
                    testStatus === "success" && { color: "#22c55e" },
                    testStatus === "fail" && { color: colors.primary },
                  ]}
                >
                  {testStatus === "success"
                    ? "Connected"
                    : testStatus === "fail"
                      ? "Failed"
                      : "Test Connection"}
                </Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.saveBtn} onPress={save}>
            <Feather name="save" size={16} color="#000" />
            <Text style={styles.saveBtnText}>Save Source</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.discoverBtn}
          onPress={() => router.push("/discovery")}
        >
          <Feather name="search" size={14} color={colors.muted} />
          <Text style={styles.discoverBtnText}>Browse Discovered Servers</Text>
        </Pressable>
      </ScrollView>
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

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

function TypeToggle({
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
      style={[styles.typeBtn, selected && styles.typeBtnSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
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
  typeRow: {
    paddingHorizontal: 18,
    gap: 10,
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
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.muted,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
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
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
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
  },
  saveBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  discoverBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: 18,
    marginTop: 12,
  },
  discoverBtnText: {
    color: colors.muted,
    fontSize: 13,
  },
});
