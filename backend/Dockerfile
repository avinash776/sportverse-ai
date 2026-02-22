FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p data uploads/videos uploads/images uploads/certificates
EXPOSE 5000
CMD ["npm", "run", "dev"]
