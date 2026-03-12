# Use Playwright official image with Chromium pre-installed
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json / yarn.lock
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of your scraper code
COPY . .

# The browsers are already included, no need to run `npx playwright install`
# Start the scraper
CMD ["node", "scraper.js"]
