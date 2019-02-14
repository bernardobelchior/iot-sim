FROM alpine
WORKDIR /usr/src/app
RUN apk add --update nodejs nodejs-npm
RUN apk add --update docker
COPY package*.json ./
EXPOSE 3000
RUN npm install
COPY . .
CMD ["npm", "run", "watch"]