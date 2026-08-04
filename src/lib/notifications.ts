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
