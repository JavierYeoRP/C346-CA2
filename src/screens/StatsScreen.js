import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { THEME } from "../../theme";
import Card from "../../Components/Card";
import MiniBarChart from "../../Components/MiniBarChart";

const BASE_URL = "https://habit-tracker-app-y1zf.onrender.com";

export default function StatsScreen() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/habits`);
      const data = await res.json();
      setHabits(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  // Create weekly count array (Mon..Sun)
  const weekBars = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    // make start be Monday
    const day = start.getDay(); // 0 Sun..6 Sat
    const diffToMon = (day + 6) % 7; // Mon=0
    start.setDate(start.getDate() - diffToMon);
    start.setHours(0, 0, 0, 0);

    const counts = [0, 0, 0, 0, 0, 0, 0];

    habits.forEach((h) => {
      const d = new Date(String(h.date).slice(0, 10));
      d.setHours(0, 0, 0, 0);
      const idx = Math.floor((d - start) / (1000 * 60 * 60 * 24));
      if (idx >= 0 && idx <= 6) counts[idx] += 1;
    });

    return counts; // Mon..Sun
  }, [habits]);

  const total = habits.length;

  const topCategory = useMemo(() => {
    if (!habits.length) return "-";
    const map = {};
    habits.forEach((h) => {
      const k = h.category_name || "Other";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  }, [habits]);

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={{ marginLeft: 10, color: THEME.subtext, fontWeight: "800" }}>Loading…</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.bigLabel}>Green Actions Logged</Text>
          <Text style={styles.bigNumber}>{total}</Text>
          <Text style={styles.sub}>Weekly goal: 7 habits</Text>

          <MiniBarChart data={weekBars} />
        </Card>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>Top Category</Text>
            <Text style={styles.smallValue}>{topCategory}</Text>
          </Card>

          <Card style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>This Week</Text>
            <Text style={styles.smallValue}>{weekBars.reduce((a, b) => a + b, 0)}</Text>
          </Card>
        </View>

        <Card style={{ marginTop: 12 }}>
          <Text style={styles.smallLabel}>SG Green Plan Alignment</Text>
          <Text style={styles.pillar}>Sustainable Living</Text>
          <Text style={styles.pillar}>Energy Reset</Text>
          <Text style={styles.pillar}>Green Economy (Behaviour)</Text>

          <Text style={styles.note}>
            Your logged habits build a sustainable mindset through consistent eco-friendly routines.
          </Text>
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 16, paddingTop: 14 },
  loadingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },

  bigLabel: { color: THEME.subtext, fontWeight: "900", fontSize: 12 },
  bigNumber: { marginTop: 8, fontSize: 40, fontWeight: "900", color: THEME.text },
  sub: { marginTop: 2, color: THEME.subtext, fontWeight: "700" },

  smallLabel: { color: THEME.subtext, fontWeight: "900", fontSize: 12 },
  smallValue: { marginTop: 10, fontSize: 18, fontWeight: "900", color: THEME.text },

  pillar: { marginTop: 10, fontWeight: "900", color: THEME.text },
  note: { marginTop: 10, color: THEME.subtext, fontWeight: "600", lineHeight: 18 },
});
