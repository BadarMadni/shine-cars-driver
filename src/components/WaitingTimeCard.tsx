import { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import styles from "@/src/styles/bookingDetail";

const FREE_MINUTES = 5;
const CHARGE_PER_MIN = 0.5;

interface WaitingTimeCardProps {
  onChargeChange: (charge: number) => void;
}

export default function WaitingTimeCard({ onChargeChange }: WaitingTimeCardProps) {
  const [elapsed, setElapsed] = useState(0); // seconds
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const totalMinutes = Math.floor(elapsed / 60);
  const chargeableMinutes = Math.max(0, totalMinutes - FREE_MINUTES);
  const charge = chargeableMinutes * CHARGE_PER_MIN;
  const freeRemaining = Math.max(0, FREE_MINUTES * 60 - elapsed);
  const isFreePhase = elapsed < FREE_MINUTES * 60;

  useEffect(() => {
    onChargeChange(charge);
  }, [charge]);

  const stopWaiting = () => {
    setRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.card, { borderColor: "#F97316", borderWidth: 1 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Waiting Time</Text>
        {running && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isFreePhase ? "#22C55E" : "#F97316" }} />
            <Text style={{ fontSize: 10, color: isFreePhase ? "#22C55E" : "#F97316", fontWeight: "700" }}>
              {isFreePhase ? "FREE" : "CHARGING"}
            </Text>
          </View>
        )}
        {!running && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gray400 }} />
            <Text style={{ fontSize: 10, color: COLORS.gray400, fontWeight: "700" }}>STOPPED</Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
        <View style={{ alignItems: "center" }}>
          <Ionicons name="time-outline" size={22} color={COLORS.gold} />
          <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 4 }}>
            {formatTime(elapsed)}
          </Text>
          <Text style={{ color: COLORS.gray400, fontSize: 10 }}>total wait</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Ionicons name="cash-outline" size={22} color={charge > 0 ? "#F97316" : COLORS.gold} />
          <Text style={{ color: charge > 0 ? "#F97316" : COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 4 }}>
            £{charge.toFixed(2)}
          </Text>
          <Text style={{ color: COLORS.gray400, fontSize: 10 }}>charge</Text>
        </View>
      </View>

      {isFreePhase && running && (
        <View style={{ backgroundColor: "rgba(34,197,94,0.1)", borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" }}>
          <Text style={{ color: "#22C55E", fontSize: 12, fontWeight: "700", textAlign: "center" }}>
            Free waiting: {formatTime(freeRemaining)} remaining
          </Text>
        </View>
      )}

      {!isFreePhase && running && (
        <View style={{ backgroundColor: "rgba(249,115,22,0.1)", borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "rgba(249,115,22,0.2)" }}>
          <Text style={{ color: "#F97316", fontSize: 12, fontWeight: "700", textAlign: "center" }}>
            £0.50/min — {chargeableMinutes} min charged
          </Text>
        </View>
      )}

      {running ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={stopWaiting}
          disabled={isFreePhase}
          style={{
            backgroundColor: isFreePhase ? COLORS.gray500 : "#EF4444",
            paddingVertical: 14, borderRadius: 12,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: isFreePhase ? 0.5 : 1,
          }}>
          <Ionicons name="stop-circle" size={22} color={COLORS.white} />
          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 15 }}>
            {isFreePhase ? "Stop (available after 5 min)" : "Customer Arrived — Stop"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ backgroundColor: "rgba(156,163,175,0.1)", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(156,163,175,0.2)" }}>
          <Text style={{ color: COLORS.gray400, fontWeight: "700", fontSize: 14 }}>
            Waiting stopped — {charge > 0 ? `£${charge.toFixed(2)} will be added` : "No charge"}
          </Text>
        </View>
      )}
    </View>
  );
}
