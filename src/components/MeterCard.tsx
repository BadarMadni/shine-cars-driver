import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import styles from "@/src/styles/bookingDetail";

export default function MeterCard({ meterRunning, meterDistance, meterFare, onStart, onStop }: {
  meterRunning: boolean; meterDistance: number; meterFare: number;
  onStart: () => void; onStop: () => void;
}) {
  return (
    <View style={[styles.card, { borderColor: "#F97316", borderWidth: 1 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Live Meter</Text>
        {meterRunning && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" }} />
            <Text style={{ fontSize: 10, color: "#22C55E", fontWeight: "700" }}>RUNNING</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
        <View style={{ alignItems: "center" }}>
          <Ionicons name="speedometer-outline" size={22} color={COLORS.gold} />
          <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 4 }}>{meterDistance.toFixed(1)}</Text>
          <Text style={{ color: COLORS.gray400, fontSize: 10 }}>miles</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Ionicons name="cash-outline" size={22} color={COLORS.gold} />
          <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: "800", marginTop: 4 }}>£{meterFare.toFixed(2)}</Text>
          <Text style={{ color: COLORS.gray400, fontSize: 10 }}>fare</Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={meterRunning ? onStop : onStart}
        style={{
          backgroundColor: meterRunning ? "#EF4444" : "#22C55E",
          paddingVertical: 14, borderRadius: 12,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
        <Ionicons name={meterRunning ? "stop-circle" : "play-circle"} size={22} color={COLORS.white} />
        <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 15 }}>
          {meterRunning ? "Stop Meter" : "Start Meter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
