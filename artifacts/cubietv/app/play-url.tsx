import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

const PRESETS = [
  { label: "Sample MP4", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { label: "Sample HLS", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
];

export default function PlayUrlScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [url, setUrl] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  const play = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    router.push({
      pathname: "/player/stream",
      params: { url: encodeURIComponent(trimmed), title: trimmed },
    });
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <FocusBtn style={styles.backBtn} onPress={() => router.back()} preferFocus>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </FocusBtn>
        <Text style={styles.heading}>Play URL</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Enter a URL to play</Text>
        <View style={[styles.inputWrapper, inputFocused && styles.inputWrapperFocused]}>
          <Feather name="link" size={16} color={colors.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="smb://, ftp://, http://, rtsp://, ..."
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="go"
            onSubmitEditing={play}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          {url.length > 0 && (
            <Pressable onPress={() => setUrl("")} isTVSelectable style={styles.clearBtn}>
              <Feather name="x" size={14} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <FocusBtn
          style={[styles.playBtn, !url.trim() && styles.playBtnDisabled]}
          onPress={play}
        >
          <Feather name="play" size={18} color="#000" />
          <Text style={styles.playBtnText}>Play</Text>
        </FocusBtn>

        <Text style={styles.presetsLabel}>Quick Presets</Text>
        {PRESETS.map((p) => (
          <FocusBtn
            key={p.url}
            style={styles.presetRow}
            onPress={() => setUrl(p.url)}
          >
            <Feather name="film" size={15} color={colors.muted} />
            <Text style={styles.presetLabel}>{p.label}</Text>
            <Text style={styles.presetUrl} numberOfLines={1}>{p.url}</Text>
          </FocusBtn>
        ))}

        <Text style={styles.hint}>
          Supports: SMB (smb://), FTP (ftp://), HTTP/HTTPS, HLS (.m3u8), RTSP, and more
        </Text>
      </View>
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
        transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
      }]}>
        {children}
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: colors.focusHighlight,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
    paddingVertical: 14,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  playBtnDisabled: {
    opacity: 0.4,
  },
  playBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  presetsLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
  },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: colors.radius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetLabel: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    minWidth: 90,
  },
  presetUrl: {
    color: colors.muted,
    fontSize: 12,
    flex: 1,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
