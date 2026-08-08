import { StyleSheet, Platform } from "react-native";
import { COLORS } from "@/src/constants/theme";

export const statusColors: Record<string, string> = {
  pending: COLORS.gold, assigned: COLORS.gold, accepted: "#06B6D4",
  arrived: "#14B8A6", "in-progress": "#A855F7",
  completed: COLORS.green, cancelled: COLORS.red,
};

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 20 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: "800" },
  subtitle: { color: COLORS.gray500, fontSize: 13, marginBottom: 16, marginTop: 2 },
  list: { flex: 1 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: COLORS.gray400, fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptySub: { color: COLORS.gray500, fontSize: 13, marginTop: 4, textAlign: "center", paddingHorizontal: 30 },
  sectionTitle: { color: COLORS.gold, fontSize: 14, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardLeft: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  company: { color: COLORS.gray500, fontSize: 11, marginTop: 2 },
  recurBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(168,85,247,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  recurText: { color: "#A855F7", fontSize: 9, fontWeight: "800" },
  cardDate: { color: COLORS.gray400, fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardBody: { gap: 8, marginBottom: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  locationText: { color: COLORS.gray400, fontSize: 13, flex: 1 },
  daysRow: { flexDirection: "row", gap: 4, marginBottom: 12, flexWrap: "wrap" },
  dayChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  dayActive: { backgroundColor: "rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.3)" },
  dayInactive: { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" },
  dayText: { fontSize: 10, fontWeight: "700" },
  dayTextActive: { color: COLORS.gold },
  dayTextInactive: { color: "rgba(255,255,255,0.2)" },
  cardFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 12,
  },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  fare: { color: COLORS.gold, fontSize: 18, fontWeight: "800" },
  time: { color: COLORS.gray500, fontSize: 12, fontWeight: "600" },
  vehicle: {
    color: COLORS.gray500, fontSize: 11, fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
});
