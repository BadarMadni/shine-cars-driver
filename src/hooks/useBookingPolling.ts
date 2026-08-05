import { useEffect, useRef, useState, useCallback } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { getBookings } from "@/src/lib/api";
import { getToken } from "@/src/lib/auth";

const alertSound = require("@/assets/booking-alert.wav");

const POLL_INTERVAL = 10_000; // 10 seconds

export function useBookingPolling() {
  const router = useRouter();
  const [assignedCount, setAssignedCount] = useState(0);
  const knownIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await getBookings("assigned");
      if (!res.success) return;

      const bookings: { id: string; name: string; pickup: string }[] = res.bookings || [];
      setAssignedCount(bookings.length);

      if (isFirstLoad.current) {
        bookings.forEach((b) => knownIds.current.add(b.id));
        isFirstLoad.current = false;
        return;
      }

      const newBookings = bookings.filter((b) => !knownIds.current.has(b.id));
      bookings.forEach((b) => knownIds.current.add(b.id));

      if (newBookings.length > 0) {
        try {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const { sound } = await Audio.Sound.createAsync(alertSound, { volume: 1.0 });
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => {
            if ("didJustFinish" in s && s.didJustFinish) sound.unloadAsync();
          });
        } catch {}
        const latest = newBookings[0];
        Alert.alert(
          "New Booking!",
          `${latest.name}\n${latest.pickup}`,
          [
            { text: "Later", style: "cancel" },
            {
              text: "View",
              onPress: () => router.push(`/booking-detail?id=${latest.id}`),
            },
          ],
          { cancelable: true }
        );
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  return { assignedCount };
}
