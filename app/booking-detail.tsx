import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, Linking,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { getBookings, updateBookingStatus } from "@/src/lib/api";
import styles from "@/src/styles/bookingDetail";
import {
  PaymentCard, CustomerCard, TripCard, RideInfoCard,
  CashInputCard, ActionButtons, CompleteButton,
} from "@/src/components/BookingDetailCards";

interface Booking {
  id: string; name: string; phone: string;
  pickup: string; dropoff: string;
  date: string; time: string;
  distance: number; fare: number;
  status: string; vehicle: string;
  paymentMethod?: string; paymentStatus?: string;
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
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cashAmount, setCashAmount] = useState("");

  const load = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        getBookings("active"), getBookings("assigned"), getBookings("completed"),
      ]);
      const all = [...(r1.bookings || []), ...(r2.bookings || []), ...(r3.bookings || [])];
      const found = all.find((b: Booking) => b.id === id);
      if (found) setBooking(found);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const doUpdate = async (nextStatus: string, cash?: number) => {
    if (!booking) return;
    setUpdating(true);
    try {
      const res = await updateBookingStatus(booking.id, nextStatus, cash);
      if (res.success) setBooking({ ...booking, status: nextStatus });
    } catch {}
    setUpdating(false);
  };

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

  const handleComplete = () => {
    if (!booking) return;
    const isCash = booking.paymentMethod === "cash";
    if (isCash && !cashAmount.trim()) {
      Alert.alert("Cash Amount", "Please enter the cash amount collected.");
      return;
    }
    const amount = isCash ? parseFloat(cashAmount) : undefined;
    if (isCash && (isNaN(amount!) || amount! <= 0)) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    doUpdate("completed", amount);
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
  const isCash = booking.paymentMethod === "cash";
  const isInProgress = booking.status === "in-progress";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>{booking.status.toUpperCase()}</Text>
        </View>

        <PaymentCard booking={booking} />
        <CustomerCard booking={booking} onCall={() => booking.phone && Linking.openURL(`tel:${booking.phone}`)} />
        <TripCard booking={booking} />
        <RideInfoCard booking={booking} />

        {isInProgress && isCash && (
          <CashInputCard booking={booking} cashAmount={cashAmount} setCashAmount={setCashAmount} />
        )}

        <ActionButtons actions={currentActions} updating={updating} onAction={handleAction} />

        {isInProgress && <CompleteButton updating={updating} onComplete={handleComplete} />}

        <View style={{ height: isInProgress && isCash ? 200 : 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
