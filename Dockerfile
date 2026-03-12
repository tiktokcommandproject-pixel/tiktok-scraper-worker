# Use the official Playwright Docker image with all browsers
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy all the code
COPY . .

# Set environment variable for Playwright to use bundled browsers
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Default command
CMD ["node", "scraper.js"]
