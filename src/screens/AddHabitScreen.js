import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import { THEME } from "../../theme";
import Card from "../../Components/Card";

const BASE_URL = "https://habit-tracker-app-y1zf.onrender.com";

// ✅ add images here (make sure assets folder exists)
const LEAVES_BG = require("../screens/assets/greenLeave.jpg");
const ADD_ILLUS = require("../screens/assets/Illusatrton.png");

export default function AddHabitScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch(`${BASE_URL}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) setCategoryId(String(data[0].id));
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoadingCats(false);
    }
  }

  async function onSave() {
    if (!title.trim()) return Alert.alert("Missing", "Please enter habit title.");
    if (!categoryId) return Alert.alert("Missing", "Please choose a category.");
    if (!date) return Alert.alert("Missing", "Please enter a date (YYYY-MM-DD).");

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category_id: Number(categoryId),
          date,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) return Alert.alert("Error", data?.message || "Failed to add habit");

      Alert.alert("Success", "Habit added!");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to add habit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ImageBackground source={LEAVES_BG} resizeMode="cover" style={styles.bg}>
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        {/* ✅ Illustration hero header */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroPill}>Add Habit</Text>
            <Text style={styles.heroTitle}>Log a Green Action 
            </Text>
            <Text style={styles.heroSub}>
              Track sustainable behaviours aligned with Singapore Green Plan 2030.
            </Text>

            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={18} color={THEME.text} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          <Image source={ADD_ILLUS} style={styles.heroImg} />
        </View>

        {/* ✅ Form Card */}
        <Card style={styles.card}>
          <Text style={styles.title}>Add a Green Habit</Text>
          <Text style={styles.sub}>Log one eco-friendly action you did today.</Text>

          <Text style={styles.label}>Habit Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Used MRT instead of ride-hailing"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Category *</Text>
          {loadingCats ? (
            <View style={styles.row}>
              <ActivityIndicator />
              <Text style={{ marginLeft: 10, color: THEME.subtext, fontWeight: "800" }}>
                Loading categories…
              </Text>
            </View>
          ) : (
            <View style={styles.pickerWrap}>
              <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(String(v))}>
                {categories.map((c) => (
                  <Picker.Item key={c.id} label={`${c.name}`} value={String(c.id)} />
                ))}
              </Picker>
            </View>
          )}

          <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, { height: 92 }]}
            placeholder="Small details help you reflect…"
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Pressable style={styles.primaryBtn} onPress={onSave} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? "Saving..." : "Save Habit"}</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
        </Card>

        <View style={{ height: 18 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: THEME.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(244, 251, 247, 0.86)",
  },

  screen: {
    padding: 16,
    paddingTop: 12,
  },

  hero: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D7EFE0",
    backgroundColor: "#E8FFF0",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  heroText: { flex: 1 },
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
  heroTitle: { marginTop: 10, fontSize: 18, fontWeight: "900", color: THEME.text },
  heroSub: { marginTop: 6, color: THEME.subtext, fontWeight: "700", lineHeight: 18 },

  heroImg: {
    width: 120,
    height: 140,
    resizeMode: "contain",
    alignSelf: "flex-end",
  },

  backBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFFAA",
    borderWidth: 1,
    borderColor: "#E6EEF0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backText: { fontWeight: "900", color: THEME.text },

  card: { marginTop: 14 },

  title: { fontSize: 18, fontWeight: "900", color: THEME.text },
  sub: { marginTop: 4, color: THEME.subtext, fontWeight: "600", marginBottom: 12 },

  label: { fontWeight: "900", marginTop: 10, color: THEME.text },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: THEME.text,
    fontWeight: "700",
    backgroundColor: "#FFFFFF",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  secondaryText: { fontWeight: "900", color: THEME.subtext },
});
