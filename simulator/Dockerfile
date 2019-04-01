## Maintain version 11.10.1 until https://github.com/facebook/jest/issues/8069 is fixed
FROM node:11.10.1-alpine 

WORKDIR /usr/src/app

RUN npm install -g concurrently

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "watch"]
