import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { getBookings, updateBookingStatus } from "@/src/lib/api";

interface Booking {
  id: string; name: string; phone: string;
  pickup: string; dropoff: string;
  date: string; time: string;
  distance: number; fare: number;
  status: string; vehicle: string;
}

const actions: Record<string, { label: string; next: string; icon: string; color: string }[]> = {
  assigned: [
    { label: "Accept", next: "accepted", icon: "checkmark-circle", color: COLORS.green },
    { label: "Decline", next: "cancelled", icon: "close-circle", color: COLORS.red },
  ],
  accepted: [
    { label: "Arrived at Pickup", next: "arrived", icon: "location", color: "#14B8A6" },
    { label: "Cancel", next: "cancelled", icon: "close-circle", color: COLORS.red },
  ],
  arrived: [
    { label: "Start Trip", next: "in-progress", icon: "car", color: "#A855F7" },
    { label: "Cancel", next: "cancelled", icon: "close-circle", color: COLORS.red },
  ],
  "in-progress": [
    { label: "Complete Trip", next: "completed", icon: "checkmark-done-circle", color: COLORS.green },
  ],
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      const res = await getBookings("active");
      const all = [...(res.bookings || [])];
      const res2 = await getBookings("assigned");
      all.push(...(res2.bookings || []));
      const res3 = await getBookings("completed");
      all.push(...(res3.bookings || []));
      const found = all.find((b: Booking) => b.id === id);
      if (found) setBooking(found);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (nextStatus: string) => {
    if (!booking) return;
    if (nextStatus === "cancelled") {
      Alert.alert("Cancel Booking", "Are you sure?", [
        { text: "No" },
        { text: "Yes", style: "destructive", onPress: () => doUpdate(nextStatus) },
      ]);
      return;
    }
    doUpdate(nextStatus);
  };

  const doUpdate = async (nextStatus: string) => {
    if (!booking) return;
    setUpdating(true);
    try {
      const res = await updateBookingStatus(booking.id, nextStatus);
      if (res.success) {
        setBooking({ ...booking, status: nextStatus });
      }
    } catch {}
    setUpdating(false);
  };

  const callCustomer = () => {
    if (booking?.phone) Linking.openURL(`tel:${booking.phone}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Booking not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentActions = actions[booking.status] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        <Text style={styles.backLabel}>Back</Text>
      </TouchableOpacity>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{booking.status.toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={COLORS.gold} />
          <Text style={styles.infoText}>{booking.name}</Text>
        </View>
        <TouchableOpacity onPress={callCustomer} style={styles.infoRow}>
          <Ionicons name="call" size={16} color={COLORS.green} />
          <Text style={[styles.infoText, { color: COLORS.green }]}>{booking.phone}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Details</Text>
        <View style={styles.tripRow}>
          <View style={[styles.tripDot, { backgroundColor: COLORS.green }]} />
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Pickup</Text>
            <Text style={styles.tripAddress}>{booking.pickup}</Text>
          </View>
        </View>
        <View style={styles.tripLine} />
        <View style={styles.tripRow}>
          <View style={[styles.tripDot, { backgroundColor: COLORS.crimson }]} />
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Drop-off</Text>
            <Text style={styles.tripAddress}>{booking.dropoff}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ride Info</Text>
        <View style={styles.rideGrid}>
          <View style={styles.rideItem}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.gold} />
            <Text style={styles.rideValue}>{booking.date}</Text>
            <Text style={styles.rideLabel}>Date</Text>
          </View>
          <View style={styles.rideItem}>
            <Ionicons name="time-outline" size={18} color={COLORS.gold} />
            <Text style={styles.rideValue}>{booking.time}</Text>
            <Text style={styles.rideLabel}>Time</Text>
          </View>
          <View style={styles.rideItem}>
            <Ionicons name="speedometer-outline" size={18} color={COLORS.gold} />
            <Text style={styles.rideValue}>{booking.distance?.toFixed(1) || "—"} mi</Text>
            <Text style={styles.rideLabel}>Distance</Text>
          </View>
          <View style={styles.rideItem}>
            <Ionicons name="cash-outline" size={18} color={COLORS.gold} />
            <Text style={styles.rideValue}>£{booking.fare.toFixed(2)}</Text>
            <Text style={styles.rideLabel}>Fare</Text>
          </View>
        </View>
      </View>

      {currentActions.length > 0 && (
        <View style={styles.actionsWrap}>
          {currentActions.map((a) => (
            <TouchableOpacity key={a.next} activeOpacity={0.8}
              onPress={() => handleAction(a.next)}
              disabled={updating}
              style={[styles.actionBtn, { backgroundColor: a.color }]}>
              {updating ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name={a.icon as keyof typeof Ionicons.glyphMap} size={20} color={COLORS.white} />
                  <Text style={styles.actionText}>{a.label}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  scroll: { padding: 20, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  center: { flex: 1, backgroundColor: COLORS.navy, justifyContent: "center", alignItems: "center" },
  emptyText: { color: COLORS.gray400, fontSize: 16 },
  backBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.crimson, borderRadius: 10 },
  backText: { color: COLORS.white, fontWeight: "700" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  backLabel: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  statusCard: {
    backgroundColor: "rgba(245,166,35,0.1)", borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: "rgba(245,166,35,0.2)", alignItems: "center",
  },
  statusLabel: { color: COLORS.gray400, fontSize: 12, marginBottom: 4 },
  statusValue: { color: COLORS.gold, fontSize: 20, fontWeight: "800" },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: { color: COLORS.white, fontSize: 15, fontWeight: "700", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  infoText: { color: COLORS.gray400, fontSize: 14 },
  tripRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tripDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  tripInfo: { flex: 1 },
  tripLabel: { color: COLORS.gray500, fontSize: 11, marginBottom: 2 },
  tripAddress: { color: COLORS.white, fontSize: 14, fontWeight: "500" },
  tripLine: { width: 2, height: 20, backgroundColor: "rgba(255,255,255,0.1)", marginLeft: 4, marginVertical: 4 },
  rideGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  rideItem: {
    width: "46%", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12,
    padding: 12, alignItems: "center",
  },
  rideValue: { color: COLORS.white, fontSize: 15, fontWeight: "700", marginTop: 6 },
  rideLabel: { color: COLORS.gray500, fontSize: 11, marginTop: 2 },
  actionsWrap: { gap: 10, marginTop: 8 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14,
  },
  actionText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
