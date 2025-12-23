# In: LMS-APP/Dockerfile (FINAL, CORRECTED VERSION)

# ---- Base Stage ----
# Use a specific Node version for consistency
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
# Copy all package.json and lock files
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY apps/server/package.json ./apps/server/
# Install production dependencies for all workspaces
RUN npm ci --omit=dev

# ---- Builder Stage ----
FROM base AS builder
# Copy only the necessary dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build both the server and the admin panel
RUN npm run build

# ---- Production Stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built server and its production node_modules
COPY --from=builder /app/apps/server/build ./apps/server/build
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/src/mails ./apps/server/src/mails
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next.js app
COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/package.json ./apps/admin/package.json

# Copy the final unified server entry point
COPY --from=builder /app/apps/server/build/server.js ./server.js

EXPOSE 8000

# The command to run the final unified server
CMD ["node", "server.js"]