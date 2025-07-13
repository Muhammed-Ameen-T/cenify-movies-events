FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VITE_API_URL=http://backend:3000/api
EXPOSE 5173
CMD ["npm", "run", "dev"]