import fs from 'fs';
import path from 'path';

const SESSION_FILE = path.join(process.cwd(), 'data', 'active_sessions.json');

export interface SessionRecord {
  sessionId: string;
  userId: string;
  username: string;
  loginAt: string;
  lastActiveAt: string;
}

function readSessions(): Record<string, SessionRecord> {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading active sessions:', e);
  }
  return {};
}

function writeSessions(sessions: Record<string, SessionRecord>) {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing active sessions:', e);
  }
}

/**
 * Checks if a user has an active session currently running elsewhere.
 */
export function getActiveSession(username: string): SessionRecord | null {
  const sessions = readSessions();
  const key = username.trim().toUpperCase();
  const s = sessions[key];
  if (!s) return null;

  // Auto-expire sessions inactive for more than 7 days
  const age = Date.now() - new Date(s.lastActiveAt || s.loginAt).getTime();
  if (age > 7 * 24 * 60 * 60 * 1000) {
    delete sessions[key];
    writeSessions(sessions);
    return null;
  }
  return s;
}

/**
 * Registers or overwrites a session for a user, returning the new unique sessionId.
 */
export function registerSession(userId: string, username: string): string {
  const sessions = readSessions();
  const key = username.trim().toUpperCase();
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessions[key] = {
    sessionId,
    userId,
    username: key,
    loginAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  writeSessions(sessions);
  return sessionId;
}

/**
 * Validates that the provided sessionId is still the current active one.
 */
export function validateSession(username: string, sessionId?: string): boolean {
  if (!sessionId) return true; // If legacy token without sessionId, allow
  const sessions = readSessions();
  const key = username.trim().toUpperCase();
  const s = sessions[key];
  if (!s) return true; // No record yet, allow
  return s.sessionId === sessionId;
}

/**
 * Removes session upon logout.
 */
export function removeSession(username: string) {
  const sessions = readSessions();
  const key = username.trim().toUpperCase();
  if (sessions[key]) {
    delete sessions[key];
    writeSessions(sessions);
  }
}
