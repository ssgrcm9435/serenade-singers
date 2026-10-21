import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

export type MeetClaims = {
  role: 'admin' | 'member' | 'admitted';
  meetingId?: string;
  participantId?: string;
  exp: number;
  nonce: string;
};

function secret() {
  if (!process.env.MEETING_AUTH_SECRET || process.env.MEETING_AUTH_SECRET.length < 32) {
    throw new Error('MEETING_AUTH_SECRET must be configured with at least 32 characters');
  }
  return process.env.MEETING_AUTH_SECRET;
}

export function signMeetToken(role: MeetClaims['role'], meetingId?: string, participantId?: string, ttlSeconds = 8 * 3600) {
  const payload: MeetClaims = {
    role, meetingId, participantId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(12).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret()).update(body).digest('base64url');
  return body + '.' + signature;
}

export function verifyMeetToken(token?: string): MeetClaims {
  try {
    if (!token || token.length > 4096) throw new Error('Missing token');
    const parts = token.split('.');
    if (parts.length !== 2) throw new Error('Invalid token');
    const signature = createHmac('sha256', secret()).update(parts[0]).digest();
    const supplied = Buffer.from(parts[1], 'base64url');
    if (signature.length !== supplied.length || !timingSafeEqual(signature, supplied)) throw new Error('Bad signature');
    const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as MeetClaims;
    if (!['admin', 'member', 'admitted'].includes(claims.role) || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) throw new Error('Expired token');
    return claims;
  } catch {
    throw new UnauthorizedException('Missing, invalid or expired meeting access token');
  }
}
