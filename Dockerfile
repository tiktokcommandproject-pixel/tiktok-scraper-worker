FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Install Playwright browsers (IMPORTANT)
RUN npx playwright install chromium

# Copy rest of the code
COPY . .

# Tell Playwright where browsers are
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Start worker
CMD ["node", "scraper.js"]
