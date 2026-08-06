import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

interface Props {
  visible: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ visible, icon, iconColor, iconBg, title, message, confirmLabel, confirmColor, cancelLabel = "Cancel", onConfirm, onCancel }: Props) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.7);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.modal, { transform: [{ scale }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.8}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.confirmBtn, { backgroundColor: confirmColor }]} activeOpacity={0.8}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 30 },
  modal: { backgroundColor: "#1B2138", borderRadius: 24, padding: 32, alignItems: "center", width: "100%", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  iconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: "800", marginBottom: 8 },
  message: { color: COLORS.gray400, fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  btnRow: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  cancelText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  confirmBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  confirmText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});
