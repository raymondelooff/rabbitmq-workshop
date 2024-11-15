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
    const routingKey = 'hello_world_rk';

    channel.assertExchange(exchangeName, 'direct', {
      durable: true
    });

    let i = 0;

    const interval = setInterval(function() {
      const msg = `Message ${i}`;

      channel.publish(exchangeName, routingKey, Buffer.from(msg));

      ++i;
    }, 100);

    process.on('SIGINT', () => {
      console.log('Closing connection...');

      clearInterval(interval);
      connection.close();
    });
  });

  connection.on('close', function () {
    console.log('Stopping sender...');

    process.exit(0);
  });
});
