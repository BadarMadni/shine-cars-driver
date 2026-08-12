import { useEffect, useState } from "react";
import {
  View, Text, Image, ScrollView, RefreshControl, Platform,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { COLORS } from "@/src/constants/theme";
import { getDriver, saveDriver, clearAuth } from "@/src/lib/auth";
import { getProfile, toggleAvailability, getBookings, savePushToken } from "@/src/lib/api";
import { useLocationTracking } from "@/src/hooks/useLocation";
import { useRouter } from "expo-router";
import { useKeepAwake, deactivateKeepAwake, activateKeepAwake } from "expo-keep-awake";
import { useUnreadCount } from "@/src/hooks/useNotifications";
import { useChatUnread } from "@/src/hooks/useChatUnread";
import styles from "@/src/styles/dashboard";

interface Driver {
  name: string; status: string; isAvailable?: boolean;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [available, setAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayJobs, setTodayJobs] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [earnings, setEarnings] = useState(0);

  useLocationTracking(available);
  useEffect(() => {
    if (available) activateKeepAwake("driver-available");
    else deactivateKeepAwake("driver-available");
    return () => deactivateKeepAwake("driver-available");
  }, [available]);
  const { count: unreadCount } = useUnreadCount();
  const chatUnread = useChatUnread();

  const load = async () => {
    const cached = await getDriver() as Driver | null;
    if (cached && !driver) {
      setDriver(cached);
      setAvailable(cached.isAvailable || false);
    }
    try {
      const res = await getProfile();
      if (res.success) {
        setDriver(res.driver);
        setAvailable(res.driver.isAvailable || false);
        await saveDriver(res.driver);
      }
    } catch {}
    try {
      const completed = await getBookings("completed");
      const done = completed.bookings || [];
      setTotalJobs(done.length);
      setEarnings(done.reduce((sum: number, b: { fare?: number }) => sum + (b.fare || 0), 0));
      const today = new Date().toLocaleDateString("en-GB");
      setTodayJobs(done.filter((b: { date: string }) => b.date === today).length);
    } catch {}
  };

  useEffect(() => {
    load();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: existing } = await Location.getForegroundPermissionsAsync();
      if (existing !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Location Required", "Please enable location access so dispatchers can find you.");
        }
      }
    } catch {}
    try {
      const { registerForPushNotifications } = await import("@/src/lib/notifications");
      const token = await registerForPushNotifications();
      if (token) savePushToken(token);
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
    { icon: "today-outline" as const, label: "Today's Rides", value: `${todayJobs}`, color: COLORS.gold, bg: "rgba(245,166,35,0.1)" },
    { icon: "cash-outline" as const, label: "Earnings", value: `£${earnings.toFixed(2)}`, color: COLORS.crimson, bg: "rgba(204,34,41,0.1)" },
    { icon: "star-outline" as const, label: "Rating", value: "5.0", color: COLORS.orange, bg: "rgba(249,115,22,0.1)" },
    { icon: "car-outline" as const, label: "Total Rides", value: `${totalJobs}`, color: COLORS.green, bg: "rgba(34,197,94,0.1)" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Image source={require("@/assets/icon.png")} style={styles.logo} resizeMode="cover" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{driver?.name || "Driver"}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}
          onPress={() => router.push("/chat")}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.white} />
          {chatUnread > 0 && (
            <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: COLORS.crimson, borderRadius: 9, minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}>
              <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "800" }}>{chatUnread}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerBtn, { marginLeft: 8 }]} activeOpacity={0.7}
          onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
          {unreadCount > 0 && (
            <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: COLORS.crimson, borderRadius: 9, minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}>
              <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "800" }}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}
          onPress={async () => { await clearAuth(); router.replace("/login"); }}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.crimson} />
        </TouchableOpacity>
      </View>

      {/* Availability Toggle */}
      <TouchableOpacity
        style={[styles.toggleCard, available ? styles.toggleAvailable : styles.toggleBusy]}
        onPress={handleToggle} disabled={toggling} activeOpacity={0.8}>
        <View style={styles.toggleLeft}>
          <View style={[styles.toggleDot, available ? styles.dotAvailable : styles.dotBusy]} />
          <View>
            <Text style={styles.toggleLabel}>{available ? "Available" : "Offline"}</Text>
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

      {/* Stats */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
