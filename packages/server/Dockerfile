# Stage 1: Build the TypeScript code

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This will now correctly use tsconfig.json and create the /build directory
RUN npm run build

# Stage 2: Create the final production image
FROM node:20-alpine

WORKDIR /app

# Copy production dependencies manifest
COPY --from=builder /app/package*.json ./
# Install only production dependencies
RUN npm install --omit=dev

# Copy the compiled code and other necessary assets from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/mails ./mails

EXPOSE 8000
CMD [ "node", "build/server.js" ]
