import { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

export type Result = { type: "success" | "error"; message: string } | null;

export default function ResultModal({ result, onClose }: { result: Result; onClose: () => void }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  if (result) {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }
  const isSuccess = result?.type === "success";
  return (
    <Modal visible={!!result} transparent animationType="none">
      <Animated.View style={[s.overlay, { opacity }]}>
        <Animated.View style={[s.modal, { transform: [{ scale }] }]}>
          <View style={[s.icon, { backgroundColor: isSuccess ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }]}>
            <Ionicons name={isSuccess ? "checkmark-circle" : "close-circle"} size={56}
              color={isSuccess ? "#22C55E" : "#EF4444"} />
          </View>
          <Text style={s.title}>{isSuccess ? "Success!" : "Error"}</Text>
          <Text style={s.msg}>{result?.message}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}
            style={[s.btn, { backgroundColor: isSuccess ? "#22C55E" : COLORS.crimson }]}>
            <Text style={s.btnText}>{isSuccess ? "Done" : "Try Again"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: COLORS.navy, borderRadius: 24, padding: 32, alignItems: "center", width: "85%", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  icon: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "800", marginBottom: 8 },
  msg: { color: COLORS.gray400, fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  btn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
