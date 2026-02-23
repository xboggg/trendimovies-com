FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Set environment
ENV HOST=0.0.0.0
ENV PORT=3003
ENV NODE_ENV=production

EXPOSE 3003

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
