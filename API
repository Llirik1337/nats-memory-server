Certainly! Here's an updated version of the `API.md` file that includes documentation for the additional methods `create()`, `getHost()`, `getPort()`, and `getUrl()`:

# `nats-memory-server` API Documentation

This documentation provides an overview of the API provided by the `nats-memory-server` package. `nats-memory-server` is a simple in-memory NATS server implementation that can be used for testing and development purposes.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Class: NatsMemoryServer](#class-natsmemoryserver)
    - [Constructor](#constructor)
    - [Methods](#methods)
      - [`create(): Promise<void>`](#create-promisepromisevoid)
      - [`start(): Promise<void>`](#start-promisepromisevoid)
      - [`stop(): Promise<void>`](#stop-promisepromisevoid)
      - [`getHost(): string`](#gethost-string)
      - [`getPort(): number`](#getport-number)
      - [`getUrl(): string`](#geturl-string)

## Installation

To install `nats-memory-server` in your Node.js project, use the following command:

```shell
npm install nats-memory-server
```

## Usage

To use `nats-memory-server`, import the package and create an instance of the `NatsMemoryServer` class. Then, you can start and stop the server as needed.

```typescript
import { NatsMemoryServer } from 'nats-memory-server';

async function runServer() {
  const server = await NatsMemoryServer.create();

  console.log('NATS server started on URL:', server.getUrl());

  // Perform NATS operations...

  await server.stop();
  console.log('NATS server stopped.');
}

runServer().catch(console.error);
```

## API Reference

### Class: NatsMemoryServer

The `NatsMemoryServer` class represents an in-memory NATS server.

#### Constructor

Creates a new instance of the `NatsMemoryServer` class.

```typescript
constructor(options?: NatsServerOptions)
```

The `options` parameter is an optional object that can be used to configure the server. It accepts the following properties:

- `port`: The port number to use for the server. Defaults to random free port.
- `verbose`: Whether to enable debug mode for the server. Defaults to `false`.

#### Methods

##### `create(): Promise<void>`

Creates the NATS server instance without starting it.

```typescript
async create(): Promise<void>
```

This method creates the server instance but does not start it. It can be useful if you need to perform additional setup before starting the server.

##### `start(): Promise<void>`

Starts the NATS server.

```typescript
async start(): Promise<void>
```

This method starts the server and returns a `Promise` that resolves once the server has started.

##### `stop(): Promise<void>`

Stops the NATS server.

```typescript
async stop(): Promise<void>
```

This method stops the server and returns a `Promise` that resolves once the server has stopped.

##### `getHost(): string`

Gets the host address of the NATS server.

```typescript
getHost(): string
```

This method returns the host address (e.g., `localhost` or `127.0.0.1`) of the NATS server.

##### `getPort(): number`

Gets the port number of the NATS server.

```typescript
getPort(): number
```

This method returns the port number that the NATS server is listening on

.

##### `getUrl(): string`

Gets the URL of the NATS server.

```typescript
getUrl(): string
```

This method returns the complete URL (including the protocol, host, and port) of the NATS server.

That's it! This is the API provided by the `nats-memory-server` package. You can use these methods to create, start, and stop the server, as well as retrieve information about the server's host, port, and URL.

For more information, refer to the package's [GitHub repository](https://github.com/Llirik1337/nats-memory-server) or consult the source code and TypeScript type definitions.
