FROM node:20-alpine
WORKDIR /workspace/client
COPY shared /workspace/shared
COPY client/package.json client/package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install
COPY client/. .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
