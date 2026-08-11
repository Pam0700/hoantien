FROM ghcr.io/puppeteer/puppeteer:21.5.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

USER root
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
