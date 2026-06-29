FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the frontend application
RUN npm run build

# Expose the backend port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "server"]
