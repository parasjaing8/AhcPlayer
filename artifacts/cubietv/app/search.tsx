import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  FlatList,
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
import { FAKE_MEDIA } from "@/data/fakeData";
import { MediaCard } from "@/components/MediaCard";

const KEYS = [
  ["Q","W","E","R","T","Y","U","I","O","P","⌫"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M",".","-","SPACE"],
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const results = query.length > 0
    ? FAKE_MEDIA.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genre.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  const onKey = (key: string) => {
    if (key === "⌫") {
      setQuery((q) => q.slice(0, -1));
    } else if (key === "SPACE") {
      setQuery((q) => q + " ");
    } else {
      setQuery((q) => q + key);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <BackBtn onPress={() => router.back()} />
        <View style={styles.inputRow}>
          <Feather name="search" size={16} color={colors.muted} />
          <Text style={styles.queryText}>
            {query.length > 0 ? query : ""}
            <Text style={styles.cursor}>|</Text>
          </Text>
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} isTVSelectable>
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.keyboard}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ki) => (
                <Key
                  key={key}
                  label={key}
                  onPress={() => onKey(key)}
                  preferFocus={ri === 0 && ki === 0}
                />
              ))}
            </View>
          ))}
        </View>

        {results.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsHeader}>
              {results.length} Result{results.length !== 1 ? "s" : ""}
            </Text>
            <FlatList
              data={results}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              scrollEnabled={results.length > 0}
              renderItem={({ item }) => <MediaCard item={item} />}
            />
          </View>
        )}

        {query.length > 0 && results.length === 0 && (
          <View style={styles.noResults}>
            <Feather name="film" size={32} color={colors.muted} />
            <Text style={styles.noResultsText}>No results for "{query}"</Text>
          </View>
        )}

        {query.length === 0 && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Start typing to search your library</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function BackBtn({ onPress }: { onPress: () => void }) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
    >
      <Animated.View style={[styles.backBtn, {
        backgroundColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.surface, colors.focusHighlight] }),
      }]}>
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </Animated.View>
    </Pressable>
  );
}

function Key({ label, onPress, preferFocus }: { label: string; onPress: () => void; preferFocus?: boolean }) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onFocus={() => Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onBlur={() => Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, speed: 60, bounciness: 0 }).start()}
      onPress={onPress}
      isTVSelectable
      hasTVPreferredFocus={preferFocus}
    >
      <Animated.View style={[
        styles.key,
        label === "SPACE" && styles.keySpace,
        label === "⌫" && styles.keyDelete,
        {
          backgroundColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceVariant, colors.primary] }),
          borderColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] }),
          transform: [{ scale: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
        },
      ]}>
        <Text style={styles.keyLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: colors.radius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  queryText: {
    flex: 1,
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "500",
  },
  cursor: {
    color: colors.primary,
    fontWeight: "400",
  },
  scroll: { flex: 1 },
  keyboard: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 8,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  key: {
    minWidth: 34,
    height: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  keySpace: {
    minWidth: 120,
  },
  keyDelete: {
    minWidth: 52,
  },
  keyLabel: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  results: { paddingTop: 4 },
  resultsHeader: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  resultsList: { paddingHorizontal: 16 },
  noResults: {
    alignItems: "center",
    gap: 10,
    paddingTop: 32,
  },
  noResultsText: {
    color: colors.muted,
    fontSize: 14,
  },
  hint: {
    alignItems: "center",
    paddingTop: 28,
  },
  hintText: {
    color: colors.muted,
    fontSize: 14,
  },
});
