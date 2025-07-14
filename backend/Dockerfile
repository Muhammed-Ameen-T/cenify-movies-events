# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./

# 👇 Force install of devDependencies
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

RUN npm install
COPY . .

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]
