# Use official Node.js LTS image
FROM node:23-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on (change if needed)
EXPOSE 3004

# Start the application
CMD ["npm", "start"]