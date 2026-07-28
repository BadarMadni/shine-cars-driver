import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { getToken, getDriver } from "@/src/lib/auth";
import { COLORS } from "@/src/constants/theme";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 4, useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      const token = await getToken();
      const driver = await getDriver() as { status?: string } | null;
      if (!token) {
        router.replace("/login");
      } else if (driver?.status === "pending") {
        router.replace("/pending");
      } else {
        router.replace("/(tabs)");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Image source={require("@/assets/logo.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Shine Cars</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>Driver</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120, borderRadius: 24 },
  title: { color: COLORS.white, fontSize: 32, fontWeight: "800", marginTop: 20 },
  subtitle: { color: COLORS.gold, fontSize: 18, fontWeight: "600", marginTop: 4 },
});
