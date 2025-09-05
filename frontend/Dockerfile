# ETAPA 1: Construcción de la aplicación Angular

FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration=production

#ETAPA 2: SERVIDOR WEB NGINX

FROM nginx:1.15-alpine

COPY --from=build /usr/src/app/dist/images-gallery /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]