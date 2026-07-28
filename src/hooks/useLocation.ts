import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { updateLocation } from "@/src/lib/api";

export function useLocationTracking(enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let mounted = true;

    const sendLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          await updateLocation(loc.coords.latitude, loc.coords.longitude);
        }
      } catch {}
    };

    sendLocation();
    intervalRef.current = setInterval(sendLocation, 30000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);
}
