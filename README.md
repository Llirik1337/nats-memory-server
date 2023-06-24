# nats-memory-server

[![GitHub license](https://img.shields.io/github/license/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/issues)
[![GitHub stars](https://img.shields.io/github/stars/Llirik1337/nats-memory-server)](https://github.com/Llirik1337/nats-memory-server/stargazers)

`nats-memory-server` is a Node.js package that provides an in-memory NATS server for testing and other purposes. It allows you to quickly set up and tear down a NATS server instance within your Node.js applications, making it easier to write tests and perform other operations that require a NATS server.

## Features

- Lightweight and easy to use
- In-memory NATS server
- Suitable for testing and local development
- Zero configuration required
- Simple API for starting and stopping the server
- Supports NATS server options

## Installation

You can install `nats-memory-server` using npm or yarn:

```bash
npm install nats-memory-server
```

or

```bash
yarn add nats-memory-server
```

## Usage

To use `nats-memory-server` in your Node.js application, follow these steps:

1. Import the package:

```javascript
const NatsMemoryServer = require("nats-memory-server");
```

2. Instantiate the server:

```javascript
const server = new NatsMemoryServer();
```

3. Start the server:

```javascript
await server.start();
```

4. Connect your NATS client to the server:

```javascript
const NATS = require("nats");

const nc = NATS.connect(server.getURI());
```

5. Perform your tests or other operations using the connected NATS client.

6. Stop the server:

```javascript
await server.stop();
```

That's it! Now you have an in-memory NATS server running for your application.

For more advanced usage and server options, please refer to the [API documentation](https://github.com/Llirik1337/nats-memory-server/blob/main/docs/API.md).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/Llirik1337/nats-memory-server).

When contributing, please ensure to follow the [code of conduct](https://github.com/Llirik1337/nats-memory-server/blob/main/CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](https://github.com/Llirik1337/nats-memory-server/blob/main/LICENSE).
