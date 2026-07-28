import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "driver_token";
const DRIVER_KEY = "driver_data";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveDriver(driver: object) {
  await SecureStore.setItemAsync(DRIVER_KEY, JSON.stringify(driver));
}

export async function getDriver(): Promise<object | null> {
  const data = await SecureStore.getItemAsync(DRIVER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(DRIVER_KEY);
}
