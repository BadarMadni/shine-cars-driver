import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView,
  Platform, StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/src/constants/theme";
import { getChatMessages, sendChatMessage } from "@/src/lib/api";

interface Message { id: string; message: string; sender: string; createdAt: string }

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatRef = useRef<FlatList>(null);
  const prevCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await getChatMessages();
      const msgs = data.messages || [];
      setMessages(msgs);
      if (msgs.length !== prevCount.current) {
        prevCount.current = msgs.length;
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [load]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(input.trim());
      setInput("");
      await load();
    } catch {} finally { setSending(false); }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isDriver = item.sender === "driver";
    const showDate = index === 0 || formatDate(item.createdAt) !== formatDate(messages[index - 1].createdAt);

    return (
      <View>
        {showDate && (
          <View style={s.dateBadge}>
            <Text style={s.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[s.bubble, isDriver ? s.bubbleRight : s.bubbleLeft]}>
          <Text style={[s.msgText, isDriver ? s.msgTextRight : s.msgTextLeft]}>{item.message}</Text>
          <Text style={[s.timeText, isDriver ? s.timeRight : s.timeLeft]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F1629", paddingTop: insets.top, paddingBottom: insets.bottom }}>
    <KeyboardAvoidingView style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={s.avatar}>
          <Ionicons name="headset" size={18} color={COLORS.white} />
        </View>
        <View>
          <Text style={s.headerTitle}>Dispatch</Text>
          <Text style={s.headerSub}>Shine Cars Support</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={s.center}><ActivityIndicator color={COLORS.crimson} /></View>
      ) : (
        <FlatList ref={flatRef} data={messages} keyExtractor={(m) => m.id}
          renderItem={renderItem} contentContainerStyle={s.list}
          keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<View style={s.center}><Text style={s.emptyText}>No messages yet. Say hello!</Text></View>}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })} />
      )}

      {/* Input */}
      <View style={s.inputBar}>
        <TextInput style={s.input} value={input} onChangeText={setInput}
          placeholder="Type a message..." placeholderTextColor="rgba(255,255,255,0.25)"
          multiline maxLength={500} onSubmitEditing={send} returnKeyType="send" />
        <TouchableOpacity onPress={send} disabled={!input.trim() || sending}
          style={[s.sendBtn, (!input.trim() || sending) && s.sendBtnDisabled]}>
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1120" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn: { padding: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.crimson, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "rgba(255,255,255,0.2)", fontSize: 13 },
  list: { paddingHorizontal: 12, paddingVertical: 8, flexGrow: 1 },
  dateBadge: { alignItems: "center", marginVertical: 12 },
  dateText: { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "600", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, overflow: "hidden" },
  bubble: { maxWidth: "78%", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginBottom: 4 },
  bubbleRight: { alignSelf: "flex-end", backgroundColor: COLORS.crimson, borderBottomRightRadius: 6 },
  bubbleLeft: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.08)", borderBottomLeftRadius: 6 },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextRight: { color: COLORS.white },
  msgTextLeft: { color: "rgba(255,255,255,0.85)" },
  timeText: { fontSize: 9, marginTop: 4, textAlign: "right" },
  timeRight: { color: "rgba(255,255,255,0.45)" },
  timeLeft: { color: "rgba(255,255,255,0.25)" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", backgroundColor: "#0F1629" },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", color: COLORS.white, fontSize: 14, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, maxHeight: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.crimson, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.3 },
});
