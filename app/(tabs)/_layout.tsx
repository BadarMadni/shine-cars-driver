import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { useBookingPolling } from "@/src/hooks/useBookingPolling";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { updateBookingStatus } from "@/src/lib/api";
import BookingAlertModal from "@/src/components/BookingAlertModal";

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={{
      alignItems: "center", justifyContent: "center",
      ...(focused ? {
        backgroundColor: "rgba(204,34,41,0.1)",
        width: 48, height: 32, borderRadius: 16,
      } : {}),
    }}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const { assignedCount, alertBooking, dismissAlert } = useBookingPolling();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomPad = Math.max(insets.bottom, 10);

  const handleAccept = async (id: string) => {
    dismissAlert();
    try { await updateBookingStatus(id, "accepted"); } catch {}
    router.push(`/booking-detail?id=${id}`);
  };

  const handleReject = async (id: string) => {
    dismissAlert();
    try { await updateBookingStatus(id, "cancelled"); } catch {}
  };

  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.06)",
          height: 64 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.crimson,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 4, letterSpacing: 0.2 },
      }}>
        <Tabs.Screen name="index" options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "grid" : "grid-outline"} color={color} focused={focused} />,
        }} />
        <Tabs.Screen name="bookings" options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "document-text" : "document-text-outline"} color={color} focused={focused} />,
          tabBarBadge: assignedCount > 0 ? assignedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.crimson, color: COLORS.white,
            fontSize: 10, fontWeight: "700", minWidth: 18, height: 18,
            lineHeight: 18, borderRadius: 9,
          },
        }} />
        <Tabs.Screen name="recurring" options={{
          title: "Recurring",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "repeat" : "repeat-outline"} color={color} focused={focused} />,
        }} />
        <Tabs.Screen name="profile" options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />,
        }} />
      </Tabs>
      <BookingAlertModal
        booking={alertBooking}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
}
