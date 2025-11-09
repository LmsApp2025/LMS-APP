# ---- Stage 1: Build the Admin Panel (Next.js) ----
FROM node:20-alpine AS admin-builder
WORKDIR /app

# Copy all package.json files to leverage Docker layer caching
COPY package*.json ./
COPY packages/admin/package*.json ./packages/admin/
COPY packages/server/package*.json ./packages/server/

# Install dependencies ONLY for the admin workspace
RUN npm install --workspace=admin

# Copy the admin source code and build it
COPY packages/admin ./packages/admin/
RUN npm run build --workspace=admin


# ---- Stage 2: Build the Server (TypeScript) ----
FROM node:20-alpine AS server-builder
WORKDIR /app

# Copy all package.json files again
COPY package*.json ./
COPY packages/admin/package*.json ./packages/admin/
COPY packages/server/package*.json ./packages/server/

# Install dependencies ONLY for the server workspace
RUN npm install --workspace=server

# Copy the server source code and build it
COPY packages/server ./packages/server/
RUN npm run build --workspace=server


# ---- Stage 3: Final Production Image ----
FROM node:20-alpine AS production
WORKDIR /app

# Copy all package.json files
COPY package*.json ./
COPY packages/admin/package*.json ./packages/admin/
COPY packages/server/package*.json ./packages/server/

# Install ALL production dependencies for both workspaces
RUN npm install --omit=dev

# Copy the built admin panel from the admin-builder stage
COPY --from=admin-builder /app/packages/admin/.next ./packages/admin/.next
COPY --from=admin-builder /app/packages/admin/public ./packages/admin/public
COPY --from=admin-builder /app/packages/admin/next.config.js ./packages/admin/next.config.js 

# Copy the built server code and assets from the server-builder stage
COPY --from=server-builder /app/packages/server/build ./build
COPY --from=server-builder /app/packages/server/mails ./mails

EXPOSE 8000

# This now correctly points to the unified server entry point
CMD ["node", "build/server.js"]