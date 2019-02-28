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

npm run watch
```

After installing its dependencies, the user interface can be run:
```bash
npm install

npm start
```

### Docker

With Docker and docker-compose installed, run:

```bash
docker-compose up --build
```

## Automated Tests

The `simulator` directory has automated tests. 
In order to run them, make sure you have a RabbitMQ server running and have specific the environment variables in `.env`.
Afterwards, run `npm test` and tests will run and show a coverage report.
