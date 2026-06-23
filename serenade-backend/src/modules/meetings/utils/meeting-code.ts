export function generateMeetingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const part = () =>
    Array.from({ length: 4 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');

  return `SSG-${part()}-${part()}`;
}

export function generatePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
