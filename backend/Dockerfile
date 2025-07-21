# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./

# Accept NODE_ENV as build-time arg (for dev vs prod)
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Dev installs for development stage, prod uses npm ci later
RUN npm install

COPY . .

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

COPY --from=base /app /app

ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/index.js"] 