# Stage 1: Build Image
FROM node:22-alpine AS build
RUN apk add git
WORKDIR /app

COPY package*.json ./
RUN npm install -y
COPY . .
RUN npm run build

# Stage 2, use the compiled app, ready for production with Nginx
FROM nginx:1.21.6-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY inject-env.sh /docker-entrypoint.d/inject-env.sh
RUN chmod +x /docker-entrypoint.d/inject-env.sh