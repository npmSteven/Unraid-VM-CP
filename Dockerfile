# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

COPY package*.json .
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Install and build
RUN npm install
RUN npm run build:frontend
RUN npm run build:backend

# Expose the ports that the application will be listening on
EXPOSE 8786
EXPOSE 8787

# Set the default command for the container to start the application
CMD ["npm", "run", "start:all"]