import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

export interface Filters {
  startDate: Date;
  endDate: Date;
  type: "all" | "recurring" | "regular";
  payment: "all" | "cash" | "card";
  status: "all" | "paid" | "unpaid";
}

const chipStyle = (active: boolean) => ({
  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  backgroundColor: active ? "rgba(204,34,41,0.15)" : "rgba(255,255,255,0.05)",
  borderWidth: 1, borderColor: active ? "rgba(204,34,41,0.4)" : "rgba(255,255,255,0.08)",
});
const chipText = (active: boolean) => ({
  color: active ? COLORS.crimson : COLORS.gray500,
  fontSize: 12, fontWeight: "700" as const,
});

export default function ReportFilters({ filters, onChange }: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Date Range */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <TouchableOpacity onPress={() => setShowStart(true)} style={{
          flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 12,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        }}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gold} />
          <View>
            <Text style={{ color: COLORS.gray500, fontSize: 9, fontWeight: "600", letterSpacing: 1 }}>FROM</Text>
            <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: "700" }}>{fmt(filters.startDate)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEnd(true)} style={{
          flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 12,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        }}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.crimson} />
          <View>
            <Text style={{ color: COLORS.gray500, fontSize: 9, fontWeight: "600", letterSpacing: 1 }}>TO</Text>
            <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: "700" }}>{fmt(filters.endDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {(showStart || showEnd) && (
        <DateTimePicker
          value={showStart ? filters.startDate : filters.endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant="dark"
          onChange={(_, date) => {
            if (showStart) { setShowStart(false); if (date) onChange({ ...filters, startDate: date }); }
            else { setShowEnd(false); if (date) onChange({ ...filters, endDate: date }); }
          }}
        />
      )}

      {/* Type Filter */}
      <Text style={{ color: COLORS.gray500, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>TYPE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["all", "recurring", "regular"] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => onChange({ ...filters, type: t })} style={chipStyle(filters.type === t)}>
              <Text style={chipText(filters.type === t)}>{t === "all" ? "All" : t === "recurring" ? "Recurring" : "Regular"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Payment Method */}
      <Text style={{ color: COLORS.gray500, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>PAYMENT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["all", "cash", "card"] as const).map((p) => (
            <TouchableOpacity key={p} onPress={() => onChange({ ...filters, payment: p })} style={chipStyle(filters.payment === p)}>
              <Text style={chipText(filters.payment === p)}>{p === "all" ? "All" : p.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Payment Status */}
      <Text style={{ color: COLORS.gray500, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>STATUS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["all", "paid", "unpaid"] as const).map((s) => (
            <TouchableOpacity key={s} onPress={() => onChange({ ...filters, status: s })} style={chipStyle(filters.status === s)}>
              <Text style={chipText(filters.status === s)}>{s === "all" ? "All" : s.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
