import { useEffect, useState, useMemo } from "react";
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/src/constants/theme";
import { getBookings } from "@/src/lib/api";
import ReportFilters, { Filters } from "@/src/components/ReportFilters";
import ReportCard from "@/src/components/ReportCard";

interface Booking {
  id: string; pickup: string; dropoff: string; date: string; time: string;
  fare: number; meterFare?: number | null; fareType?: string; vehicle: string;
  paymentMethod: string; paymentStatus: string; isRecurring?: boolean;
}

function parseDate(dateStr: string): Date {
  // Handle DD/MM/YYYY format
  const parts = dateStr.split("/");
  if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  return new Date(dateStr);
}

export default function ReportsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [filters, setFilters] = useState<Filters>({
    startDate: thirtyDaysAgo, endDate: new Date(),
    type: "all", payment: "all", status: "all",
  });

  const load = async () => {
    try {
      const res = await getBookings("completed");
      const all = (res.bookings || []).filter((b: Booking) => b.status === "completed");
      setBookings(all);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const d = parseDate(b.date);
      if (d < filters.startDate || d > filters.endDate) return false;
      if (filters.type === "recurring" && !b.isRecurring) return false;
      if (filters.type === "regular" && b.isRecurring) return false;
      if (filters.payment !== "all" && b.paymentMethod !== filters.payment) return false;
      if (filters.status !== "all" && b.paymentStatus !== filters.status) return false;
      return true;
    });
  }, [bookings, filters]);

  const totalEarnings = filtered.reduce((s, b) => s + (b.meterFare || b.fare), 0);
  const cashEarnings = filtered.filter((b) => b.paymentMethod === "cash").reduce((s, b) => s + (b.meterFare || b.fare), 0);
  const cardEarnings = filtered.filter((b) => b.paymentMethod === "card").reduce((s, b) => s + (b.meterFare || b.fare), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.navy }}
      contentContainerStyle={{ padding: 20, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}>

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{
          width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)",
          justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        }}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: "800", marginLeft: 14 }}>Reports</Text>
      </View>

      {/* Summary Cards */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <SummaryCard label="Total" value={`£${totalEarnings.toFixed(2)}`} count={filtered.length} color={COLORS.crimson} bg="rgba(204,34,41,0.1)" />
        <SummaryCard label="Cash" value={`£${cashEarnings.toFixed(2)}`} count={filtered.filter((b) => b.paymentMethod === "cash").length} color={COLORS.gold} bg="rgba(245,166,35,0.1)" />
        <SummaryCard label="Card" value={`£${cardEarnings.toFixed(2)}`} count={filtered.filter((b) => b.paymentMethod === "card").length} color="#3B82F6" bg="rgba(59,130,246,0.1)" />
      </View>

      {/* Filters */}
      <ReportFilters filters={filters} onChange={setFilters} />

      {/* Results */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 8 }}>
        <Text style={{ color: COLORS.gray500, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
          {filtered.length} RIDE{filtered.length !== 1 ? "S" : ""}
        </Text>
        <Text style={{ color: COLORS.gold, fontSize: 13, fontWeight: "800" }}>
          £{totalEarnings.toFixed(2)}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.1)" />
          <Text style={{ color: COLORS.gray500, fontSize: 14, marginTop: 12 }}>No rides found</Text>
        </View>
      ) : (
        filtered.map((b) => <ReportCard key={b.id} booking={b} />)
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value, count, color, bg }: {
  label: string; value: string; count: number; color: string; bg: string;
}) {
  return (
    <View style={{
      flex: 1, backgroundColor: bg, borderRadius: 16, padding: 14,
      borderWidth: 1, borderColor: `${color}22`,
    }}>
      <Text style={{ color, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 6 }}>{label.toUpperCase()}</Text>
      <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}>{value}</Text>
      <Text style={{ color: COLORS.gray500, fontSize: 11, marginTop: 4 }}>{count} rides</Text>
    </View>
  );
}
