# Serenade Meet — production deployment and verification

## Current state (2026-10-21)

- Source of truth: `ssgrcm9435/serenade-singers`. Existing Render API `serenade-singers-1` incorrectly uses `Eric9435/serenade-singers` (no `serenade-backend` folder).
- The website remains served at https://serenade-singers.onrender.com from the correct source repository main branch.
- Validated release branch: `release/serenade-meet-20261021`, draft PR #1.
- CI covers frontend and Nest builds, PostgreSQL migrations, REST auth, waiting-room admission, Socket.IO chat, host moderation, and two real Chromium peers transferring A/V tracks.
- Render's Hobby workspace rejected creating a Free Postgres because it has reached **25 services**. Connected Render tools do not offer a delete-service or change-repository action.

## Unblock deployment

1. In Render Dashboard, identify **two genuinely unused services** and remove them (only after confirming neither handles production traffic), or upgrade workspace allowance. The Render connector cannot delete services. The old failed `serenade-singers-1` is one candidate; do not delete the live `serenade-singers` website. Avoid changing an unrelated production service.
2. For staging, connect this repository to a new Render Blueprint using root `render.yaml` (adds Postgres + API). The plan is Free and is **not production-grade**; Free Postgres expires after 30 days without backups, and Free web services spin down. Real persistent chat history needs a paid Postgres plan or another durable database.
3. Set a cryptographically random, private `MEETING_AUTH_SECRET` of 32+ characters on the backend AND the existing website's Render service. Both values must match. Never commit the secret to Git.
4. In existing website Render environment, set `NEXT_PUBLIC_BACKEND_URL=https://<actual-api-host>.onrender.com` (replace with the actual assigned backend URL), retain configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`, and rebuild website after setting `NEXT_PUBLIC_BACKEND_URL` because Next public variables are compiled into the frontend.
5. Merge PR #1 only after latest CI succeeds and environment variables are configured. Render's existing public site auto-deploys changes on main.
6. Verify API health, database migration status, and allowlisted browser origin, then run admin-created rehearsal and member waiting-room approval on separate browsers/devices. Test audio/video in both directions, screen sharing, chat persistence after reconnection, mute-all, and ending the room.
7. Configure a reliable TURN server (not just public STUN) before advertising support for restrictive office/mobile NATs or more than a handful of video participants. Mesh WebRTC becomes expensive as member count grows.

## Security

- New meeting passcodes are stored as bcrypt hashes and returned only once to the host.
- Admin authentication is issued by the website server, not by arbitrary email input.
- REST meeting management, legacy users/chat/notification resources, and the meeting Socket.IO namespace use signed access checks.
- Legacy public chat/presence socket namespaces are disabled until verified member identity is available.
- Direct private conversations, permanent voice channels, recordings, and push invitations **are not yet production-complete**. Do not represent the rehearsal room as a fully featured Discord/Zoom replacement.
- Never reuse the test `MEETING_AUTH_SECRET` from CI in production. Keep `JWT_SECRET` separate.

## Validation links

- Release PR: https://github.com/ssgrcm9435/serenade-singers/pull/1
- CI: https://github.com/ssgrcm9435/serenade-singers/actions
- Render website: https://dashboard.render.com/web/srv-d8dc0cfavr4c73fjhg0g
- Misconfigured legacy backend: https://dashboard.render.com/web/srv-d8tbls6gvqtc73c9m7fg
