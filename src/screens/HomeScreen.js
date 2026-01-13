import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getHabits, getCategories, deleteHabit } from "../services/api";

export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [habitData, catData] = await Promise.all([getHabits(), getCategories()]);
      setHabits(habitData);
      setCategories(catData);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const filteredHabits =
    selectedCat === "all"
      ? habits
      : habits.filter((h) => String(h.category_id) === String(selectedCat));

  // Dashboard stats
  const total = habits.length;

  const weekCount = (() => {
    const now = new Date();
    const diffDays = (d) => Math.floor((now - new Date(d)) / (1000 * 60 * 60 * 24));
    return habits.filter((h) => diffDays(h.date) <= 6).length; // last 7 days
  })();

  const topCategory = (() => {
    if (!habits.length) return "-";
    const count = {};
    habits.forEach((h) => {
      const key = h.category_name || String(h.category_id);
      count[key] = (count[key] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const onDelete = (id) => {
    Alert.alert("Delete habit?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(id);
            loadAll();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Dashboard */}
      <View style={styles.dashboard}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Logged</Text>
            <Text style={styles.statValue}>{total}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>{weekCount}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Top Category</Text>
            <Text style={styles.statValue}>{topCategory}</Text>
          </View>

          <Pressable style={styles.addBtn} onPress={() => navigation.navigate("AddHabit")}>
            <Text style={styles.addBtnText}>+ Add Habit</Text>
          </Pressable>
        </View>
      </View>

      {/* Category Filter */}
      <Text style={styles.sectionTitle}>Filter by Category</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.chip, selectedCat === "all" && styles.chipActive]}
          onPress={() => setSelectedCat("all")}
        >
          <Text style={styles.chipText}>All</Text>
        </Pressable>

        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, selectedCat === String(c.id) && styles.chipActive]}
            onPress={() => setSelectedCat(String(c.id))}
          >
            <Text style={styles.chipText}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <Text style={styles.sectionTitle}>Recent Habits</Text>

      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={loadAll}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.habitItem}
            onPress={() => navigation.navigate("EditHabit", { habit: item })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.habitTitle}>{item.title}</Text>
              <Text style={styles.habitMeta}>
                {(item.category_name || "Category")} • {item.date}
              </Text>
            </View>

            <Pressable onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ opacity: 0.6, marginTop: 12 }}>
            No habits yet. Tap “Add Habit” to start.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  dashboard: { gap: 12, marginBottom: 14 },
  statRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: { opacity: 0.7, fontWeight: "700" },
  statValue: { fontSize: 22, fontWeight: "900", marginTop: 8 },

  addBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontWeight: "900" },

  sectionTitle: { marginTop: 10, marginBottom: 8, fontSize: 16, fontWeight: "900" },

  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { opacity: 0.85 },
  chipText: { fontWeight: "800" },

  habitItem: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 10,
  },
  habitTitle: { fontSize: 15, fontWeight: "900" },
  habitMeta: { marginTop: 4, opacity: 0.7 },

  deleteBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  deleteText: { fontWeight: "900" },
});
