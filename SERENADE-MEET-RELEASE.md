# Serenade Meet — Release candidate

Branch: `release/serenade-meet-20261021`. **Do not merge before end-to-end testing.**

## Features
- Administrator creates meetings from the Serenade Singers Admin Dashboard.
- Meeting ID and generated six-digit passcode; bcrypt passcode hashes in database. The passcode is returned **once**.
- Members enter name, meeting ID and passcode and wait for administrator approval.
- Browser-to-browser WebRTC audio/video, microphone and camera controls, screen sharing, group tiles and roster.
- Persistent per-meeting conversation history (PostgreSQL, most recent 100 messages loaded on join).
- Host admit/decline, mute-all, participant removal, room lock, and end-for-everyone.
- Signed expiring tokens and meeting-scoped signaling.

## Configuration

Frontend environment on Render:
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` (the already configured administrator credentials).
- `MEETING_AUTH_SECRET` (long random string, at least 32 characters; must match backend exactly).
- `NEXT_PUBLIC_BACKEND_URL` (backend's actual HTTPS URL; must be available at frontend build time).

Backend environment on Render:
- `DATABASE_URL` (PostgreSQL internal connection URL).
- `MEETING_AUTH_SECRET` (same secret as frontend).
- `MEETING_WEB_ORIGIN` (comma-separated frontend origins, for example the staging and production sites).
- `JWT_SECRET` (random string for legacy modules). Do not enable email-only login.

Build service from this repository:
- Build: `cd serenade-backend && corepack enable && pnpm install --frozen-lockfile && pnpm prisma generate && pnpm build`
- Start: `cd serenade-backend && pnpm prisma migrate deploy && pnpm run start:prod`

Frontend:
- Build: `npm ci && npm run build`
- Start: `npm start`

## Release verification

1. `frontend` and `backend` GitHub Actions jobs pass.
2. PostgreSQL migrations succeed, backend returns 200 on `/`.
3. Host authenticates, creates a meeting, and saves the one-time passcode.
4. Two separate accounts/devices join with ID/passcode, appear in waiting room, and are approved by host.
5. Confirm bidirectional audio/video in different browsers and networks (STUN alone may fail on restrictive NAT; production requires TURN service).
6. Confirm text messages appear on both devices and load on rejoin.
7. Screen share and stop; camera reappears afterward.
8. Verify moderation and meeting-ended enforcement after reconnect.
9. Confirm unauthorized endpoints return 401/403, and attendees cannot access other meetings' signaling.
10. Only after these checks, merge PR and deploy production.

**Limitations:** Uses peer-to-peer mesh, best suited to small rehearsals. Large choir calls require an SFU and TURN. This is not Zoom-scale infrastructure. Legacy unverified /users, /chat, /notifications and presence endpoints are disabled in this release. They require independently verified member identity and access control before re-enabling.
