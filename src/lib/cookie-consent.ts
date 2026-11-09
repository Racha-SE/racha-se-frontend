import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";

const CONSENT_COOKIE = "cookie_consent";
const CONSENT_ACCEPTED = "accept";
const USERNAME_COOKIE = "remembered_username";
const COOKIE_MAX_AGE_DAYS = 180;

export function hasConsent() {
  return getCookie(CONSENT_COOKIE) === CONSENT_ACCEPTED;
}

export function acceptConsent() {
  setCookie(CONSENT_COOKIE, CONSENT_ACCEPTED, COOKIE_MAX_AGE_DAYS);
}

export function declineConsent() {
  deleteCookie(CONSENT_COOKIE);
  deleteCookie(USERNAME_COOKIE);
}

export function rememberUsername(username: string) {
  setCookie(USERNAME_COOKIE, username, COOKIE_MAX_AGE_DAYS);
}
