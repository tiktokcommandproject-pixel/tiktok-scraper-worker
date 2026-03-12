# Use Playwright image with browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy all scraper code
COPY . .

# Ensure scraper uses built-in browsers
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Start scraper
CMD ["node", "scraper.js"]
