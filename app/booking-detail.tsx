import { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking, Keyboard,
} from "react-native";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { getBookings, updateBookingStatus } from "@/src/lib/api";
import { calculateMeterFare, haversine } from "@/src/lib/meterFare";
import styles from "@/src/styles/bookingDetail";
import {
  PaymentCard, CustomerCard, TripCard, RideInfoCard,
  NotesCard, CashInputCard, ActionButtons, CompleteButton,
} from "@/src/components/BookingDetailCards";
import MeterCard from "@/src/components/MeterCard";

interface Booking {
  id: string; name: string; phone: string;
  pickup: string; dropoff: string; stops?: string | null;
  date: string; time: string;
  distance: number; fare: number;
  status: string; vehicle: string;
  paymentMethod?: string; paymentStatus?: string;
  fareType?: string; meterDistance?: number | null; meterFare?: number | null;
  isRecurring?: boolean;
  notes?: string | null;
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
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [meterRunning, setMeterRunning] = useState(false);
  const [meterDistance, setMeterDistance] = useState(0);
  const [meterFare, setMeterFare] = useState(0);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const load = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([getBookings("active"), getBookings("assigned"), getBookings("completed")]);
      const found = [...(r1.bookings || []), ...(r2.bookings || []), ...(r3.bookings || [])].find((b: Booking) => b.id === id);
      if (found) setBooking(found);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100));
    return () => { locationSub.current?.remove(); sub.remove(); };
  }, []);

  const startMeter = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission", "Location permission needed for meter."); return; }
    setMeterRunning(true);
    setMeterDistance(0);
    setMeterFare(0);
    lastPos.current = null;
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 3000 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        if (lastPos.current) {
          const d = haversine(lastPos.current.lat, lastPos.current.lng, latitude, longitude);
          setMeterDistance((prev) => {
            const newDist = prev + d;
            setMeterFare(calculateMeterFare(newDist, (booking?.vehicle || "car") as "car" | "mpv"));
            return newDist;
          });
        }
        lastPos.current = { lat: latitude, lng: longitude };
      },
    );
  }, [booking]);

  const stopMeter = useCallback(() => { locationSub.current?.remove(); locationSub.current = null; setMeterRunning(false); }, []);

  const doUpdate = async (nextStatus: string, cash?: number, mDist?: number, mFare?: number) => {
    if (!booking) return;
    setUpdating(true);
    try {
      const res = await updateBookingStatus(booking.id, nextStatus, cash, mDist, mFare);
      if (res.success) setBooking({ ...booking, status: nextStatus });
    } catch {}
    setUpdating(false);
  };

  const handleAction = async (nextStatus: string) => {
    if (!booking) return;
    if (nextStatus === "cancelled") { Alert.alert("Cancel Booking", "Are you sure?", [{ text: "No" }, { text: "Yes", style: "destructive", onPress: () => doUpdate(nextStatus) }]); return; }
    doUpdate(nextStatus);
  };

  const handleComplete = () => {
    if (!booking) return;
    const isMeter = booking.fareType === "meter";
    const isCash = booking.paymentMethod === "cash";
    const isInv = booking.paymentMethod === "invoice";
    if (isMeter && meterRunning) { Alert.alert("Stop Meter", "Please stop the meter before completing."); return; }
    if (isInv) { doUpdate("completed"); return; }
    if (isCash && !cashAmount.trim()) { Alert.alert("Cash Amount", "Please enter the cash amount collected."); return; }
    const amount = isCash ? parseFloat(cashAmount) : undefined;
    if (isCash && (isNaN(amount!) || amount! <= 0)) { Alert.alert("Invalid Amount", "Please enter a valid amount."); return; }
    doUpdate("completed", amount, isMeter ? meterDistance : undefined, isMeter ? meterFare : undefined);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.gold} size="large" /></View>;
  if (!booking) return (
    <View style={styles.center}>
      <Text style={styles.emptyText}>Booking not found</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>Go Back</Text></TouchableOpacity>
    </View>
  );

  const currentActions = actions[booking.status] || [];
  const isCash = booking.paymentMethod === "cash";
  const isInvoice = booking.paymentMethod === "invoice";
  const isInProgress = booking.status === "in-progress";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.navy }}>
      <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.statusValue}>{booking.status.toUpperCase()}</Text>
            {booking.isRecurring && (<View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(168,85,247,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Ionicons name="repeat" size={12} color="#A855F7" /><Text style={{ color: "#A855F7", fontSize: 10, fontWeight: "800" }}>RECURRING</Text>
            </View>)}
          </View>
        </View>

        <PaymentCard booking={booking} />
        <CustomerCard booking={booking} onCall={() => booking.phone && Linking.openURL(`tel:${booking.phone}`)} />
        <TripCard booking={booking} currentStopIndex={currentStopIndex}
          onNextStop={() => setCurrentStopIndex((i) => i + 1)} />
        <RideInfoCard booking={booking} />
        {booking.fareType === "meter" && isInProgress && !isInvoice && (
          <MeterCard meterRunning={meterRunning} meterDistance={meterDistance}
            meterFare={meterFare} onStart={startMeter} onStop={stopMeter} />
        )}
        <NotesCard booking={booking} />

        {isInvoice && isInProgress && (
          <View style={{ backgroundColor: "rgba(168,85,247,0.1)", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(168,85,247,0.2)" }}>
            <Text style={{ color: "#A855F7", fontSize: 12, fontWeight: "700", textAlign: "center" }}>Invoice Payment — No cash collection needed</Text>
          </View>
        )}
        {isInProgress && isCash && !isInvoice && (
          <CashInputCard booking={booking} cashAmount={cashAmount} setCashAmount={setCashAmount}
            onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)} />
        )}

        <ActionButtons actions={currentActions} updating={updating} onAction={handleAction} />

        {isInProgress && <CompleteButton updating={updating} onComplete={handleComplete} />}

        <View style={{ height: isInProgress && isCash && !isInvoice ? 400 : 30 }} />
      </ScrollView>
    </View>
  );
}
