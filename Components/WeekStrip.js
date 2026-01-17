import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../theme";

export default function WeekStrip({ selectedIndex = 3 }) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const nums = ["07", "08", "09", "10", "11", "12", "13"];

  return (
    <View style={styles.wrap}>
      <Text style={styles.month}>This Week</Text>
      <View style={styles.row}>
        {days.map((d, idx) => {
          const active = idx === selectedIndex;
          return (
            <View key={idx} style={styles.cell}>
              <Text style={styles.day}>{d}</Text>
              <View style={[styles.numWrap, active && styles.numActive]}>
                <Text style={[styles.num, active && styles.numTextActive]}>{nums[idx]}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  month: { fontWeight: "900", color: THEME.text, marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cell: { alignItems: "center", width: 40 },
  day: { fontSize: 11, fontWeight: "800", color: THEME.subtext, marginBottom: 8 },
  numWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  numActive: {
    backgroundColor: THEME.primarySoft,
    borderColor: "#86EFAC",
  },
  num: { fontWeight: "900", color: THEME.text, fontSize: 12 },
  numTextActive: { color: "#166534" },
});
