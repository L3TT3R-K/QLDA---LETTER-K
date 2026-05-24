import type { AuthUser } from "@/lib/permissions";

export const authStorageKey = "AUTH_USER";
export const tokenStorageKey = "ACCESS_TOKEN";

export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(authStorageKey);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const saveCurrentUser = (user: AuthUser) => {
  localStorage.setItem(authStorageKey, JSON.stringify(user));

  if (user.token) {
    localStorage.setItem(tokenStorageKey, user.token);
  }
};

export const clearCurrentUser = () => {
  localStorage.removeItem(authStorageKey);
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem("role");
};
