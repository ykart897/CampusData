# ─── Build aşaması ─────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Lock dosyası ile birlikte kopyala → cache layer
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kodu kopyala ve production build al
COPY . .
RUN npm run build

# ─── Runtime aşaması: nginx ile statik dosya servisi ──
FROM nginx:1.25-alpine

# Custom nginx config (reverse proxy + SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite build çıktısı → nginx html klasörüne
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
