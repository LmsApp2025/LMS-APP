# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# 1. Copy root configuration files
COPY package.json package-lock.json turbo.json ./

# 2. CRITICAL: Copy workspace package.json files BEFORE running npm install
# npm needs these to resolve the workspace dependencies defined in package-lock.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/server/package.json ./apps/server/package.json
# We copy mobile too to satisfy the workspace lockfile integrity, 
# even if we aren't building it.
#COPY apps/mobile/package.json ./apps/mobile/package.json 

# 3. Install ALL deps including devDependencies
# Now npm sees the sub-packages and installs 'express', 'types', etc.
RUN npm ci --include=dev

# 4. Install global tools
RUN npm install -g next typescript

# 5. Copy the rest of the source code
COPY . .

# 6. Build
RUN npx turbo build --filter=admin --filter=server

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy standalone Next.js (Admin)
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Copy Server build
COPY --from=builder /app/apps/server/build ./apps/server/build
COPY --from=builder /app/apps/server/src/mails ./apps/server/mails
# Copy Server package.json and node_modules for runtime dependencies
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
# NOTE: In a robust setup, you might want to prune devDependencies here, 
# but copying the hoisted node_modules is the safest way to ensure runtime deps exist.
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8000

# Ensure we use the correct path to the compiled server file
CMD ["node", "apps/server/build/server.js"]