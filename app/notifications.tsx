import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Platform, RefreshControl, Alert, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/src/constants/theme";
import { getNotifications, markNotificationsRead, clearNotifications } from "@/src/lib/api";

interface Notification {
  id: string; title: string; body: string;
  type: string; isRead: boolean; createdAt: string; data?: string;
}

const typeIcons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  booking: { name: "car", color: COLORS.gold },
  recurring: { name: "repeat", color: "#A855F7" },
  approval: { name: "checkmark-circle", color: COLORS.green },
  rejection: { name: "close-circle", color: COLORS.red },
  info: { name: "information-circle", color: "#3B82F6" },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setItems(res.notifications || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleTap = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      markNotificationsRead(n.id);
    }
    if (n.data) {
      try {
        const parsed = JSON.parse(n.data);
        if (parsed.bookingId) {
          router.push({ pathname: "/booking-detail", params: { id: parsed.bookingId } });
          return;
        }
      } catch {}
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markNotificationsRead();
  };

  const clearAll = () => {
    Alert.alert("Clear All", "Delete all notifications?", [
      { text: "Cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        await clearNotifications();
        setItems([]);
      }},
    ]);
  };

  const unread = items.filter((n) => !n.isRead).length;

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        {unread > 0 && <View style={s.badge}><Text style={s.badgeText}>{unread}</Text></View>}
        <View style={{ flex: 1 }} />
        {items.length > 0 && (
          <>
            <TouchableOpacity onPress={markAllRead} style={s.actionBtn}>
              <Ionicons name="checkmark-done" size={18} color={COLORS.gold} />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll} style={s.actionBtn}>
              <Ionicons name="trash-outline" size={18} color={COLORS.crimson} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}>
        {loading ? (
          <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
        ) : items.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray500} />
            <Text style={s.emptyText}>No notifications</Text>
          </View>
        ) : (
          items.map((n) => {
            const icon = typeIcons[n.type] || typeIcons.info;
            return (
              <TouchableOpacity key={n.id} activeOpacity={0.7} onPress={() => handleTap(n)}
                style={[s.card, !n.isRead && s.cardUnread]}>
                <View style={[s.iconWrap, { backgroundColor: icon.color + "15" }]}>
                  <Ionicons name={icon.name} size={20} color={icon.color} />
                </View>
                <View style={s.content}>
                  <View style={s.titleRow}>
                    <Text style={s.nTitle} numberOfLines={1}>{n.title}</Text>
                    {!n.isRead && <View style={s.dot} />}
                  </View>
                  <Text style={s.nBody} numberOfLines={2}>{n.body}</Text>
                  <Text style={s.time}>{timeAgo(n.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  backBtn: { padding: 4 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  badge: { backgroundColor: COLORS.crimson, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: "800" },
  actionBtn: { padding: 8 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { color: COLORS.gray500, fontSize: 15, marginTop: 12 },
  card: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 8, padding: 16,
    borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  cardUnread: { backgroundColor: "rgba(245,166,35,0.06)", borderColor: "rgba(245,166,35,0.15)" },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  content: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nTitle: { color: COLORS.white, fontSize: 14, fontWeight: "700", flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  nBody: { color: COLORS.gray400, fontSize: 13, marginTop: 4, lineHeight: 18 },
  time: { color: COLORS.gray500, fontSize: 11, marginTop: 6 },
});
