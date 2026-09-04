import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BookingAlertProvider } from "@/src/context/BookingAlertContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#0F1629" }}>
          <StatusBar style="light" />
          <BookingAlertProvider>
            <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: "#0F1629" } }} />
          </BookingAlertProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
