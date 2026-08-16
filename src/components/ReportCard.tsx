import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

interface Booking {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  fare: number;
  meterFare?: number | null;
  fareType?: string;
  vehicle: string;
  paymentMethod: string;
  paymentStatus: string;
  isRecurring?: boolean;
}

export default function ReportCard({ booking: b }: { booking: Booking }) {
  const finalFare = b.meterFare || b.fare;
  const isPaid = b.paymentStatus === "paid";

  return (
    <View style={{
      backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16,
      padding: 16, marginBottom: 10, borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}>
          £{finalFare.toFixed(2)}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {b.isRecurring && (
            <View style={{ backgroundColor: "rgba(168,85,247,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: "#A855F7", fontSize: 10, fontWeight: "700" }}>RECURRING</Text>
            </View>
          )}
          <View style={{
            backgroundColor: isPaid ? "rgba(34,197,94,0.15)" : "rgba(245,166,35,0.15)",
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
          }}>
            <Text style={{ color: isPaid ? COLORS.green : COLORS.gold, fontSize: 10, fontWeight: "700" }}>
              {b.paymentStatus.toUpperCase()}
            </Text>
          </View>
          <View style={{
            backgroundColor: b.paymentMethod === "card" ? "rgba(59,130,246,0.15)" : "rgba(245,166,35,0.15)",
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
          }}>
            <Text style={{ color: b.paymentMethod === "card" ? "#3B82F6" : COLORS.gold, fontSize: 10, fontWeight: "700" }}>
              {b.paymentMethod.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green }} />
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, flex: 1 }} numberOfLines={1}>
          {b.pickup}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.crimson }} />
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, flex: 1 }} numberOfLines={1}>
          {b.dropoff}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.gray500} />
          <Text style={{ color: COLORS.gray500, fontSize: 11, fontWeight: "500" }}>{b.date}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={12} color={COLORS.gray500} />
          <Text style={{ color: COLORS.gray500, fontSize: 11, fontWeight: "500" }}>{b.time}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="car-outline" size={12} color={COLORS.gray500} />
          <Text style={{ color: COLORS.gray500, fontSize: 11, fontWeight: "500" }}>{b.vehicle.toUpperCase()}</Text>
        </View>
        {b.fareType === "meter" && (
          <View style={{ backgroundColor: "rgba(249,115,22,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ color: COLORS.orange, fontSize: 9, fontWeight: "700" }}>METER</Text>
          </View>
        )}
      </View>
    </View>
  );
}
