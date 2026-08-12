import { StyleSheet, Platform } from "react-native";
import { COLORS } from "@/src/constants/theme";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  scroll: { padding: 24, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  backBtn: { padding: 4 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  subtitle: { color: COLORS.gray400, fontSize: 14, marginBottom: 24 },
  card: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  cardTitle: { color: COLORS.white, fontSize: 15, fontWeight: "700", flex: 1 },
  preview: { width: "100%", height: 180, borderRadius: 12, marginBottom: 8 },
  uploadArea: { flexDirection: "row", gap: 12, marginBottom: 8 },
  uploadBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(204,34,41,0.1)", borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: "rgba(204,34,41,0.3)", borderStyle: "dashed" },
  uploadText: { color: COLORS.crimson, fontSize: 14, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  changeText: { color: COLORS.gold, fontSize: 13, fontWeight: "600" },
  expiryWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  expiryInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  error: { color: COLORS.red, fontSize: 13, textAlign: "center", marginBottom: 12 },
  btn: { backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
