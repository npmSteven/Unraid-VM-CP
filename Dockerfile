# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

COPY package*.json .
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install and build
RUN npm install 
RUN npm run build:all

# Expose the ports that the application will be listening on
EXPOSE 3000
EXPOSE 8000

# Set the default command for the container to start the application
CMD ["npm", "run", "start:all"]