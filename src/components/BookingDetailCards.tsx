import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import styles from "@/src/styles/bookingDetail";

interface Booking {
  id: string; name: string; phone: string;
  pickup: string; dropoff: string;
  date: string; time: string;
  distance: number; fare: number;
  status: string; vehicle: string;
  paymentMethod?: string; paymentStatus?: string;
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

export function TripCard({ booking }: { booking: Booking }) {
  return (
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
  );
}

export function RideInfoCard({ booking }: { booking: Booking }) {
  return (
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
  );
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
      <TouchableOpacity activeOpacity={0.8} onPress={onComplete} disabled={updating}
        style={[styles.actionBtn, { backgroundColor: COLORS.green }]}>
        {updating ? <ActivityIndicator color={COLORS.white} /> : (
          <>
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionText}>Complete Trip</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
