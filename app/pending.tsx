import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { clearAuth } from "@/src/lib/auth";
import { getProfile } from "@/src/lib/api";
import { saveDriver } from "@/src/lib/auth";

export default function PendingScreen() {
  const router = useRouter();

  const checkStatus = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.driver.status === "approved") {
        await saveDriver(res.driver);
        router.replace("/(tabs)");
      }
    } catch {}
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo.png")} style={styles.logo} resizeMode="contain" />

      <View style={styles.iconWrap}>
        <Ionicons name="time-outline" size={60} color={COLORS.gold} />
      </View>

      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.subtitle}>
        Your documents have been submitted.{"\n"}
        The dispatcher will review and approve your account.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={checkStatus} activeOpacity={0.8}>
        <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
        <Text style={styles.btnText}>Check Status</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, justifyContent: "center", alignItems: "center", padding: 32 },
  logo: { width: 80, height: 80, borderRadius: 16, marginBottom: 32 },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(245,166,35,0.1)",
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  title: { color: COLORS.white, fontSize: 24, fontWeight: "800", marginBottom: 12 },
  subtitle: { color: COLORS.gray400, fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
  },
  btnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  logoutBtn: { marginTop: 24 },
  logoutText: { color: COLORS.gray400, fontSize: 14 },
});
