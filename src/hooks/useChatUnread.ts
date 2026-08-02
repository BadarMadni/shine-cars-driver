import { useState, useEffect } from "react";
import { getChatMessages } from "@/src/lib/api";

export function useChatUnread() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getChatMessages();
        const unread = (data.messages || []).filter(
          (m: { sender: string; isRead: boolean }) => m.sender === "dispatcher" && !m.isRead
        ).length;
        setCount(unread);
      } catch {}
    };
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  return count;
}
