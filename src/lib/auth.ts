import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'sjciqac-portal-secret-key-super-secure-2026';
const COOKIE_NAME = 'iqac_token';

export interface TokenPayload {
  userId: string;
  username: string;
  name: string;
  role: 'DEPARTMENT' | 'DIRECTOR' | 'STAFF' | 'ADMIN';
  departmentId?: string | null;
  shift?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify user still exists in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { department: true }
  });

  if (!user) return null;

  return {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role as any,
    departmentId: user.departmentId,
    shift: user.department?.shift || null,
  };
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
