import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import colors from "@/constants/colors";
import { MediaCard } from "./MediaCard";
import { WideMediaCard } from "./WideMediaCard";
import type { MediaItem } from "@/data/fakeData";

interface SectionRowProps {
  title: string;
  data: MediaItem[];
  wide?: boolean;
}

export function SectionRow({ title, data, wide = false }: SectionRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={data.length > 0}
        renderItem={({ item, index }) =>
          wide
            ? <WideMediaCard item={item} preferFocus={index === 0} />
            : <MediaCard item={item} preferFocus={index === 0} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  title: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 16,
    letterSpacing: 0.2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
