import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { registerDriver } from "@/src/lib/api";
import { saveToken, saveDriver, clearAuth } from "@/src/lib/auth";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await registerDriver({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        vehicleMake: vehicleMake.trim(),
        vehicleColor: vehicleColor.trim(),
        vehicleReg: vehicleReg.trim().toUpperCase(),
      });
      if (res.success) {
        await clearAuth();
        await saveToken(res.token);
        await saveDriver(res.driver);
        router.replace("/documents");
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch {
      setError("Connection error. Try again.");
    }
    setLoading(false);
  };

  const fields = [
    { icon: "person-outline" as const, placeholder: "Full Name", value: name, set: setName },
    { icon: "mail-outline" as const, placeholder: "Email", value: email, set: setEmail, kb: "email-address" as const },
    { icon: "call-outline" as const, placeholder: "Phone Number", value: phone, set: setPhone, kb: "phone-pad" as const },
    { icon: "car-outline" as const, placeholder: "Vehicle (e.g. BMW, Toyota)", value: vehicleMake, set: setVehicleMake },
    { icon: "color-palette-outline" as const, placeholder: "Vehicle Color (e.g. Black)", value: vehicleColor, set: setVehicleColor },
    { icon: "pricetag-outline" as const, placeholder: "Registration (e.g. AB12 CDE)", value: vehicleReg, set: setVehicleReg, auto: "characters" as const },
  ];

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register as a Shine Cars driver</Text>

        {fields.map((f) => (
          <View key={f.placeholder} style={styles.inputWrap}>
            <Ionicons name={f.icon} size={20} color={COLORS.gray400} />
            <TextInput style={styles.input} placeholder={f.placeholder}
              placeholderTextColor={COLORS.gray400} value={f.value}
              onChangeText={f.set} keyboardType={f.kb || "default"}
              autoCapitalize={f.kb === "email-address" ? "none" : (f as { auto?: string }).auto === "characters" ? "characters" : "words"} />
          </View>
        ))}

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} />
          <TextInput style={styles.input} placeholder="Password"
            placeholderTextColor={COLORS.gray400} value={password}
            onChangeText={setPassword} secureTextEntry={!showPass} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color={COLORS.white} /> :
            <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: COLORS.gray400, fontSize: 14, textAlign: "center", marginBottom: 32 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  input: { flex: 1, color: COLORS.white, fontSize: 15, marginLeft: 12 },
  error: { color: COLORS.red, fontSize: 13, marginBottom: 12, textAlign: "center" },
  btn: {
    backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { color: COLORS.gray400, fontSize: 14 },
  linkBold: { color: COLORS.gold, fontWeight: "700" },
});
