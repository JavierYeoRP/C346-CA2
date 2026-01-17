import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  ImageBackground,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { THEME } from "../../theme";
import Card from "../../Components/Card";
import ProgressRing from "../../Components/ProgressRing";
import HabitRow from "../../Components/HabitRow";
import Chip from "../../Components/Chip";
import WeekStrip from "../../Components/WeekStrip";

const BASE_URL = "https://habit-tracker-app-y1zf.onrender.com";

// ✅ your images (keep your paths)
const LEAVES_BG = require("../screens/assets/greenLeave.jpg");
const HERO_ILLUSTRATION = require("../screens/assets/Person1.png");

// ✅ add this image file for modal illustration:
const DELETE_ILLUS = require("../screens/assets/Delete.png");

export default function DashboardScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  // ✅ modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [hRes, cRes] = await Promise.all([
        fetch(`${BASE_URL}/habits`),
        fetch(`${BASE_URL}/categories`),
      ]);

      const hData = await hRes.json();
      const cData = await cRes.json();

      setHabits(Array.isArray(hData) ? hData : []);
      setCategories(Array.isArray(cData) ? cData : []);
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

  // habits in last 7 days
  const weekCount = useMemo(() => {
    const now = new Date();
    const diffDays = (d) =>
      Math.floor((now - new Date(String(d).slice(0, 10))) / (1000 * 60 * 60 * 24));
    return habits.filter((h) => diffDays(h.date) >= 0 && diffDays(h.date) <= 6).length;
  }, [habits]);

  const weeklyGoal = 7;
  const progress = weeklyGoal ? Math.min(1, weekCount / weeklyGoal) : 0;

  const filteredHabits = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list =
      selectedCat === "all"
        ? habits
        : habits.filter((h) => String(h.category_id) === String(selectedCat));

    if (!q) return list;

    return list.filter((h) => {
      const t = (h.title || "").toLowerCase();
      const n = (h.notes || "").toLowerCase();
      const c = (h.category_name || "").toLowerCase();
      return t.includes(q) || n.includes(q) || c.includes(q);
    });
  }, [habits, selectedCat, query]);

  // ✅ open custom modal instead of Alert
  const confirmDelete = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title || "");
    setDeleteOpen(true);
  };

  // ✅ delete + close modal
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/habits/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleting(false);
        return Alert.alert("Error", data?.message || "Delete failed");
      }

      setDeleteOpen(false);
      setDeleteId(null);
      setDeleteTitle("");
      loadAll();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to delete habit.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ImageBackground source={LEAVES_BG} resizeMode="cover" style={styles.bg}>
      <View style={styles.overlay} />

      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.hi}>Hi, Weijie</Text>
              <Text style={styles.sub}>{weekCount} habits logged this week</Text>
            </View>

          <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate("Statistics")}>
  <Image
    source={require("../screens/assets/avatar.jpg")}
    style={styles.avatarImg}
  />
