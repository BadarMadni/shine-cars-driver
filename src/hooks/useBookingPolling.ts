import { useEffect, useRef, useState, useCallback } from "react";
import { getBookings } from "@/src/lib/api";
import { getToken } from "@/src/lib/auth";

const POLL_INTERVAL = 10_000;

export interface NewBooking {
  id: string; name: string; pickup: string; dropoff: string;
  vehicle?: string; fare?: number; date?: string; time?: string;
  fareType?: string;
}

export function useBookingPolling() {
  const [assignedCount, setAssignedCount] = useState(0);
  const [alertBooking, setAlertBooking] = useState<NewBooking | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await getBookings("assigned");
      if (!res.success) return;

      const bookings: NewBooking[] = res.bookings || [];
      setAssignedCount(bookings.length);

      if (isFirstLoad.current) {
        bookings.forEach((b) => knownIds.current.add(b.id));
        isFirstLoad.current = false;
        return;
      }

      const newBookings = bookings.filter((b) => !knownIds.current.has(b.id));
      bookings.forEach((b) => knownIds.current.add(b.id));

      if (newBookings.length > 0 && !alertBooking) {
        setAlertBooking(newBookings[0]);
      }
    } catch {}
  }, [alertBooking]);

  const dismissAlert = useCallback(() => setAlertBooking(null), []);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [poll]);

  return { assignedCount, alertBooking, dismissAlert };
}
