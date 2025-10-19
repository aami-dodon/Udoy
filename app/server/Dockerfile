FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install --production
RUN npx prisma generate

COPY . .

EXPOSE 6005
CMD ["npm", "start"]
