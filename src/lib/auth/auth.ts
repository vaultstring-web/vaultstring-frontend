import { apiFetch, delay } from '@/src/lib/api/api-client';

type LoginPayload = { email: string; password: string; rememberMe?: boolean };
type SignupPayload = { email: string; password: string; accountType?: string };

const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL;

export async function login(payload: LoginPayload) {
  if (USE_MOCK) {
    await delay(700);
    if (payload.email === 'demo@example.com' && payload.password === 'Password1!') {
      return { ok: true, user: { email: payload.email, name: 'Demo User' }, token: 'demo-token' };
    }
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function signup(payload: SignupPayload) {
  if (USE_MOCK) {
    await delay(700);
    return { ok: true, message: 'Verification code sent', email: payload.email };
  }

  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function requestPasswordReset(email: string) {
  if (USE_MOCK) {
    await delay(500);
    return { ok: true, message: 'Reset email sent' };
  }

  return apiFetch('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(token: string, newPassword: string) {
  if (USE_MOCK) {
    await delay(500);
    if (!token) {
      const e: any = new Error('Invalid token');
      e.status = 400;
      throw e;
    }
    return { ok: true };
  }

  return apiFetch('/auth/password/reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword })
  });
}

export async function verifyEmail(email: string, code: string) {
  if (USE_MOCK) {
    await delay(600);
    if (code === '123456') {
      return { ok: true };
    }
    const e: any = new Error('Invalid verification code');
    e.status = 400;
    throw e;
  }

  return apiFetch('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });
}

export async function resendVerificationCode(email: string) {
  if (USE_MOCK) {
    await delay(500);
    return { ok: true };
  }

  return apiFetch('/auth/verify/resend', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function sendMagicLink(email: string) {
  if (USE_MOCK) {
    await delay(500);
    return { ok: true };
  }

  return apiFetch('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export default { login, signup, requestPasswordReset, resetPassword, verifyEmail, resendVerificationCode, sendMagicLink };
