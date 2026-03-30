# # Use the official Node.js image
# FROM node:20-bookworm-slim

# # Install build tools needed for native modules
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package files and install libraries
# COPY package*.json ./
# RUN npm install

# # Copy the rest of server code (api.js, dns-engine.js, etc.)
# COPY . .

# # Open the ports (3000 for API, 1053 for DNS)
# EXPOSE 3000
# EXPOSE 1053/udp

# # Start the server
# CMD ["npm", "run", "dev"]

# # Use the full version to ensure all GLIBC libraries are present
# FROM node:20-bookworm

# # Install essential build tools
# RUN apt-get update && apt-get install -y \
#     python3 \
#     make \
#     g++ \
#     && rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# # Copy package files first to leverage Docker cache
# COPY package*.json ./

# # Force a fresh build of native modules inside the container
# RUN npm install && npm rebuild sqlite3

# # Copy the rest of the code
# COPY . .

# EXPOSE 3000 1053/udp

# CMD ["npm", "run", "dev"]

# 1. Use Alpine - it's tiny and handles native builds differently
FROM node:20-alpine

# 2. Install build tools needed for SQLite on Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. CRITICAL: Force a clean compile specifically for this container
# RUN npm install --build-from-source sqlite3
RUN npm install

# 5. Copy the rest
COPY . .

EXPOSE 3000 1053/udp

CMD ["npm", "run", "dev"]