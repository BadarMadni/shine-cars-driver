import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import styles from "@/src/styles/bookingDetail";

function openNavigation(address: string) {
  const e = encodeURIComponent(address);
  const url = Platform.OS === "ios" ? `maps:?daddr=${e}&dirflg=d` : `google.navigation:q=${e}&mode=d`;
  Linking.canOpenURL(url).then((ok) => Linking.openURL(ok ? url : `https://www.google.com/maps/dir/?api=1&destination=${e}&travelmode=driving`));
}

interface Booking {
  id: string; name: string; phone: string;
  pickup: string; dropoff: string; stops?: string | null;
  date: string; time: string;
  distance: number; fare: number;
  status: string; vehicle: string;
  paymentMethod?: string; paymentStatus?: string;
  notes?: string | null;
}

export function PaymentCard({ booking }: { booking: Booking }) {
  const isCash = booking.paymentMethod === "cash";
  const isCard = booking.paymentMethod === "card";
  const isPaid = booking.paymentStatus === "paid";
  return (
    <View style={[styles.card, isCard && isPaid ? styles.paidCard : isCash ? styles.cashCard : null]}>
      <Text style={styles.cardTitle}>Payment</Text>
      <View style={styles.paymentRow}>
        <Ionicons name={isCard ? "card-outline" : "cash-outline"} size={20} color={isCard ? "#06B6D4" : COLORS.gold} />
        <Text style={styles.paymentMethod}>{isCard ? "Card Payment" : "Cash Payment"}</Text>
      </View>
      {isCard && isPaid ? (
        <View style={styles.paidBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
          <Text style={styles.paidText}>Paid by Card</Text>
        </View>
      ) : isCard ? (
        <Text style={styles.paymentNote}>Payment will be confirmed on completion</Text>
      ) : (
        <View style={styles.cashBadge}>
          <Ionicons name="alert-circle" size={16} color={COLORS.gold} />
          <Text style={styles.cashText}>Collect £{booking.fare.toFixed(2)} cash from customer</Text>
        </View>
      )}
    </View>
  );
}

export function CustomerCard({ booking, onCall }: { booking: Booking; onCall: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Customer</Text>
      <View style={styles.infoRow}>
        <Ionicons name="person" size={16} color={COLORS.gold} />
        <Text style={styles.infoText}>{booking.name}</Text>
      </View>
      <TouchableOpacity onPress={onCall} style={styles.infoRow}>
        <Ionicons name="call" size={16} color={COLORS.green} />
        <Text style={[styles.infoText, { color: COLORS.green }]}>{booking.phone}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function TripCard({ booking, currentStopIndex, onNextStop }: {
  booking: Booking; currentStopIndex?: number; onNextStop?: () => void;
}) {
  const parsedStops: string[] = booking.stops ? (() => { try { return JSON.parse(booking.stops); } catch { return []; } })() : [];
  const showNav = ["accepted", "arrived", "in-progress"].includes(booking.status);
  const stopIdx = currentStopIndex ?? 0;

  let navTo = booking.dropoff;
  let navLabel = "Navigate to Drop-off";
  if (booking.status === "accepted") {
    navTo = booking.pickup;
    navLabel = "Navigate to Pickup";
  } else if (parsedStops.length > 0 && stopIdx < parsedStops.length) {
    navTo = parsedStops[stopIdx];
    navLabel = `Navigate to Stop ${stopIdx + 1}`;
  }

  const TripPoint = ({ color, label, address }: { color: string; label: string; address: string }) => (
    <View style={styles.tripRow}>
      <View style={[styles.tripDot, { backgroundColor: color }]} />
      <View style={styles.tripInfo}><Text style={styles.tripLabel}>{label}</Text><Text style={styles.tripAddress}>{address}</Text></View>
    </View>
  );
  const showNext = showNav && parsedStops.length > 0 && stopIdx < parsedStops.length && booking.status !== "accepted" && onNextStop;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Trip Details</Text>
      <TripPoint color={COLORS.green} label="Pickup" address={booking.pickup} />
      {parsedStops.map((stop, i) => (
        <View key={i}><View style={styles.tripLine} /><TripPoint color={i === stopIdx && booking.status !== "accepted" ? "#F59E0B" : "#D4A017"} label={`Stop ${i + 1}`} address={stop} /></View>
      ))}
      <View style={styles.tripLine} />
      <TripPoint color={COLORS.crimson} label="Drop-off" address={booking.dropoff} />
      {showNav && (
        <TouchableOpacity activeOpacity={0.8} onPress={() => openNavigation(navTo)} style={styles.navBtn}>
          <Ionicons name="navigate" size={18} color={COLORS.white} /><Text style={styles.navBtnText}>{navLabel}</Text>
        </TouchableOpacity>
      )}
      {showNext && (
        <TouchableOpacity activeOpacity={0.8} onPress={onNextStop} style={[styles.navBtn, { backgroundColor: "#F59E0B", marginTop: 8 }]}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
          <Text style={styles.navBtnText}>{stopIdx < parsedStops.length - 1 ? `Done — Next Stop ${stopIdx + 2}` : "Done — Head to Drop-off"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function RideInfoCard({ booking }: { booking: Booking }) {
  const items: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }[] = [
    { icon: "calendar-outline", value: booking.date, label: "Date" },
    { icon: "time-outline", value: booking.time, label: "Time" },
    { icon: "speedometer-outline", value: `${booking.distance?.toFixed(1) || "—"} mi`, label: "Distance" },
    { icon: "cash-outline", value: `£${booking.fare.toFixed(2)}`, label: "Fare" },
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ride Info</Text>
      <View style={styles.rideGrid}>
        {items.map((it) => (
          <View key={it.label} style={styles.rideItem}>
            <Ionicons name={it.icon} size={18} color={COLORS.gold} />
            <Text style={styles.rideValue}>{it.value}</Text>
            <Text style={styles.rideLabel}>{it.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function NotesCard({ booking }: { booking: Booking }) {
  const t = booking.notes?.startsWith("stripe:") ? null : booking.notes;
  if (!t) return null;
  return (<View style={styles.card}><Text style={styles.cardTitle}>Notes from Dispatcher</Text><View style={styles.infoRow}><Ionicons name="document-text-outline" size={16} color={COLORS.gold} /><Text style={[styles.infoText, { flex: 1 }]}>{t}</Text></View></View>);
}

export function CashInputCard({
  booking, cashAmount, setCashAmount,
}: { booking: Booking; cashAmount: string; setCashAmount: (v: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Cash Collected</Text>
      <View style={styles.cashInputRow}>
        <Text style={styles.currencySign}>£</Text>
        <TextInput
          style={styles.cashInput}
          value={cashAmount}
          onChangeText={setCashAmount}
          placeholder={booking.fare.toFixed(2)}
          placeholderTextColor={COLORS.gray500}
          keyboardType="decimal-pad"
        />
      </View>
      <Text style={styles.cashHint}>Enter amount received from customer</Text>
    </View>
  );
}

interface ActionButton {
  label: string; next: string; icon: string; color: string;
}

export function ActionButtons({
  actions, updating, onAction,
}: { actions: ActionButton[]; updating: boolean; onAction: (next: string) => void }) {
  if (actions.length === 0) return null;
  return (
    <View style={styles.actionsWrap}>
      {actions.map((a) => (
        <TouchableOpacity key={a.next} activeOpacity={0.8}
          onPress={() => onAction(a.next)} disabled={updating}
          style={[styles.actionBtn, { backgroundColor: a.color }]}>
          {updating ? <ActivityIndicator color={COLORS.white} /> : (
            <>
              <Ionicons name={a.icon as keyof typeof Ionicons.glyphMap} size={20} color={COLORS.white} />
              <Text style={styles.actionText}>{a.label}</Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function CompleteButton({ updating, onComplete }: { updating: boolean; onComplete: () => void }) {
  return (
    <View style={styles.actionsWrap}>
      <TouchableOpacity activeOpacity={0.8} onPress={onComplete} disabled={updating} style={[styles.actionBtn, { backgroundColor: COLORS.green }]}>
        {updating ? <ActivityIndicator color={COLORS.white} /> : (<><Ionicons name="checkmark-done-circle" size={20} color={COLORS.white} /><Text style={styles.actionText}>Complete Trip</Text></>)}
      </TouchableOpacity>
    </View>
  );
}
