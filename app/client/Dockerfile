FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 6004
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "6004"]
