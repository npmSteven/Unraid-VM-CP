# Use the official Node.js 14 image as the base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files for backend to the container
COPY backend/package*.json ./backend/

# Install the backend dependencies
RUN cd backend && npm install

# Copy the entire backend application to the container
COPY backend/ ./backend/

# Build the backend
RUN cd backend && npm run build

# Copy the package.json and package-lock.json files for frontend to the container
COPY frontend/package*.json ./frontend/

# Install the frontend dependencies
RUN cd frontend && npm install

# Copy the entire frontend application to the container
COPY frontend/ ./frontend/

# Build the frontend
RUN cd frontend && npm run build

# Copy the start script to the container
COPY start.sh .

# Set the environment variable
ENV NODE_ENV=production

# Make the start script executable
RUN chmod +x start.sh

# Start the backend and frontend servers
CMD [ "./start.sh" ]

# Expose the port that the frontend will listen on
EXPOSE 3000
