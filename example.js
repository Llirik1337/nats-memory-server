const { existsSync } = require("fs");
const { NatsServer, DEFAULT_CONSTANTS } = require("./dist/index");

const { connect, StringCodec } = require("nats");

(async () => {
  // await NatsServer.checkAndDownload();

  // console.dir(existsSync(DEFAULT_CONSTANTS.downloadDir + "/nats-server"));

  const server = await NatsServer.create({
    verbose: true,
    instance: { port: 4222 },
  });

  try {
    // to create a connection to a nats-server:

    const nc = await connect({ servers: server.getUrl() });

    // create a codec
    const sc = StringCodec();
    // create a simple subscriber and iterate over messages
    // matching the subscription
    const sub = nc.subscribe("hello");
    (async () => {
      for await (const m of sub) {
        console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
      }
      console.log("subscription closed");
    })();

    nc.publish("hello", sc.encode("world"));
    nc.publish("hello", sc.encode("again"));

    // we want to insure that messages that are in flight
    // get processed, so we are going to drain the
    // connection. Drain is the same as close, but makes
    // sure that all messages in flight get seen
    // by the iterator. After calling drain on the connection
    // the connection closes.
    await nc.drain();
  } catch (error) {
    console.error(error);
  } finally {
    await server.stop();
  }
})();
