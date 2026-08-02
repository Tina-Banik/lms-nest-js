# Use official Node.js image (Node 20 Alpine for lightweight build)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose app port
EXPOSE 3000

# Start application in development mode (or "start:prod" for production)
CMD ["npm", "run", "start:dev"]