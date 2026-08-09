import { Platform } from "react-native";
import * as Device from "expo-device";

let Notifications: typeof import("expo-notifications") | null = null;

async function getNotifications() {
  if (!Notifications) {
    try {
      Notifications = await import("expo-notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.log("expo-notifications not available:", e);
      return null;
    }
  }
  return Notifications;
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
    return null;
  }

  try {
    const notif = await getNotifications();
    if (!notif) return null;

    const { status: existing } = await notif.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    if (Platform.OS === "android") {
      await notif.setNotificationChannelAsync("default", {
        name: "default",
        importance: notif.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // Use native FCM/APNs device token instead of Expo push token
    const tokenData = await notif.getDevicePushTokenAsync();
    console.log("FCM device token:", tokenData.data);
    return tokenData.data as string;
  } catch (e) {
    console.log("Push notification registration failed:", e);
    return null;
  }
}

export async function scheduleBookingReminder(bookingId: string, time: string, date: string, pickup: string) {
  try {
    const notif = await getNotifications();
    if (!notif) return;
    const [h, m] = time.split(":").map(Number);
    const trigger = new Date(date + "T00:00:00");
    trigger.setHours(h, m - 30, 0, 0);
    if (trigger.getTime() <= Date.now()) return; // skip past
    await notif.scheduleNotificationAsync({
      content: { title: "Ride in 30 minutes", body: `Pickup: ${pickup} at ${time}`, data: { bookingId } },
      trigger: { type: "date" as any, date: trigger },
      identifier: `reminder-${bookingId}`,
    });
  } catch {}
}
