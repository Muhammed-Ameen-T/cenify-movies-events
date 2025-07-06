# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
COPY .env ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM base AS builder
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY .env ./
RUN npm install --only=production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]