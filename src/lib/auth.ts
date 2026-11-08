import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'rxmatch-us-super-secure-admin-secret-key-2026';
const COOKIE_NAME = 'rxmatch_admin_session';

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

export function createSessionToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    nonce: crypto.randomBytes(8).toString('hex')
  };
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  return `${b64}.${signature}`;
}

export function verifySessionToken(token?: string | null): { username: string; exp: number } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const data = JSON.parse(json);
    if (!data.exp || data.exp < Date.now()) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}
