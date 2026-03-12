# Use official Playwright image with latest dependencies
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Optional: expose a port if needed (not needed for worker)
# EXPOSE 3000

# Environment variable (you can override in Render)
ENV NODE_ENV=production

# Start your scraper
CMD ["node", "scraper.js"]
