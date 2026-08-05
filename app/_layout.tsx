import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#0F1629" }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: "#0F1629" } }} />
      </View>
    </SafeAreaProvider>
  );
}
