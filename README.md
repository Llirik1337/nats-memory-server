# NATS In-Memory Server

[![GitHub license](https://img.shields.io/github/license/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/issues)
[![GitHub stars](https://img.shields.io/github/stars/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/stargazers)

`nats-memory-server` is a Node.js package that provides an in-memory NATS server for testing and local development. It allows you to quickly set up and tear down a NATS server instance within your Node.js applications, eliminating the need for a globally installed NATS server or Docker containers during tests.

## Table of Contents
1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [API Reference](#api-reference)
5. [NATS Jetstream](#nats-jetstream)
6. [Testing with Jest](#testing-with-jest)
7. [Contributing](#contributing)
8. [License](#license)

## Installation

You can install `nats-memory-server` using npm or yarn:

```bash
npm install nats-memory-server
```

or

```bash
yarn add nats-memory-server
```

## Quick Start

```javascript
const { NatsServerBuilder } = require('nats-memory-server');
const { connect, StringCodec } = require('nats');

(async () => {
  // Start the NATS server
  const server = await NatsServerBuilder.create().build().start();
  console.log(`NATS Server started at: ${server.getUrl()}`);

  try {
    // Connect to the in-memory server
    const nc = await connect({ servers: server.getUrl() });
    const sc = StringCodec();

    // Simple pub/sub
    const sub = nc.subscribe('hello');
    (async () => {
      for await (const m of sub) {
        console.log(`Received: ${sc.decode(m.data)}`);
      }
    })();

    nc.publish('hello', sc.encode('world'));

    await nc.drain();
  } finally {
    // Stop the NATS server
    await server.stop();
  }
})();
```

## Configuration

`nats-memory-server` can be configured via various configuration files or directly in `package.json`.

### Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `download` | `boolean` | `true` | Whether to download the NATS binary automatically. |
| `downloadDir` | `string` | `node_modules/.cache/nats-memory-server` | Directory where the binary will be downloaded. |
| `version` | `string` | `v2.9.16` | NATS server version to download. |
| `buildFromSource` | `boolean` | `false` | Whether to build NATS from source. |
| `binPath` | `string` | `node_modules/.cache/nats-memory-server/nats-server` | Path to the NATS server binary. |
| `downloadUrl` | `string` | `undefined` | Custom URL to download the NATS binary from. |

### Configuration Files

You can create one of the following files in your project root:

- `nats-memory-server.json`
- `nats-memory-server.js`
- `nats-memory-server.ts`

#### Example `nats-memory-server.json`
```json
{
  "version": "v2.10.0",
  "downloadDir": "./custom/bin"
}
```

### Configuration in `package.json`

Add a `natsMemoryServer` field to your `package.json`:

```json
{
  "natsMemoryServer": {
    "version": "v2.10.0"
  }
}
```

## API Reference

### `NatsServerBuilder`

A fluent builder to create a `NatsServer` instance.

- `static create(options?: Partial<NatsServerOptions>): NatsServerBuilder`: Creates a new builder.
- `setBinPath(binPath: string): this`: Sets the path to the NATS binary.
- `setVerbose(verbose: boolean): this`: Enables or disables verbose logging.
- `setPort(port: number): this`: Sets a specific port for the server.
- `setIp(ip: string): this`: Sets the IP address to bind to.
- `setArgs(args: string[]): this`: Sets additional command-line arguments for NATS server.
- `setLogger(logger: Logger): this`: Sets a custom logger.
- `build(): NatsServer`: Builds the `NatsServer` instance.

### `NatsServer`

The NATS server instance.

- `async start(): Promise<this>`: Starts the NATS server.
- `async stop(): Promise<void>`: Stops the NATS server.
- `getUrl(): string`: Returns the NATS URL (e.g., `nats://127.0.0.1:4222`).
- `getHost(): string`: Returns the host.
- `getPort(): number`: Returns the port.

## NATS Jetstream

To enable Jetstream, pass the `--jetstream` argument:

```typescript
const server = await NatsServerBuilder.create()
  .setArgs(['--jetstream', '--store_dir', os.tmpdir()])
  .build()
  .start();
```

## Testing with Jest

```typescript
const { NatsServerBuilder } = require('nats-memory-server');
const { connect } = require('nats');

let server;
let nc;

beforeAll(async () => {
  server = await NatsServerBuilder.create().build().start();
  nc = await connect({ servers: server.getUrl() });
});

afterAll(async () => {
  await nc.close();
  await server.stop();
});

test('should publish and subscribe', async () => {
  // Your test logic here
});
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/Llirik1337/nats-memory-server).

Please follow the [Code of Conduct](https://github.com/Llirik1337/nats-memory-server/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Llirik1337/nats-memory-server/blob/main/LICENSE) file for details.
