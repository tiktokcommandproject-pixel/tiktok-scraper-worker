# Use the official Playwright image that already has Chromium installed
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install npm dependencies
RUN npm install

# Copy all project files
COPY . .

# Start scraper
CMD ["node", "scraper.js"]
