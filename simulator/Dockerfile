FROM node:alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install -g concurrently
RUN npm install

COPY . .

CMD ["npm", "run", "watch"]