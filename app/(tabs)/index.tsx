import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ScrollView, RefreshControl, Platform,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { COLORS } from "@/src/constants/theme";
import { getDriver, saveDriver } from "@/src/lib/auth";
import { getProfile, toggleAvailability, getBookings, savePushToken } from "@/src/lib/api";
import { useLocationTracking } from "@/src/hooks/useLocation";
import { registerForPushNotifications } from "@/src/lib/notifications";

interface Driver {
  name: string; status: string; isAvailable?: boolean;
}

export default function DashboardScreen() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [available, setAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayJobs, setTodayJobs] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  useLocationTracking(available);

  const load = async () => {
    try {
      const res = await getProfile();
      if (res.success) {
        setDriver(res.driver);
        setAvailable(res.driver.isAvailable || false);
        await saveDriver(res.driver);
      }
    } catch {
      const d = await getDriver() as Driver | null;
      if (d) { setDriver(d); setAvailable(d.isAvailable || false); }
    }
    try {
      const active = await getBookings("active");
      const completed = await getBookings("completed");
      const assigned = await getBookings("assigned");
      const all = [...(active.bookings || []), ...(completed.bookings || []), ...(assigned.bookings || [])];
      setTotalJobs(all.length);
      const today = new Date().toLocaleDateString("en-GB");
      setTodayJobs(all.filter((b: { date: string }) => b.date === today).length);
    } catch {}
  };

  useEffect(() => {
    load();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== "granted") {
        Alert.alert("Location Required", "Please enable location access so dispatchers can find you.");
      }
    } catch {}
    try {
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus === "granted") {
        const token = await registerForPushNotifications();
        if (token) savePushToken(token);
      }
    } catch {}
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await toggleAvailability(!available);
      if (res.success) {
        setAvailable(res.isAvailable);
        const d = await getDriver() as Record<string, unknown> | null;
        if (d) await saveDriver({ ...d, isAvailable: res.isAvailable });
      }
    } catch {}
    setToggling(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const stats = [
    { icon: "today-outline" as const, label: "Today", value: `${todayJobs} Jobs`, color: COLORS.gold },
    { icon: "cash-outline" as const, label: "Earnings", value: "£0.00", color: COLORS.crimson },
    { icon: "star-outline" as const, label: "Rating", value: "5.0", color: COLORS.orange },
    { icon: "car-outline" as const, label: "Total Jobs", value: `${totalJobs}`, color: COLORS.green },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}>

      <View style={styles.header}>
        <Image source={require("@/assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{driver?.name || "Driver"}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.toggleCard, available ? styles.toggleAvailable : styles.toggleBusy]}
        onPress={handleToggle} disabled={toggling} activeOpacity={0.8}>
        <View style={styles.toggleLeft}>
          <View style={[styles.toggleDot, available ? styles.dotAvailable : styles.dotBusy]} />
          <View>
            <Text style={styles.toggleLabel}>{available ? "Available" : "Busy"}</Text>
            <Text style={styles.toggleSub}>
              {available ? "You're visible to dispatchers" : "Tap to go online"}
            </Text>
          </View>
        </View>
        {toggling ? (
          <ActivityIndicator color={available ? COLORS.green : COLORS.gray400} />
        ) : (
          <View style={[styles.toggleSwitch, available ? styles.switchOn : styles.switchOff]}>
            <View style={[styles.switchThumb, available ? styles.thumbOn : styles.thumbOff]} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon} size={24} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  scroll: { padding: 20, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logo: { width: 48, height: 48, borderRadius: 12 },
  headerText: { flex: 1, marginLeft: 14 },
  greeting: { color: COLORS.gray400, fontSize: 13 },
  name: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  toggleCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1.5,
  },
  toggleAvailable: { backgroundColor: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" },
  toggleBusy: { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  toggleDot: { width: 12, height: 12, borderRadius: 6 },
  dotAvailable: { backgroundColor: COLORS.green },
  dotBusy: { backgroundColor: COLORS.gray500 },
  toggleLabel: { color: COLORS.white, fontSize: 17, fontWeight: "700" },
  toggleSub: { color: COLORS.gray400, fontSize: 12, marginTop: 2 },
  toggleSwitch: { width: 52, height: 30, borderRadius: 15, justifyContent: "center", paddingHorizontal: 3 },
  switchOn: { backgroundColor: COLORS.green },
  switchOff: { backgroundColor: "rgba(255,255,255,0.15)" },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white },
  thumbOn: { alignSelf: "flex-end" as const },
  thumbOff: { alignSelf: "flex-start" as const },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  statValue: { color: COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 10 },
  statLabel: { color: COLORS.gray400, fontSize: 12, marginTop: 2 },
});
