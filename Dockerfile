FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx playwright install --with-deps

CMD ["node", "scraper.js"]
