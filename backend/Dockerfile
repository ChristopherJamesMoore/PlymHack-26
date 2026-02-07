FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY model ./model

ENV PORT=5050
EXPOSE 5050

CMD ["node", "src/server.mjs"]
