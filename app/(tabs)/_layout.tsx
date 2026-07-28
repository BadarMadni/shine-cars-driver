import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { COLORS } from "@/src/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.navy,
        borderTopColor: "rgba(255,255,255,0.1)",
        height: Platform.OS === "ios" ? 88 : 68,
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
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
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
