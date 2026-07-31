FROM node:18-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]