import {
  type NatsServerOptions,
  NatsServer,
  DEFAULT_NATS_SERVER_OPTIONS,
} from './index';

export class NatsServerBuilder {
  private options: NatsServerOptions = DEFAULT_NATS_SERVER_OPTIONS;

  constructor(options?: Partial<NatsServerOptions>) {
    if (options != null) {
      this.options = { ...this.options, ...options };
    }
  }

  static create(options?: Partial<NatsServerOptions>): NatsServerBuilder {
    return new NatsServerBuilder(options);
  }

  setVerbose(verbose: boolean): this {
    this.options = { ...this.options, verbose };
    return this;
  }

  setPort(port: number): this {
    this.options = { ...this.options, port };
    return this;
  }

  setIp(ip: string): this {
    this.options = { ...this.options, ip };
    return this;
  }

  setArgs(args: string[]): this {
    this.options = { ...this.options, args };
    return this;
  }

  async build(): Promise<NatsServer> {
    const server = new NatsServer(this.options);
    return server;
  }
}
