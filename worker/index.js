const amqp = require('amqplib/callback_api');
const process = require('node:process');

amqp.connect(process.env.AMQP_DSN, function (error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const exchangeName = 'hello_world';
    const queueName = 'hello_world_queue';
    const routingKey = 'hello_world_rk';

    channel.assertExchange(exchangeName, 'direct', {
      durable: true
    });

    channel.assertQueue(queueName, {
      durable: false
    });

    channel.bindQueue(queueName, exchangeName, routingKey);

    // Set maximum amount of messages waiting to be ACKed
    channel.prefetch(1);

    console.log("Waiting for messages in queue '%s'", queueName);

    channel.consume(queueName, function (msg) {
      // Some slow operation here, we simulate it with a
      // delayed ACK between 100 and 500 ms
      const ackDelay = (100 + Math.random() * 400);

      setTimeout(() => {
        console.log('Handled: %s. Took: %d ms', msg.content.toString(), ackDelay);

        channel.ack(msg);
      }, ackDelay);
    });

    process.on('SIGINT', function () {
      console.log('Closing connection...');

      connection.close();
    });
  });

  connection.on('close', function () {
    console.log('Stopping worker...');

    process.exit(0);
  });
});
