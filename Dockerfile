FROM mcr.microsoft.com/playwright:v1.58.2-jammy
# Set working directory
WORKDIR /app

# Copy package files first (speeds up rebuilds)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Environment variable to make Playwright use bundled browsers
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Start the scraper
CMD ["node", "scraper.js"]
