# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app code
COPY . .

# Expose the backend port (matches your .env -> 5000)
EXPOSE 5000

# Define environment variables (you can override these at runtime)
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
