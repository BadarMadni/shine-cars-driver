import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { getDriver, clearAuth, saveDriver } from "@/src/lib/auth";
import { getProfile, updateProfile, deleteAccount } from "@/src/lib/api";
import ChangePassword from "@/src/components/ChangePassword";

interface Driver {
  name: string; email: string; phone: string; status: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    (async () => {
      const cached = await getDriver() as Driver | null;
      if (cached) { setDriver(cached); setName(cached.name); setPhone(cached.phone); }
      try {
        const res = await getProfile();
        if (res.success) { setDriver(res.driver); setName(res.driver.name); setPhone(res.driver.phone); await saveDriver(res.driver); }
      } catch {}
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Name is required");
    if (!phone.trim()) return Alert.alert("Error", "Phone is required");
    setSaving(true);
    try {
      const res = await updateProfile({ name: name.trim(), phone: phone.trim() });
      if (res.success) { setDriver(res.driver); await saveDriver(res.driver); setEditing(false); Alert.alert("Success", "Profile updated"); }
    } catch { Alert.alert("Error", "Failed to update profile"); }
    setSaving(false);
  };

  const handleLogout = () => Alert.alert("Logout", "Are you sure?", [
    { text: "Cancel" },
    { text: "Logout", style: "destructive", onPress: async () => { await clearAuth(); router.replace("/login"); } },
  ]);

  const handleDelete = () => Alert.alert("Delete Account", "This will permanently delete your account and all data. This action cannot be undone.", [
    { text: "Cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      try {
        const res = await deleteAccount();
        if (res.success) { await clearAuth(); router.replace("/login"); }
        else Alert.alert("Error", res.message || "Failed to delete account");
      } catch { Alert.alert("Error", "Failed to delete account"); }
    }},
  ]);

  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; editable: boolean }[] = [
    { icon: "person-outline", label: "Name", value: driver?.name || "", editable: true },
    { icon: "mail-outline", label: "Email", value: driver?.email || "", editable: false },
    { icon: "call-outline", label: "Phone", value: driver?.phone || "", editable: true },
    { icon: "shield-checkmark-outline", label: "Status", value: (driver?.status || "").toUpperCase(), editable: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color={COLORS.crimson} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditing(false)} style={styles.editBtn}>
            <Ionicons name="close" size={18} color={COLORS.gray400} />
            <Text style={[styles.editText, { color: COLORS.gray400 }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={36} color={COLORS.gold} />
        </View>
        <Text style={styles.avatarName}>{driver?.name || "Driver"}</Text>
        <View style={[styles.badge, driver?.status === "approved" ? styles.badgeApproved : styles.badgePending]}>
          <Text style={[styles.badgeText, driver?.status === "approved" ? styles.badgeTextApproved : styles.badgeTextPending]}>
            {driver?.status === "approved" ? "Approved" : "Pending"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        {rows.map((r, i) => (
          <View key={r.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
            <Ionicons name={r.icon} size={20} color={COLORS.gold} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              {editing && r.editable ? (
                <TextInput style={styles.input} value={r.label === "Name" ? name : phone}
                  onChangeText={r.label === "Name" ? setName : setPhone} placeholderTextColor={COLORS.gray500} />
              ) : (
                <Text style={styles.rowValue}>{r.value}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {editing && (
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.docBtn} onPress={() => router.push("/documents")} activeOpacity={0.8}>
        <Ionicons name="document-text-outline" size={20} color={COLORS.gold} />
        <Text style={styles.docText}>Manage Documents</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.gray500} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.docBtn} onPress={() => setShowPw(!showPw)} activeOpacity={0.8}>
        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gold} />
        <Text style={styles.docText}>Change Password</Text>
        <Ionicons name={showPw ? "chevron-up" : "chevron-forward"} size={18} color={COLORS.gray500} />
      </TouchableOpacity>
      {showPw && <ChangePassword onDone={() => setShowPw(false)} />}

      <TouchableOpacity style={styles.docBtn} onPress={() => router.push("/privacy")} activeOpacity={0.8}>
        <Ionicons name="shield-outline" size={20} color={COLORS.gold} />
        <Text style={styles.docText}>Privacy Policy</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.gray500} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.logoutBtn, { marginTop: 12 }]} onPress={handleDelete} activeOpacity={0.8}>
        <Ionicons name="trash-outline" size={20} color={COLORS.red} />
        <Text style={styles.logoutText}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  scroll: { padding: 20, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: "800" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  editText: { color: COLORS.crimson, fontSize: 14, fontWeight: "600" },
  avatarWrap: { alignItems: "center", marginBottom: 28 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(245,166,35,0.15)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarName: { color: COLORS.white, fontSize: 20, fontWeight: "700" },
  badge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  badgeApproved: { backgroundColor: "rgba(34,197,94,0.15)" },
  badgePending: { backgroundColor: "rgba(245,166,35,0.15)" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  badgeTextApproved: { color: COLORS.green },
  badgeTextPending: { color: COLORS.gold },
  card: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  rowText: { flex: 1 },
  rowLabel: { color: COLORS.gray400, fontSize: 12 },
  rowValue: { color: COLORS.white, fontSize: 15, fontWeight: "600", marginTop: 2 },
  input: { color: COLORS.white, fontSize: 15, fontWeight: "600", marginTop: 2, borderBottomWidth: 1, borderBottomColor: COLORS.crimson, paddingBottom: 4 },
  saveBtn: { backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  docBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 12 },
  docText: { color: COLORS.white, fontSize: 15, fontWeight: "600", flex: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 12, paddingVertical: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: "700" },
});
