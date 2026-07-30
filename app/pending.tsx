import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { clearAuth, saveDriver } from "@/src/lib/auth";
import { getProfile } from "@/src/lib/api";

export default function PendingScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"pending" | "rejected">("pending");

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await getProfile();
      if (res.success) {
        if (res.driver.status === "approved") {
          await saveDriver(res.driver);
          router.replace("/(tabs)");
          return;
        }
        if (res.driver.status === "rejected") {
          setStatus("rejected");
        }
      }
    } catch {}
    setChecking(false);
  };

  useEffect(() => { checkStatus(); }, []);

  const handleResubmit = async () => {
    const res = await getProfile();
    if (res.success) {
      await saveDriver({ ...res.driver, status: "rejected" });
    }
    router.replace("/documents");
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/login");
  };

  const isRejected = status === "rejected";

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo.png")} style={styles.logo} resizeMode="contain" />

      <View style={[styles.iconWrap, isRejected && styles.iconWrapRejected]}>
        <Ionicons
          name={isRejected ? "close-circle-outline" : "time-outline"}
          size={60}
          color={isRejected ? COLORS.crimson : COLORS.gold}
        />
      </View>

      <Text style={styles.title}>
        {isRejected ? "Documents Rejected" : "Pending Approval"}
      </Text>
      <Text style={styles.subtitle}>
        {isRejected
          ? "Your documents have been rejected.\nPlease review and resubmit your documents."
          : "Your documents have been submitted.\nThe dispatcher will review and approve your account."}
      </Text>

      {isRejected ? (
        <TouchableOpacity style={styles.resubmitBtn} onPress={handleResubmit} activeOpacity={0.8}>
          <Ionicons name="cloud-upload-outline" size={20} color={COLORS.white} />
          <Text style={styles.btnText}>Resubmit Documents</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={checkStatus} disabled={checking} activeOpacity={0.8}>
          {checking ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
              <Text style={styles.btnText}>Check Status</Text>
            </>
          )}
        </TouchableOpacity>
      )}

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
  iconWrapRejected: { backgroundColor: "rgba(204,34,41,0.1)" },
  title: { color: COLORS.white, fontSize: 24, fontWeight: "800", marginBottom: 12 },
  subtitle: { color: COLORS.gray400, fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
  },
  resubmitBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
  },
  btnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  logoutBtn: { marginTop: 24 },
  logoutText: { color: COLORS.gray400, fontSize: 14 },
});
