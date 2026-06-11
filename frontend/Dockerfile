FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build production version
COPY . .
RUN npm run build


FROM nginx:stable-alpine
# Bring build files to the nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html
# serve the files
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
