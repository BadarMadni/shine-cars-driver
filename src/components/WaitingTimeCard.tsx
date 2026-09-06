import { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import styles from "@/src/styles/bookingDetail";

const FREE_MINUTES = 5;
const CHARGE_PER_MIN = 0.5;

interface WaitingTimeCardProps {
  onChargeChange: (charge: number) => void;
}

export default function WaitingTimeCard({ onChargeChange }: WaitingTimeCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (!running) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [running]);

  const totalMinutes = Math.floor(elapsed / 60);
  const chargeableMinutes = Math.max(0, totalMinutes - FREE_MINUTES);
  const charge = chargeableMinutes * CHARGE_PER_MIN;
  const freeRemaining = Math.max(0, FREE_MINUTES * 60 - elapsed);
  const isFreePhase = elapsed < FREE_MINUTES * 60;
  const freeProgress = Math.min(1, elapsed / (FREE_MINUTES * 60));

  useEffect(() => { onChargeChange(charge); }, [charge]);

  const stopWaiting = () => {
    setRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const statusColor = !running ? COLORS.gray400 : isFreePhase ? "#22C55E" : "#F97316";

  return (
    <View style={[styles.card, { borderColor: statusColor, borderWidth: 1 }]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: `${statusColor}18`,
            alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="hourglass-outline" size={15} color={statusColor} />
          </View>
          <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Waiting Time</Text>
        </View>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 5,
          backgroundColor: `${statusColor}12`,
          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
        }}>
          <Animated.View style={{
            width: 6, height: 6, borderRadius: 3,
            backgroundColor: statusColor,
            opacity: running ? pulseAnim : 1,
          }} />
          <Text style={{ fontSize: 9, color: statusColor, fontWeight: "800", letterSpacing: 0.5 }}>
            {!running ? "STOPPED" : isFreePhase ? "FREE" : "CHARGING"}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={{
        flexDirection: "row", justifyContent: "space-around", marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, paddingVertical: 12,
      }}>
        <View style={{ alignItems: "center" }}>
          <Ionicons name="time-outline" size={20} color={COLORS.gold} />
          <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 4, fontVariant: ["tabular-nums"] }}>
            {formatTime(elapsed)}
          </Text>
          <Text style={{ color: COLORS.gray400, fontSize: 9, fontWeight: "600", letterSpacing: 0.5, marginTop: 2 }}>ELAPSED</Text>
        </View>
        <View style={{ width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.08)", alignSelf: "center" }} />
        <View style={{ alignItems: "center" }}>
          <Ionicons name="cash-outline" size={20} color={charge > 0 ? "#F97316" : COLORS.gold} />
          <Text style={{ color: charge > 0 ? "#F97316" : COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 4 }}>
            £{charge.toFixed(2)}
          </Text>
          <Text style={{ color: COLORS.gray400, fontSize: 9, fontWeight: "600", letterSpacing: 0.5, marginTop: 2 }}>CHARGE</Text>
        </View>
      </View>

      {/* Progress bar — free phase */}
      {isFreePhase && running && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ height: 5, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <View style={{ height: "100%", backgroundColor: "#22C55E", borderRadius: 3, width: `${freeProgress * 100}%` }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
            <Text style={{ color: "#22C55E", fontSize: 10, fontWeight: "600" }}>Free waiting</Text>
            <Text style={{ color: "#22C55E", fontSize: 10, fontWeight: "600" }}>{formatTime(freeRemaining)} left</Text>
          </View>
        </View>
      )}

      {/* Charging info */}
      {!isFreePhase && running && (
        <View style={{
          backgroundColor: "rgba(249,115,22,0.08)", borderRadius: 10, padding: 9, marginBottom: 12,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Ionicons name="flash" size={13} color="#F97316" />
          <Text style={{ color: "#F97316", fontSize: 11, fontWeight: "700" }}>
            £0.50/min — {chargeableMinutes} {chargeableMinutes === 1 ? "min" : "mins"} charged
          </Text>
        </View>
      )}

      {/* Stopped summary */}
      {!running && (
        <View style={{
          backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12, marginBottom: 12,
          alignItems: "center", gap: 3,
        }}>
          <Ionicons name="checkmark-circle" size={18} color={charge > 0 ? "#F97316" : "#22C55E"} />
          <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "700" }}>
            {charge > 0 ? `£${charge.toFixed(2)} will be added to fare` : "No waiting charge"}
          </Text>
          <Text style={{ color: COLORS.gray400, fontSize: 10 }}>
            Waited {formatTime(elapsed)}
          </Text>
        </View>
      )}

      {/* Button */}
      {running && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={stopWaiting}
          disabled={isFreePhase}
          style={{
            backgroundColor: isFreePhase ? "rgba(255,255,255,0.06)" : "#EF4444",
            paddingVertical: 14, borderRadius: 12,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: isFreePhase ? 0.5 : 1,
            ...(isFreePhase ? {} : {
              shadowColor: "#EF4444",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
            }),
          }}>
          <Ionicons
            name={isFreePhase ? "time-outline" : "person-outline"}
            size={20}
            color={isFreePhase ? COLORS.gray500 : COLORS.white}
          />
          <Text style={{ color: isFreePhase ? COLORS.gray500 : COLORS.white, fontWeight: "700", fontSize: 14 }}>
            {isFreePhase ? `Available after ${formatTime(freeRemaining)}` : "Customer Arrived — Stop"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
