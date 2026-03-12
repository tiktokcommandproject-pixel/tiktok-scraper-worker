# Use latest Playwright image with browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all the scraper code
COPY . .

# Optional: environment variable to avoid downloading browsers again
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Start the scraper
CMD ["node", "scraper.js"]
