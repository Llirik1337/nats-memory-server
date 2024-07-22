import { NatsServer } from './nats-server';
import { NatsServerBuilder } from './nats-server.builder';
import { connect, StringCodec } from 'nats';

describe(NatsServer.name, () => {
  it(`Should start and stop NATS server`, async () => {
    const server = await NatsServerBuilder.create().build().start();

    const natsCilent = await connect({ servers: server.getUrl() });

    const sc = StringCodec();
    const sub = natsCilent.subscribe(`hello`, { max: 1 });

    natsCilent.publish(`hello`, sc.encode(`world`));

    for await (const m of sub) {
      const msg = sc.decode(m.data);
      expect(msg).toStrictEqual(`world`);
    }
    await natsCilent.close();
    await server.stop();
  });
});
