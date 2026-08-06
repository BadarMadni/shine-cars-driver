import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { changePassword } from "@/src/lib/api";

export default function ChangePassword({ onDone }: { onDone?: () => void }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!oldPw || !newPw || !confirmPw) return Alert.alert("Error", "All fields are required");
    if (newPw.length < 8) return Alert.alert("Error", "Password must be at least 8 characters");
    if (newPw !== confirmPw) return Alert.alert("Error", "Passwords do not match");
    setSaving(true);
    try {
      const res = await changePassword(oldPw, newPw);
      if (res.success) {
        Alert.alert("Success", "Password changed successfully");
        setOldPw(""); setNewPw(""); setConfirmPw("");
        onDone?.();
      } else Alert.alert("Error", res.message || "Failed to change password");
    } catch { Alert.alert("Error", "Failed to change password"); }
    setSaving(false);
  };

  const fields = [
    { label: "Current Password", val: oldPw, set: setOldPw },
    { label: "New Password", val: newPw, set: setNewPw },
    { label: "Confirm Password", val: confirmPw, set: setConfirmPw },
  ];

  return (
    <View style={styles.card}>
      {fields.map((f, i) => (
        <View key={f.label} style={[styles.row, i < fields.length - 1 && styles.rowBorder]}>
          <Ionicons name="key-outline" size={20} color={COLORS.gold} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{f.label}</Text>
            <TextInput style={styles.input} value={f.val} onChangeText={f.set}
              secureTextEntry placeholderTextColor={COLORS.gray500} placeholder={f.label} />
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={handleSubmit} disabled={saving}
        style={styles.saveBtn} activeOpacity={0.8}>
        {saving ? <ActivityIndicator color={COLORS.white} /> :
          <Text style={styles.saveText}>Update Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  rowText: { flex: 1 },
  rowLabel: { color: COLORS.gray400, fontSize: 12 },
  input: { color: COLORS.white, fontSize: 15, fontWeight: "600", marginTop: 2, borderBottomWidth: 1, borderBottomColor: COLORS.crimson, paddingBottom: 4 },
  saveBtn: { backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 16, alignItems: "center", margin: 12 },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
