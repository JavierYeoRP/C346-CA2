import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const BASE_URL = "https://habit-tracker-app-y1zf.onrender.com";

// ✅ Theme (Green Plan vibe)
const THEME = {
  bg: "#F4FBF7",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#64748B",
  border: "#E2E8F0",
  primary: "#16A34A",
  primarySoft: "#DCFCE7",
  danger: "#DC2626",
  chip: "#F1F5F9",
  shadow: "#000000",
};

export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [habRes, catRes] = await Promise.all([
        fetch(`${BASE_URL}/habits`),
        fetch(`${BASE_URL}/categories`),
      ]);

      const habData = await habRes.json();
      const catData = await catRes.json();

      setHabits(Array.isArray(habData) ? habData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const filteredHabits = useMemo(() => {
    if (selectedCat === "all") return habits;
    return habits.filter((h) => String(h.category_id) === String(selectedCat));
  }, [habits, selectedCat]);

  const total = habits.length;

  const weekCount = useMemo(() => {
    const now = new Date();
    const diffDays = (d) => Math.floor((now - new Date(d)) / (1000 * 60 * 60 * 24));
    return habits.filter((h) => diffDays(h.date) >= 0 && diffDays(h.date) <= 6).length;
  }, [habits]);

  const topCategory = useMemo(() => {
    if (!habits.length) return "-";
    const count = {};
    habits.forEach((h) => {
      const key = h.category_name || String(h.category_id);
      count[key] = (count[key] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  }, [habits]);

  const confirmDelete = (id) => {
    Alert.alert("Delete habit?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(id),
      },
    ]);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/habits/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return Alert.alert("Error", data?.message || "Delete failed");
      loadAll();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to delete habit.");
    }
  };

  const StatCard = ({ label, value }) => (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const Chip = ({ label, active, onPress }) => (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      android_ripple={{ color: "#00000010" }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );

  const HabitItem = ({ item }) => (
    <Pressable
      style={styles.habitCard}
      onPress={() => navigation.navigate("EditHabit", { habit: item })}
      android_ripple={{ color: "#00000010" }}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.habitTopRow}>
          <Text style={styles.habitTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category_name}</Text>
          </View>
        </View>

        <Text style={styles.habitMeta}>{formatDate(item.date)}</Text>
        {item.notes ? <Text style={styles.habitNotes} numberOfLines={2}>{item.notes}</Text> : null}
      </View>

      <Pressable onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Green Habits</Text>
          <Text style={styles.h2}>Track sustainable actions aligned with SG Green Plan.</Text>
        </View>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("AddHabit")}>
          <Text style={styles.primaryBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Dashboard */}
      <View style={styles.dashboard}>
        <StatCard label="Total Logged" value={total} />
        <StatCard label="This Week" value={weekCount} />
        <StatCard label="Top Category" value={topCategory} />
      </View>

      {/* Filter */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Filter</Text>
        {loading ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator size="small" />
            <Text style={{ marginLeft: 8, color: THEME.subtext }}>Syncing…</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        <Chip label="All" active={selectedCat === "all"} onPress={() => setSelectedCat("all")} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            active={selectedCat === String(c.id)}
            onPress={() => setSelectedCat(String(c.id))}
          />
        ))}
      </View>

      {/* List */}
      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Recent Habits</Text>

      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={loadAll}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 10 }}
        renderItem={({ item }) => <HabitItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              Start by adding one sustainable action — it can be small.
            </Text>
            <Pressable style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => navigation.navigate("AddHabit")}>
              <Text style={styles.primaryBtnText}>Add your first habit</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

function formatDate(isoDate) {
  // isoDate = "2026-01-13"
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 16, paddingTop: 14 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  h1: { fontSize: 22, fontWeight: "900", color: THEME.text },
  h2: { marginTop: 2, color: THEME.subtext, fontWeight: "600", maxWidth: 240 },

  primaryBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: THEME.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  dashboard: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: THEME.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  statLabel: { color: THEME.subtext, fontWeight: "800", fontSize: 12 },
  statValue: { marginTop: 8, fontSize: 18, fontWeight: "900", color: THEME.text },

  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: THEME.text },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    backgroundColor: THEME.chip,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: THEME.primarySoft, borderColor: "#86EFAC" },
  chipText: { fontWeight: "800", color: THEME.subtext },
  chipTextActive: { color: "#166534" },

  habitCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: THEME.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  habitTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  habitTitle: { fontSize: 15, fontWeight: "900", color: THEME.text, flex: 1 },
  habitMeta: { marginTop: 6, color: THEME.subtext, fontWeight: "700" },
  habitNotes: { marginTop: 6, color: THEME.subtext, fontWeight: "600" },

  badge: { backgroundColor: THEME.primarySoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#166534", fontWeight: "900", fontSize: 12 },

  deleteBtn: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteText: { color: THEME.danger, fontWeight: "900" },

  emptyWrap: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: THEME.text },
  emptyText: { marginTop: 6, color: THEME.subtext, fontWeight: "600", lineHeight: 18 },
});
