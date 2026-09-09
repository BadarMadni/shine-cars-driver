import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Alert, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BookingAlertProvider } from "@/src/context/BookingAlertContext";

// Catch unhandled JS errors and show them in an Alert
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
  Alert.alert(
    isFatal ? "Fatal Error" : "Error",
    error?.message || String(error),
    [{ text: "OK" }]
  );
  if (originalHandler) originalHandler(error, isFatal);
});

export default function RootLayout() {
  useEffect(() => {
    // Also catch unhandled promise rejections
    const handler = (id: string, error: Error) => {
      console.error("Unhandled rejection:", error);
      Alert.alert("Promise Error", error?.message || String(error));
    };
    // @ts-ignore
    if (global.HermesInternal) {
      // Hermes engine
      require("promise/setimmediate/rejection-tracking").enable({ allRejections: true, onUnhandled: handler });
    }
  }, []);

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
