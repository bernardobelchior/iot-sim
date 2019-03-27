iot-simulator

## Running

### Local Installation

The simulator requires the following software to be previously installed:
* RabbitMQ with the following plugins:
    * `rabbitmq_mqtt`
    * `rabbitmq_management`
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

## Examples

The `simulator` directory has example scenarios that can be used to quickly setup an environment. 

Before running, make sure you have a RabbitMQ instance running. Running multiple scenarios at the same time may create inconsistencies.

In order to run them, run `npm run example -- <example-name>`. When trying to run the example named `twoThings.ts`, the following commmand would have to be executed `npm run example -- twoThings`.

Note: in some cases, TypeScript compilation may be slower than running the example. If this happens, you should try again.


# Changes to the Web Thing API Spec

## Web Thing Description 

* Added a special "Simulated" `@type` that represents a simulated device. 
* Added `id` field to Web Thing description.

## WebSocket API

### `setProperty` message

* Added `"simulated": true` field to the `setProperty` message to signal that is comes from a simulated device.