</Pressable>

          </View>

          {/* Search row */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={THEME.subtext} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search habits..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <Pressable style={styles.filterBtn} onPress={() => navigation.navigate("Statistics")}>
              <Ionicons name="options-outline" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.heroPill}>SG Green Plan 2030</Text>
              <Text style={styles.heroTitle}>Build greener routines</Text>
              <Text style={styles.heroDesc}>
                Weekly goal: {weeklyGoal} habits {"\n"}Logged: {weekCount}
              </Text>

              <View style={{ marginTop: 12, alignSelf: "flex-start" }}>
                <ProgressRing value={progress} label="this week" />
              </View>

              <Pressable style={styles.heroBtn} onPress={() => navigation.navigate("AddHabit")}>
                <Text style={styles.heroBtnText}>+ Add Habit</Text>
              </Pressable>
            </View>

            <Image source={HERO_ILLUSTRATION} style={styles.heroImg} />
          </View>

          {/* Categories */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" />
                <Text style={{ marginLeft: 8, color: THEME.subtext, fontWeight: "800" }}>Syncing…</Text>
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

          {/* Week strip */}
          <Card style={{ marginTop: 12 }}>
            <WeekStrip selectedIndex={3} />
          </Card>

          {/* Ongoing habits */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Ongoing habits</Text>
            <Pressable onPress={() => navigation.navigate("AddHabit")}>
              <Text style={styles.addLink}>+ Add</Text>
            </Pressable>
          </View>

          <FlatList
            data={filteredHabits}
            keyExtractor={(i) => String(i.id)}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <HabitRow
                item={item}
                onEdit={() => navigation.navigate("EditHabit", { habit: item })}
                onDelete={() => confirmDelete(item.id, item.title)}
              />
            )}
            ListEmptyComponent={
              <Card style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "900", color: THEME.text, fontSize: 16 }}>No habits yet</Text>
                <Text style={{ marginTop: 6, color: THEME.subtext, fontWeight: "600", lineHeight: 18 }}>
                  Add one eco-friendly action (e.g., MRT, recycling, saving electricity).
                </Text>
                <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("AddHabit")}>
                  <Text style={styles.primaryBtnText}>Add your first habit</Text>
                </Pressable>
              </Card>
            }
          />
        </ScrollView>

        {/* ✅ Custom Delete Modal (center) */}
        <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Image source={DELETE_ILLUS} style={styles.modalIllus} />

              <Text style={styles.modalTitle}>Delete habit?</Text>
              <Text style={styles.modalText}>
                {deleteTitle ? `Are you sure you want to delete "${deleteTitle}"?\nThis cannot be undone.` : "This cannot be undone."}
              </Text>

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.modalCancel}
                  onPress={() => {
                    if (deleting) return;
                    setDeleteOpen(false);
                    setDeleteId(null);
                    setDeleteTitle("");
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.modalDelete} onPress={handleDelete} disabled={deleting}>
                  <Text style={styles.modalDeleteText}>{deleting ? "Deleting..." : "Delete"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: THEME.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(244, 251, 247, 0.86)",
  },

  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  hi: { fontSize: 22, fontWeight: "900", color: THEME.text },
  sub: { marginTop: 4, fontWeight: "700", color: THEME.subtext },
avatarBtn: {
  width: 55,
  height: 55,
  borderRadius: 16,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: THEME.border,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden", // important to clip image into rounded shape
},

avatarImg: {
  width: 44,
  height: 44,
  resizeMode: "cover",
},


  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEF5F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E6EFE8",
  },
  searchInput: { flex: 1, fontWeight: "800", color: THEME.text },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D7EFE0",
    backgroundColor: "#E8FFF0",
    flexDirection: "row",
    overflow: "hidden",
  },
  heroPill: {
    alignSelf: "flex-start",
    backgroundColor: "#DFFAE7",
    borderWidth: 1,
    borderColor: "#B7F2C9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "900",
    color: "#166534",
    fontSize: 12,
  },
  heroTitle: { marginTop: 10, fontSize: 20, fontWeight: "900", color: THEME.text },
  heroDesc: { marginTop: 8, color: THEME.subtext, fontWeight: "700", lineHeight: 18 },
  heroBtn: {
    marginTop: 14,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  heroBtnText: { color: "#fff", fontWeight: "900" },

  // ✅ fixed image style (no objectFit)
  heroImg: {
    width: 160,
    height: 220,
    resizeMode: "contain",
    alignSelf: "center",
    marginLeft: 6,
  },

  sectionRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: THEME.text },
  addLink: { fontWeight: "900", color: THEME.subtext },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  /* ✅ Modal styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
    alignItems: "center",
  },
  modalIllus: {
    width: 150,
    height: 110,
    resizeMode: "contain",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: THEME.text, marginTop: 6 },
  modalText: {
    marginTop: 6,
    textAlign: "center",
    color: THEME.subtext,
    fontWeight: "700",
    lineHeight: 18,
  },
  modalBtnRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 14 },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCancelText: { fontWeight: "900", color: THEME.subtext },
  modalDelete: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FDA4AF",
    backgroundColor: "#FFF1F2",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalDeleteText: { fontWeight: "900", color: THEME.danger },
});
