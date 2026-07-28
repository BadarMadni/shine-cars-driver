import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Image, Platform, TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";
import { uploadDocument } from "@/src/lib/api";
import { saveDriver, getDriver } from "@/src/lib/auth";

const DOC_TYPES = [
  { key: "driver_licence", label: "Driver Licence", icon: "card-outline" as const },
  { key: "mot_certificate", label: "MOT Certificate", icon: "document-text-outline" as const },
  { key: "taxi_badge", label: "Taxi Badge", icon: "shield-checkmark-outline" as const },
  { key: "vehicle_taxi_plate", label: "Vehicle Taxi Plate", icon: "car-outline" as const },
];

interface DocState {
  uri: string | null;
  expiry: string;
  uploaded: boolean;
  uploading: boolean;
}

export default function DocumentsScreen() {
  const router = useRouter();
  const [docs, setDocs] = useState<Record<string, DocState>>(
    Object.fromEntries(DOC_TYPES.map((d) => [d.key, { uri: null, expiry: "", uploaded: false, uploading: false }]))
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (key: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setDocs((prev) => ({ ...prev, [key]: { ...prev[key], uri: result.assets[0].uri } }));
    }
  };

  const takePhoto = async (key: string) => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setDocs((prev) => ({ ...prev, [key]: { ...prev[key], uri: result.assets[0].uri } }));
    }
  };

  const setExpiry = (key: string, value: string) => {
    let cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length > 2 && cleaned[2] !== "/") cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 5 && cleaned[5] !== "/") cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5);
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
    setDocs((prev) => ({ ...prev, [key]: { ...prev[key], expiry: cleaned } }));
  };

  const handleSubmit = async () => {
    const missing = DOC_TYPES.filter((d) => !docs[d.key].uri || !docs[d.key].expiry);
    if (missing.length > 0) {
      setError(`Please upload all documents with expiry dates.`);
      return;
    }
    setError("");
    setSubmitting(true);

    for (const doc of DOC_TYPES) {
      const state = docs[doc.key];
      if (state.uri && !state.uploaded) {
        setDocs((prev) => ({ ...prev, [doc.key]: { ...prev[doc.key], uploading: true } }));
        try {
          await uploadDocument(doc.key, state.uri, state.expiry);
          setDocs((prev) => ({ ...prev, [doc.key]: { ...prev[doc.key], uploaded: true, uploading: false } }));
        } catch {
          setError(`Failed to upload ${doc.label}. Try again.`);
          setDocs((prev) => ({ ...prev, [doc.key]: { ...prev[doc.key], uploading: false } }));
          setSubmitting(false);
          return;
        }
      }
    }

    const driver = await getDriver() as Record<string, unknown> | null;
    if (driver) {
      await saveDriver({ ...driver, status: "pending" });
    }
    setSubmitting(false);
    router.replace("/pending");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.subtitle}>Upload required documents with expiry dates</Text>

      {DOC_TYPES.map((doc) => {
        const state = docs[doc.key];
        return (
          <View key={doc.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name={doc.icon} size={22} color={COLORS.gold} />
              <Text style={styles.cardTitle}>{doc.label}</Text>
              {state.uploaded && <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />}
            </View>

            {state.uri ? (
              <Image source={{ uri: state.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.uploadArea}>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(doc.key)}>
                  <Ionicons name="images-outline" size={20} color={COLORS.crimson} />
                  <Text style={styles.uploadText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => takePhoto(doc.key)}>
                  <Ionicons name="camera-outline" size={20} color={COLORS.crimson} />
                  <Text style={styles.uploadText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {state.uri && (
              <TouchableOpacity onPress={() => setDocs((prev) => ({
                ...prev, [doc.key]: { ...prev[doc.key], uri: null, uploaded: false },
              }))}>
                <Text style={styles.changeText}>Change image</Text>
              </TouchableOpacity>
            )}

            <View style={styles.expiryWrap}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.gray400} />
              <TextInput
                style={styles.expiryInput}
                placeholder="Expiry: DD/MM/YYYY"
                placeholderTextColor={COLORS.gray400}
                value={state.expiry}
                onChangeText={(v) => setExpiry(doc.key, v)}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </View>
        );
      })}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
        {submitting ? <ActivityIndicator color={COLORS.white} /> :
          <Text style={styles.btnText}>Submit for Approval</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  scroll: { padding: 24, paddingTop: Platform.OS === "ios" ? 60 : 40 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: "800", textAlign: "center" },
  subtitle: { color: COLORS.gray400, fontSize: 14, textAlign: "center", marginBottom: 24 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  cardTitle: { color: COLORS.white, fontSize: 15, fontWeight: "700", flex: 1 },
  preview: { width: "100%", height: 150, borderRadius: 12, marginBottom: 8 },
  uploadArea: { flexDirection: "row", gap: 12, marginBottom: 8 },
  uploadBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "rgba(204,34,41,0.1)", borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: "rgba(204,34,41,0.3)", borderStyle: "dashed",
  },
  uploadText: { color: COLORS.crimson, fontSize: 14, fontWeight: "600" },
  changeText: { color: COLORS.gold, fontSize: 13, fontWeight: "600", marginBottom: 8 },
  expiryWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  expiryInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  error: { color: COLORS.red, fontSize: 13, textAlign: "center", marginBottom: 12 },
  btn: {
    backgroundColor: COLORS.crimson, borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
