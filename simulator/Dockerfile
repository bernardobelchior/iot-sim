FROM node:alpine

WORKDIR /usr/src/app

RUN npm install -g concurrently

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "watch"]
