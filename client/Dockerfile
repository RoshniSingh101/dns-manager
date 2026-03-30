# Use the official Node.js image
FROM node:20-bookworm-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install libraries
COPY package*.json ./
RUN npm install

# Copy the rest of server code (api.js, dns-engine.js, etc.)
COPY . .

# Open the ports (3000 for API, 1053 for DNS)
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]