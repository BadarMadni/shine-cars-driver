import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

export default function ReportsButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={{
        marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "rgba(204,34,41,0.08)", borderRadius: 20, padding: 20,
        borderWidth: 1.5, borderColor: "rgba(204,34,41,0.2)",
      }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(204,34,41,0.15)",
          justifyContent: "center", alignItems: "center",
        }}>
          <Ionicons name="stats-chart" size={22} color={COLORS.crimson} />
        </View>
        <View>
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "800" }}>Earnings Report</Text>
          <Text style={{ color: COLORS.gray500, fontSize: 12, marginTop: 2 }}>View detailed ride earnings</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray500} />
    </TouchableOpacity>
  );
}
