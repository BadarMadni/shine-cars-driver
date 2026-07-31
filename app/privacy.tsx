import { View, Text, ScrollView, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/src/constants/theme";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect your name, email, phone number, and vehicle details when you register. We also collect your real-time location while you are on duty to match you with nearby bookings and enable dispatchers to track ride progress.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to: manage your driver account, assign bookings to you based on proximity, track ride status for dispatchers and customers, process payments, and communicate important updates about your account or bookings.",
  },
  {
    title: "Location Data",
    body: "We collect your GPS location only while the app is in use and you are marked as available. Location data is shared with dispatchers to assign nearby bookings. You can stop sharing your location at any time by going offline.",
  },
  {
    title: "Data Sharing",
    body: "We share your name and vehicle details with customers for their booked rides. We do not sell your personal data to third parties. We may share data with law enforcement if required by law.",
  },
  {
    title: "Camera & Photo Library",
    body: "We request access to your camera and photo library solely to allow you to capture or select documents (driving licence, insurance, MOT, etc.) for account verification. Photos are uploaded securely and are not used for any other purpose.",
  },
  {
    title: "Documents",
    body: "Uploaded documents are stored securely using encrypted cloud storage and used solely for account verification purposes. Documents are encrypted in transit and at rest.",
  },
  {
    title: "Data Security",
    body: "We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure cloud storage, and access controls to protect your personal information against unauthorised access, alteration, or destruction.",
  },
  {
    title: "Data Retention",
    body: "Your account data is retained for as long as your account is active. You may request deletion of your account and associated data by contacting us at admin@shinecars.co.uk.",
  },
  {
    title: "Notifications",
    body: "We send in-app notifications for booking assignments, account approvals, and important updates. You can manage notification preferences through your device settings.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at admin@shinecars.co.uk. We will respond within 30 days.",
  },
  {
    title: "Children's Privacy",
    body: "This app is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this privacy policy from time to time. Any changes will be reflected within the app with an updated revision date. Continued use of the app after changes constitutes acceptance of the revised policy.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about this privacy policy, contact us at:\n\nShine Cars\nEmail: admin@shinecars.co.uk\nPhone: 01945 243006",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.title}>Privacy Policy</Text>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={s.updated}>Last updated: July 2026</Text>
        <Text style={s.intro}>
          Shine Cars ("we", "our") is committed to protecting your privacy.
          This policy explains how we collect, use, and safeguard your data.
        </Text>
        {sections.map((sec, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionTitle}>{`${i + 1}. ${sec.title}`}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  backBtn: { padding: 4 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  updated: { color: COLORS.gray500, fontSize: 12, paddingHorizontal: 20, marginBottom: 12 },
  intro: { color: COLORS.gray400, fontSize: 14, lineHeight: 20, paddingHorizontal: 20, marginBottom: 20 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { color: COLORS.gold, fontSize: 15, fontWeight: "700", marginBottom: 6 },
  sectionBody: { color: COLORS.gray400, fontSize: 13, lineHeight: 20 },
});
