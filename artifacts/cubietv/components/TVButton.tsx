import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import colors from "@/constants/colors";

interface TVButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function TVButton({
  label,
  onPress,
  variant = "primary",
  icon,
  style,
}: TVButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.surfaceVariant
        : "transparent";

  const borderColor =
    variant === "ghost" ? "rgba(255,255,255,0.35)" : "transparent";

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} isTVSelectable>
      <Animated.View
        style={[
          styles.btn,
          { backgroundColor: bg, borderColor, transform: [{ scale }] },
          style,
        ]}
      >
        {icon && <>{icon}</>}
        <Text style={[styles.label, variant === "ghost" && styles.labelGhost]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 6,
    borderWidth: 1,
  },
  label: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  labelGhost: {
    color: "rgba(255,255,255,0.85)",
  },
});
