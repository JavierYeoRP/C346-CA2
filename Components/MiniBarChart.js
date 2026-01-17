import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../theme";

export default function MiniBarChart({ data = [2, 4, 1, 6, 3, 2, 5] }) {
  const max = Math.max(...data, 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {data.map((v, idx) => {
          const h = Math.round((v / max) * 72) + 10;
          return <View key={idx} style={[styles.bar, { height: h }]} />;
        })}
      </View>

      <View style={styles.labels}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <Text key={d} style={styles.day}>
            {d[0]}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 4,
  },
  bar: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    opacity: 0.85,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 4,
  },
  day: { fontSize: 11, fontWeight: "800", color: THEME.subtext },
});
