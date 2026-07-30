import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "driver_token";
const DRIVER_KEY = "driver_data";

export async function saveToken(token: string) {
  // Only keep valid JWT chars (base64url + dots)
  await SecureStore.setItemAsync(TOKEN_KEY, token.replace(/[^A-Za-z0-9._\-]/g, ""));
}

export async function getToken(): Promise<string | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!raw) return null;
  // Only keep valid JWT chars — strips ANY invisible/control characters
  return raw.replace(/[^A-Za-z0-9._\-]/g, "");
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveDriver(driver: Record<string, unknown>) {
  const slim = {
    id: driver.id,
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
    status: driver.status,
    isAvailable: driver.isAvailable,
  };
  await SecureStore.setItemAsync(DRIVER_KEY, JSON.stringify(slim));
}

export async function getDriver(): Promise<Record<string, unknown> | null> {
  const data = await SecureStore.getItemAsync(DRIVER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(DRIVER_KEY);
}
