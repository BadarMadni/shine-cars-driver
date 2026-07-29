import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { useBookingPolling } from "@/src/hooks/useBookingPolling";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { assignedCount } = useBookingPolling();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.navy,
        borderTopColor: "rgba(255,255,255,0.1)",
        height: 56 + bottomPad,
        paddingBottom: bottomPad,
        paddingTop: 8,
      },
      tabBarActiveTintColor: COLORS.crimson,
      tabBarInactiveTintColor: COLORS.gray400,
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
    }}>
      <Tabs.Screen name="index" options={{
        title: "Dashboard",
        tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="bookings" options={{
        title: "Bookings",
        tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        tabBarBadge: assignedCount > 0 ? assignedCount : undefined,
        tabBarBadgeStyle: {
          backgroundColor: COLORS.crimson,
          color: COLORS.white,
          fontSize: 10,
          fontWeight: "700",
          minWidth: 18,
          height: 18,
          lineHeight: 18,
          borderRadius: 9,
        },
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
