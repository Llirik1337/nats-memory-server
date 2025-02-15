# NATS In-Memory Server

[![GitHub license](https://img.shields.io/github/license/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/issues)
[![GitHub stars](https://img.shields.io/github/stars/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/stargazers)


## Table of Contents
1. [Description](#description)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [NATS Jetstream](#nats-jetstream)
6. [Example](#example)
7. [Contributing](#contributing)


# Description

`nats-memory-server` is a Node.js package that provides an in-memory NATS server for testing and other purposes. It allows you to quickly set up and tear down a NATS server instance within your Node.js applications, making it easier to write tests and perform other operations that require a NATS server.

## Requirements

- [Go](https://golang.org/) (Optional. Only if you build from source) (version 1.19 or later)

## Installation

You can install `nats-memory-server` using npm or yarn:

```bash
npm install nats-memory-server
```

or

```bash
yarn add nats-memory-server
```

## Configuration

Default configuration is:

- download: true
- downloadDir: 'node_modules/.cache/nats-memory-server'
- version: 'v2.9.16'
- buildFromSource: false
- binPath: 'node_modules/.cache/nats-memory-server/nats-server'

For configuration, you can create one of the files:

- nats-memory-server.json
- nats-memory-server.js
- nats-memory-server.ts

### nats-memory-server.json

```json
{
  "download": true,
  "downloadDir": "node_modules/.cache/nats-memory-server",
  "version": "v2.9.16",
  "buildFromSource": false,
  "binPath": "node_modules/.cache/nats-memory-server/nats-server"
}
```

### nats-memory-server.js

```js
/**
 * @type {import('nats-memory-server').NatsMemoryServerConfig}
 */
const config = {
  download: true,
  downloadDir: 'node_modules/.cache/nats-memory-server',
  version: 'v2.9.16',
  buildFromSource: false,
  binPath: 'node_modules/.cache/nats-memory-server/nats-server',
};

module.exports = config;
```

### nats-memory-server.ts

```ts
import type { NatsMemoryServerConfig } from 'nats-memory-server';

const config: NatsMemoryServerConfig = {
  download: true,
  downloadDir: 'node_modules/.cache/nats-memory-server',
  version: 'v2.9.16',
  buildFromSource: false,
  binPath: 'node_modules/.cache/nats-memory-server/nats-server',
};

export default config;
```

### Configuration in `package.json`

You can declare the configurations in `package.json` in the `natsMemoryServer` field

```json
{
  "natsMemoryServer": {
    "download": true,
    "downloadDir": "node_modules/.cache/nats-memory-server",
    "version": "v2.9.16",
    "buildFromSource": false,
    "binPath": "node_modules/.cache/nats-memory-server/nats-server"
  },
}
```

## NATS Jetstream

You may use a method in the builder setArgs to pass the parameters
```ts
await NatsServerBuilder
      .create()
      .setArgs([`--jetstream`, `--store_dir`, os.tmpdir()])
      .build()
      .start();
```

Or you can pass it through the constructor
```ts
new NatsServer({
  ...DEFAULT_NATS_SERVER_OPTIONS,
  args: [`--jetstream`, `--store_dir`, os.tmpdir()],
});
```

## Example

[example.js](https://github.com/Llirik1337/nats-memory-server/blob/main/example.js)

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/Llirik1337/nats-memory-server).

When contributing, please ensure to follow the [code of conduct](https://github.com/Llirik1337/nats-memory-server/blob/main/CODE_OF_CONDUCT.md).
