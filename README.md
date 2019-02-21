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

### Docker

With Docker and docker-compose installed, run:

```bash
docker-compose up --build
```
