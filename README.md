iot-simulator

## Running

### Local Installation

The simulator requires the following software to be previously installed:
* RabbitMQ with the following plugins:
    * `rabbitmq_mqtt`
    * `rabbitmq_management`
* NodeJS

To enable the RabbitMQ plugins, run: 
```bash
rabbitmq-plugins enable rabbitmq_mqtt rabbitmq_management rabbitmq_web_stomp
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


# Simulator

## RabbitMQ Setup

In order for the simulator proxying to work, there must be two different virtual hosts. Once vhost will host the reading of messages by the devices, while the other will host the writing. 
The simulator's proxy will take care of routing between both. 


# TOML API

The TOML API is defined [here](simulator/src/api/Proxy/Config.ts). The mathematical operations use [mathjs](https://mathjs.org/) for evaluating and parsing. This may pose some security issues. To obtain more information, read the [security implications](https://mathjs.org/docs/expressions/security.html).

To build a generator, it's possible to use a cron expression. The specific parser is [this one](https://github.com/kelektiv/node-cron). You can read more about cron expressions in the [Wikipedia page](https://en.wikipedia.org/wiki/Cron#Overview). However, you should note that a `seconds` field was prepended to the expression explained in the Wikipedia page.
