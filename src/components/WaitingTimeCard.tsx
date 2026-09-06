import { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

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
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Pulse animation for live dot
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
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const accentColor = !running ? COLORS.gray400 : isFreePhase ? "#22C55E" : "#F97316";

  return (
    <View style={{
      backgroundColor: "rgba(15,22,41,0.95)",
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: accentColor,
      overflow: "hidden",
    }}>
      {/* Gradient-like top accent bar */}
      <View style={{ height: 3, backgroundColor: accentColor }} />

      <View style={{ padding: 18 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: `${accentColor}20`,
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="hourglass-outline" size={18} color={accentColor} />
            </View>
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 }}>
              Waiting Time
            </Text>
          </View>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: `${accentColor}15`,
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
          }}>
            <Animated.View style={{
              width: 7, height: 7, borderRadius: 4,
              backgroundColor: accentColor,
              opacity: running ? pulseAnim : 1,
            }} />
            <Text style={{ fontSize: 10, color: accentColor, fontWeight: "800", letterSpacing: 1 }}>
              {!running ? "STOPPED" : isFreePhase ? "FREE" : "CHARGING"}
            </Text>
          </View>
        </View>

        {/* Timer display */}
        <View style={{
          flexDirection: "row", justifyContent: "center", alignItems: "center",
          marginBottom: 16, gap: 24,
        }}>
          {/* Time */}
          <View style={{ alignItems: "center" }}>
            <Text style={{
              color: COLORS.white, fontSize: 38, fontWeight: "900",
              fontVariant: ["tabular-nums"], letterSpacing: 2,
            }}>
              {formatTime(elapsed)}
            </Text>
            <Text style={{ color: COLORS.gray400, fontSize: 10, fontWeight: "600", letterSpacing: 1, marginTop: 2 }}>
              ELAPSED
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.1)" }} />

          {/* Charge */}
          <View style={{ alignItems: "center" }}>
            <Text style={{
              color: charge > 0 ? "#F97316" : COLORS.white,
              fontSize: 38, fontWeight: "900", letterSpacing: 1,
            }}>
              £{charge.toFixed(2)}
            </Text>
            <Text style={{ color: COLORS.gray400, fontSize: 10, fontWeight: "600", letterSpacing: 1, marginTop: 2 }}>
              CHARGE
            </Text>
          </View>
        </View>

        {/* Progress bar (free phase) */}
        {isFreePhase && running && (
          <View style={{ marginBottom: 14 }}>
            <View style={{
              height: 6, backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 3, overflow: "hidden",
            }}>
              <View style={{
                height: "100%", backgroundColor: "#22C55E",
                borderRadius: 3, width: `${freeProgress * 100}%`,
              }} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ color: "#22C55E", fontSize: 11, fontWeight: "700" }}>
                Free waiting
              </Text>
              <Text style={{ color: "#22C55E", fontSize: 11, fontWeight: "700" }}>
                {formatTime(freeRemaining)} left
              </Text>
            </View>
          </View>
        )}

        {/* Charging info */}
        {!isFreePhase && running && (
          <View style={{
            backgroundColor: "rgba(249,115,22,0.08)", borderRadius: 12,
            padding: 12, marginBottom: 14,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Ionicons name="flash" size={14} color="#F97316" />
            <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "700" }}>
              £0.50/min • {chargeableMinutes} {chargeableMinutes === 1 ? "min" : "mins"} charged
            </Text>
          </View>
        )}

        {/* Stopped summary */}
        {!running && (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12,
            padding: 14, marginBottom: 14, alignItems: "center",
            borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Ionicons name="checkmark-circle" size={20} color={charge > 0 ? "#F97316" : "#22C55E"} style={{ marginBottom: 4 }} />
            <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 14 }}>
              {charge > 0 ? `£${charge.toFixed(2)} will be added to fare` : "No waiting charge"}
            </Text>
            <Text style={{ color: COLORS.gray400, fontSize: 11, marginTop: 2 }}>
              Waited {formatTime(elapsed)} total
            </Text>
          </View>
        )}

        {/* Action button */}
        {running && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={stopWaiting}
            disabled={isFreePhase}
            style={{
              backgroundColor: isFreePhase ? "rgba(255,255,255,0.06)" : "#EF4444",
              paddingVertical: 15, borderRadius: 14,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: isFreePhase ? 0.6 : 1,
              ...(isFreePhase ? {} : {
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }),
            }}>
            <Ionicons
              name={isFreePhase ? "time-outline" : "person-outline"}
              size={20}
              color={isFreePhase ? COLORS.gray400 : COLORS.white}
            />
            <Text style={{
              color: isFreePhase ? COLORS.gray400 : COLORS.white,
              fontWeight: "700", fontSize: 15,
            }}>
              {isFreePhase ? `Available after ${formatTime(freeRemaining)}` : "Customer Arrived — Stop"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
