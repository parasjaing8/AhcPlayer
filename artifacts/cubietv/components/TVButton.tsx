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

export function TVButton({ label, onPress, variant = "primary", icon, style }: TVButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0)).current;

  const highlight = (on: boolean) => {
    Animated.spring(scale, { toValue: on ? 1.06 : 1, useNativeDriver: false, speed: 40 }).start();
    Animated.timing(borderOpacity, { toValue: on ? 1 : 0, duration: 120, useNativeDriver: false }).start();
  };

  const bg =
    variant === "primary" ? colors.primary :
    variant === "secondary" ? colors.surfaceVariant :
    "transparent";

  const baseBorderColor = variant === "ghost" ? "rgba(255,255,255,0.35)" : "transparent";

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => highlight(true)}
      onBlur={() => highlight(false)}
      onPressIn={() => highlight(true)}
      onPressOut={() => highlight(false)}
      isTVSelectable
    >
      <Animated.View
        style={[
          styles.btn,
          {
            backgroundColor: bg,
            borderColor: borderOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [baseBorderColor, colors.focusHighlight],
            }),
            transform: [{ scale }],
          },
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
    borderWidth: 1.5,
  },
  label: { color: colors.foreground, fontSize: 15, fontWeight: "600", letterSpacing: 0.3 },
  labelGhost: { color: "rgba(255,255,255,0.85)" },
});
