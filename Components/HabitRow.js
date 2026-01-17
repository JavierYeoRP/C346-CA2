import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { THEME } from "../theme";

export default function HabitRow({ item, onEdit, onDelete }) {
  const title = item?.title || "";
  const notes = item?.notes || "";
  const cat = item?.category_name || "Category";
  const date = formatDate(item?.date);

  return (
    <Pressable style={styles.card} onPress={onEdit} android_ripple={{ color: "#00000010" }}>
      <View style={{ flex: 1 }}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {cat}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>{date}</Text>

        {notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {notes}
          </Text>
        ) : null}
      </View>

      <Pressable onPress={onDelete} style={styles.delBtn} android_ripple={{ color: "#00000010" }}>
        <Text style={styles.delText}>Del</Text>
      </Pressable>
    </Pressable>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = String(iso).slice(0, 10); // supports "2026-01-12T..."
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6EEF0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: THEME.text,
  },

  pill: {
    backgroundColor: "#DFFAE7",
    borderWidth: 1,
    borderColor: "#B7F2C9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    maxWidth: 120,
  },
  pillText: {
    fontWeight: "900",
    color: "#166534",
    fontSize: 12,
  },

  date: {
    marginTop: 8,
    fontWeight: "800",
    color: "#64748B",
  },

  notes: {
    marginTop: 8,
    fontWeight: "600",
    color: "#64748B",
    lineHeight: 18,
  },

  delBtn: {
    borderWidth: 1,
    borderColor: "#FDA4AF",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  delText: { color: "#E11D48", fontWeight: "900" },
});
