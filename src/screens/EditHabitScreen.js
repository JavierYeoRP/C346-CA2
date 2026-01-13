import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getCategories, updateHabit, deleteHabit } from "../services/api";

export default function EditHabitScreen({ navigation, route }) {
  const habit = route.params?.habit;

  const [title, setTitle] = useState(habit?.title || "");
  const [categoryId, setCategoryId] = useState(habit?.category_id ? String(habit.category_id) : "");
  const [date, setDate] = useState(habit?.date || "");
  const [notes, setNotes] = useState(habit?.notes || "");

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!habit?.id) {
      Alert.alert("Error", "Habit not found.");
      navigation.goBack();
      return;
    }

    const loadCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);

        // If no category_id came back but we have category_name, match it
        if (!categoryId && habit?.category_name) {
          const found = data.find((c) => c.name === habit.category_name);
          if (found) setCategoryId(String(found.id));
        }

        if (!categoryId && data.length > 0) setCategoryId(String(data[0].id));
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
      await updateHabit(habit.id, {
        title: title.trim(),
        category_id: Number(categoryId),
        date,
        notes: notes.trim() || null,
      });
      Alert.alert("Updated", "Habit updated!");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Delete habit?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(habit.id);
            Alert.alert("Deleted", "Habit deleted.");
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Habit Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

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
      <TextInput style={[styles.input, { height: 90 }]} value={notes} onChangeText={setNotes} multiline />

      <Pressable style={styles.primaryBtn} onPress={onSave} disabled={saving}>
        <Text style={styles.primaryBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </Pressable>

      <Pressable style={styles.dangerBtn} onPress={onDelete}>
        <Text style={styles.dangerBtnText}>Delete Habit</Text>
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
  dangerBtn: { marginTop: 10, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  dangerBtnText: { fontWeight: "900" },
});
