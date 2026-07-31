import { useState, useEffect, useCallback } from "react";
import { getNotifications } from "@/src/lib/api";

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const poll = useCallback(async () => {
    try {
      const res = await getNotifications();
      if (res.unreadCount !== undefined) setCount(res.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, [poll]);

  return { count, refresh: poll };
}
