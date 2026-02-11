import { apiFetch, setToken, setUser, getDeviceId } from '@/src/lib/api/api-client';

type LoginPayload = { email: string; password: string; rememberMe?: boolean };
type SignupPayload = { email: string; password: string; accountType?: string };

export async function login(payload: LoginPayload) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: String(payload.email || '').trim(),
      password: String(payload.password || '').trim(),
      device_id: getDeviceId(),
      device_name: navigator.userAgent || 'Web Browser'
    })
  });
  const token = (res as any)?.access_token || (res as any)?.token;
  if (token) setToken(String(token));
  const user = (res as any)?.user;
  if (user) setUser(user);
  return res;
}

export async function signup(payload: SignupPayload) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function requestPasswordReset(email: string) {
  return apiFetch('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiFetch('/auth/password/reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword })
  });
}

export async function verifyEmail(email: string, code: string) {
  return apiFetch('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });
}

export async function resendVerificationCode(email: string) {
  return apiFetch('/auth/verify/resend', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function sendMagicLink(email: string) {
  return apiFetch('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function verifyEmailToken(token: string) {
  // The backend endpoint is GET /auth/verify?token=...
  // apiFetch automatically handles the base URL
  return apiFetch(`/auth/verify?token=${token}`, {
    method: 'GET'
  });
}

export default { login, signup, requestPasswordReset, resetPassword, verifyEmail, verifyEmailToken, resendVerificationCode, sendMagicLink };
