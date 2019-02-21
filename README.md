iot-simulator

## Running

### Local Installation

The simulator requires the following software to be previously installed:
* RabbitMQ with the following plugins:
    * `rabbitmq_mqtt`
    * `rabbitmq_management`
    * `rabbitmq_web_stomp`
* MongoDB
* NodeJS

To enable the RabbitMQ plugins, run: 
```bash
rabbitmq-plugins enable rabbitmq_mqtt rabbitmq_management rabbitmq_web_stomp
```

To run mongoDB, in the simulator directory, execute:
```bash
mongod --dbpath=./data
```

After installing its dependencies, the simulator can be run:
```bash
npm install

npm start
```

### Docker

With Docker and docker-compose installed, run:

```bash
docker-compose up --build
```
