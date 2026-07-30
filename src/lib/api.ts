import { API_URL } from "@/src/constants/theme";
import { getToken } from "./auth";

async function request(path: string, options: RequestInit = {}) {
  const token = (await getToken())?.trim();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
}

export async function registerDriver(data: {
  name: string; email: string; phone: string; password: string;
}) {
  return request("/api/drivers/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginDriver(email: string, password: string) {
  return request("/api/drivers/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return request("/api/drivers/me");
}

export async function toggleAvailability(isAvailable: boolean) {
  return request("/api/drivers/availability", {
    method: "PATCH",
    body: JSON.stringify({ isAvailable }),
  });
}

export async function getBookings(filter: string) {
  return request(`/api/drivers/bookings?filter=${filter}`);
}

export async function updateBookingStatus(
  bookingId: string, status: string, cashCollected?: number
) {
  return request("/api/drivers/bookings/status", {
    method: "PATCH",
    body: JSON.stringify({ bookingId, status, cashCollected }),
  });
}

export async function updateLocation(latitude: number, longitude: number) {
  return request("/api/drivers/location", {
    method: "PATCH",
    body: JSON.stringify({ latitude, longitude }),
  });
}

export async function updateProfile(data: { name?: string; phone?: string }) {
  return request("/api/drivers/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function savePushToken(pushToken: string) {
  return request("/api/drivers/push-token", {
    method: "PATCH",
    body: JSON.stringify({ pushToken }),
  });
}

export async function uploadDocument(
  type: string, uri: string, expiryDate: string
): Promise<{ success: boolean; document?: unknown; message?: string }> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const filename = uri.split("/").pop() || "document.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const mimeType = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  formData.append("type", type);
  formData.append("expiryDate", expiryDate);
  formData.append("file", {
    uri, name: filename, type: mimeType,
  } as unknown as Blob);

  formData.append("token", token);
  const res = await fetch(`${API_URL}/api/drivers/documents`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Upload failed");
  return data;
}
