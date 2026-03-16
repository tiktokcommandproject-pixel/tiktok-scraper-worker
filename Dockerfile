FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

# Install Playwright browsers
RUN npx playwright install --with-deps

COPY . .

ENV PLAYWRIGHT_BROWSERS_PATH=0

CMD ["node", "scraper.js"]
