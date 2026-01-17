import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../theme";

export default function ProgressRing({ value = 0, label = "goal" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <Text style={styles.big}>{pct}%</Text>
          <Text style={styles.small}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ringOuter: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: THEME.primarySoft2,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 70,
    height: 70,
    borderRadius: 999,
    borderWidth: 6,
    borderColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  big: { fontSize: 16, fontWeight: "900", color: THEME.text },
  small: { marginTop: 2, fontSize: 11, fontWeight: "800", color: THEME.subtext },
});
