# Serenade Singers Backend Production

## Render Settings

Root Directory:
serenade-backend

Build Command:
pnpm install --frozen-lockfile && pnpm prisma generate && pnpm run build

Start Command:
pnpm run start:prod

Environment Variables:
DATABASE_URL
JWT_SECRET
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
