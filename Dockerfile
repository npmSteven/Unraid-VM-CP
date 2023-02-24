# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

COPY package*.json .
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install dependencies for the root directory, backend, and frontend
RUN npm install 
RUN npm run build:all

# Build the backend and frontend
RUN cd backend && npm run build && cd ../frontend && npm run build

# Expose the ports that the application will be listening on
EXPOSE 8776
EXPOSE 8777

# Set the default command for the container to start the application
CMD ["npm", "run", "start:all"]