import { randomInt } from 'node:crypto';

export function generateMeetingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[randomInt(chars.length)]).join('');
  return 'SSG-' + part() + '-' + part();
}
export function generatePasscode() {
  return String(randomInt(100000, 1000000));
}
