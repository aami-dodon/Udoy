FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY app/client/package*.json ./
RUN npm install
RUN ln -s /usr/src/app/node_modules /usr/src/node_modules

COPY app/client ./
COPY app/shared /usr/src/shared

EXPOSE 6004
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "6004"]
