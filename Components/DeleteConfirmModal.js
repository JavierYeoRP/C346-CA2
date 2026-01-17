import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image } from "react-native";
import { THEME } from "../theme";

const DELETE_ILLUS = require("../src/screens/assets/Delete.png");

export default function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
  title = "Delete habit?",
  message = "This action cannot be undone.",
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <Image source={DELETE_ILLUS} style={styles.illus} />

          <Text style={styles.h1}>{title}</Text>
          <Text style={styles.p}>{message}</Text>

          <View style={styles.btnRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.deleteBtn} onPress={onConfirm}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
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
  illus: {
    width: 150,
    height: 110,
    resizeMode: "contain",
    marginBottom: 8,
  },
  h1: { fontSize: 16, fontWeight: "900", color: THEME.text, marginTop: 6 },
  p: {
    marginTop: 6,
    textAlign: "center",
    color: THEME.subtext,
    fontWeight: "700",
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: { fontWeight: "900", color: THEME.subtext },

  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FDA4AF",
    backgroundColor: "#FFF1F2",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteText: { fontWeight: "900", color: THEME.danger },
});
