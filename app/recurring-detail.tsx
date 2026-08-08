import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { getRecurringTemplates } from "@/src/lib/api";
import { s, statusColors } from "@/src/styles/recurringDetail";

interface RideHistory { id: string; status: string; date: string; time: string; fare: number }
interface Template {
  id: string; name: string; phone: string;
  pickup: string; dropoff: string; time: string;
  fare: number; distance: number; days: string; vehicle: string;
  customer?: { companyName: string | null };
  bookings?: RideHistory[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RecurringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getRecurringTemplates();
      if (res.success) {
        const found = (res.templates || []).find((t: Template) => t.id === id);
        if (found) setTemplate(found);
      }
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.gold} size="large" /></View>;
  if (!template) return (
    <View style={s.center}>
      <Text style={{ color: COLORS.gray400, fontSize: 16 }}>Not found</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
        <Text style={{ color: COLORS.gold, fontWeight: "700" }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const days: string[] = (() => { try { return JSON.parse(template.days); } catch { return []; } })();
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRide = template.bookings?.find((b) => b.date === todayStr);
  const pastRides = (template.bookings || []).filter((b) => b.date !== todayStr);
  const completedCount = (template.bookings || []).filter((b) => b.status === "completed").length;
  const totalRides = (template.bookings || []).length;

  const renderRide = (r: RideHistory, showChevron = true) => {
    const sc = statusColors[r.status] || { bg: "rgba(150,150,150,0.15)", text: COLORS.gray500 };
    return (
      <TouchableOpacity key={r.id} activeOpacity={0.7}
        onPress={() => router.push(`/booking-detail?id=${r.id}`)}
        style={[s.rideCard, { marginBottom: 8 }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.rideDate}>{r.date} at {r.time}</Text>
          <Text style={s.rideFare}>£{r.fare.toFixed(2)}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[s.statusText, { color: sc.text }]}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</Text>
        </View>
        {showChevron && <Ionicons name="chevron-forward" size={18} color={COLORS.gray500} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.navy }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: Platform.OS === "ios" ? 60 : 40 }}>
        <TouchableOpacity onPress={() => router.back()} style={s.backRow}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          <Text style={s.backLabel}>Recurring Details</Text>
        </TouchableOpacity>

        <View style={s.headerCard}>
          <View style={s.headerTop}>
            <Text style={s.name}>{template.name}</Text>
            <View style={s.recurBadge}>
              <Ionicons name="repeat" size={12} color="#A855F7" />
              <Text style={s.recurText}>RECURRING</Text>
            </View>
          </View>
          {template.customer?.companyName && <Text style={s.company}>{template.customer.companyName}</Text>}
          <Text style={s.phone}>{template.phone}</Text>
        </View>

        <View style={s.card}>
          <View style={s.routeRow}>
            <View style={[s.routeDot, { backgroundColor: COLORS.green }]} />
            <View style={{ flex: 1 }}><Text style={s.routeLabel}>Pickup</Text><Text style={s.routeText}>{template.pickup}</Text></View>
          </View>
          <View style={s.routeRow}>
            <View style={[s.routeDot, { backgroundColor: COLORS.crimson }]} />
            <View style={{ flex: 1 }}><Text style={s.routeLabel}>Drop-off</Text><Text style={s.routeText}>{template.dropoff}</Text></View>
          </View>
          <View style={s.infoRow}>
            <View style={s.infoItem}><Ionicons name="time-outline" size={14} color={COLORS.gray500} /><Text style={s.infoText}>{template.time}</Text></View>
            <View style={s.infoItem}><Ionicons name="car-outline" size={14} color={COLORS.gray500} /><Text style={s.infoText}>{template.vehicle.toUpperCase()}</Text></View>
            <View style={s.infoItem}><Text style={s.fare}>£{template.fare.toFixed(2)}</Text></View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Schedule</Text>
          <View style={s.daysRow}>
            {DAY_LABELS.map((d) => {
              const active = days.some((day) => day.toLowerCase().startsWith(d.toLowerCase()));
              return (
                <View key={d} style={[s.dayChip, active ? s.dayActive : s.dayInactive]}>
                  <Text style={[s.dayText, { color: active ? COLORS.gold : "rgba(255,255,255,0.2)" }]}>{d}</Text>
                </View>
              );
            })}
          </View>
          <Text style={s.statsText}>{completedCount}/{totalRides} rides completed</Text>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Today&apos;s Ride</Text>
          {todayRide ? renderRide(todayRide) : <Text style={s.noRide}>No ride generated for today</Text>}
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Ride History</Text>
          {pastRides.length === 0 ? <Text style={s.noRide}>No past rides yet</Text> : pastRides.map((r) => renderRide(r))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}
