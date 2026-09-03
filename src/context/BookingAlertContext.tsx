import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "expo-router";
import { useBookingPolling, NewBooking } from "@/src/hooks/useBookingPolling";
import { updateBookingStatus, acceptRecurringTemplate, rejectRecurringTemplate } from "@/src/lib/api";
import BookingAlertModal from "@/src/components/BookingAlertModal";

interface BookingAlertState {
  assignedCount: number;
  recurringCount: number;
}

const BookingAlertCtx = createContext<BookingAlertState>({ assignedCount: 0, recurringCount: 0 });

export function useBookingAlertCounts() {
  return useContext(BookingAlertCtx);
}

export function BookingAlertProvider({ children }: { children: ReactNode }) {
  const { assignedCount, recurringCount, alertBooking, dismissAlert } = useBookingPolling();
  const router = useRouter();

  const handleAccept = async (id: string) => {
    const isRecurring = alertBooking?.isRecurring;
    dismissAlert();
    if (isRecurring) {
      try { await acceptRecurringTemplate(id); } catch {}
      router.push("/(tabs)/recurring");
    } else {
      try { await updateBookingStatus(id, "accepted"); } catch {}
      router.push(`/booking-detail?id=${id}`);
    }
  };

  const handleReject = async (id: string) => {
    dismissAlert();
    if (alertBooking?.isRecurring) {
      try { await rejectRecurringTemplate(id); } catch {}
    } else {
      try { await updateBookingStatus(id, "cancelled"); } catch {}
    }
  };

  return (
    <BookingAlertCtx.Provider value={{ assignedCount, recurringCount }}>
      {children}
      <BookingAlertModal
        booking={alertBooking}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </BookingAlertCtx.Provider>
  );
}
