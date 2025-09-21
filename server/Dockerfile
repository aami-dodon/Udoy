FROM node:20-alpine
WORKDIR /workspace/server
COPY shared /workspace/shared
COPY server/package.json server/package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install
COPY server/. .
EXPOSE 5000
CMD ["npm", "run", "dev"]
