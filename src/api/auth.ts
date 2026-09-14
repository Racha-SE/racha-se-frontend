import { authClient } from "@/lib/auth-client";

export function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({ email, password });
}

export function getSession() {
  return authClient.getSession();
}

export function signOut() {
  return authClient.signOut();
}

export function changePassword(params: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) {
  return authClient.changePassword(params);
}

export function requestPasswordReset(params: {
  email: string;
  redirectTo?: string;
}) {
  return authClient.requestPasswordReset(params);
}

export function resetPassword(params: { newPassword: string; token: string }) {
  return authClient.resetPassword(params);
}
