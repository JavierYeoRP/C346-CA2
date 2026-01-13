import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getCategories, createHabit } from "../services/api";

export default function AddHabitScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) setCategoryId(String(data[0].id));
      } catch (e) {
        Alert.alert("Error", e.message);
      } finally {
        setLoadingCats(false);
      }
    };
    loadCats();
  }, []);

  const onSave = async () => {
    if (!title.trim()) return Alert.alert("Missing", "Please enter habit title.");
    if (!categoryId) return Alert.alert("Missing", "Please choose a category.");
    if (!date) return Alert.alert("Missing", "Please enter a date (YYYY-MM-DD).");

    setSaving(true);
    try {
      await createHabit({
        title: title.trim(),
        category_id: Number(categoryId),
        date,
        notes: notes.trim() || null,
      });
      Alert.alert("Success", "Habit added!");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Habit Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Used MRT instead of car"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Category *</Text>
      {loadingCats ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator />
          <Text style={{ marginLeft: 10, opacity: 0.7 }}>Loading categories…</Text>
        </View>
      ) : (
        <View style={styles.pickerWrap}>
          <Picker selectedValue={categoryId} onValueChange={(v) => setCategoryId(v)}>
            {categories.map((c) => (
              <Picker.Item
                key={c.id}
                label={`${c.name} (${c.green_plan_focus})`}
                value={String(c.id)}
              />
            ))}
          </Picker>
        </View>
      )}

      <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Any details…"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.primaryBtn} onPress={onSave} disabled={saving}>
        <Text style={styles.primaryBtnText}>{saving ? "Saving..." : "Save Habit"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  label: { fontWeight: "900", marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  pickerWrap: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  loaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  primaryBtn: { marginTop: 16, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { fontWeight: "900" },
});
