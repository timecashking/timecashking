# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema first (needed for prisma generate)
COPY prisma ./prisma/

# Clear any existing prisma cache and install dependencies
RUN rm -rf node_modules/.prisma && \
    npm ci --only=production && \
    npx prisma generate

# Copy source code
COPY . .

# Generate Prisma client again to be sure
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]