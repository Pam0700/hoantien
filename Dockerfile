FROM node:18-alpine

# Cài đặt Chromium trực tiếp từ kho gói siêu nhẹ của Alpine
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Khai báo không tải Chromium của Puppeteer để tiết kiệm bộ nhớ
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./

# Cài đặt bản Production chống ngốn RAM
RUN npm install --production --no-audit --no-fund

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
