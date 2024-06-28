import child_process from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { getFreePort } from './utils';
import fs from 'node:fs/promises';

const packageJsonPath = path.resolve(`./package.json`);

export const DEFAULT_NATS_SERVER_CONSTANTS = {
  downloadDir: `node_modules/.cache/nats-memory-server`,
  executeFileName: `nats-server`,
} as const;

export interface NatsServerOptions {
  verbose: boolean;
  args: string[];
  port?: number;
  ip: string;
}

export const DEFAULT_NATS_SERVER_OPTIONS = {
  verbose: true,
  ip: `0.0.0.0`,
  args: [],
} satisfies NatsServerOptions;

export class NatsServer {
  private process?: child_process.ChildProcessWithoutNullStreams;

  private host!: string;
  private port!: number;

  constructor(private readonly options: NatsServerOptions) {}

  async start(): Promise<void> {
    if (this.process != null) {
      throw new Error(`Nats server already started at ${this.getUrl()}`);
    }

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, `utf8`));

    const natsMemoryServerConfig = {
      ...DEFAULT_NATS_SERVER_CONSTANTS,
      ...packageJson?.natsMemoryServer,
    };

    const { verbose, args, ip, port = await getFreePort() } = this.options;

    const suffix = os.platform() === `win32` ? `.exe` : ``;

    const { downloadDir, executeFileName } = natsMemoryServerConfig;

    return new Promise<void>((resolve, reject) => {
      this.process = child_process.spawn(
        path.resolve(downloadDir, executeFileName) + suffix,
        [`--addr`, ip, `--port`, port.toString(), ...args],
        { stdio: `pipe` },
      );

      this.host = ip;
      this.port = port;

      this.process.once(`error`, (err) => {
        reject(err);
      });

      this.process.stderr.on(`data`, (data: unknown) => {
        verbose && console.log(data?.toString());

        if (data?.toString().includes(`Server is ready`) === true) {
          resolve();
          this.process?.unref();
        }
      });

      this.process.on(`close`, (code) => {
        verbose && console.log(`NATS server was stop!`);

        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              `Process was killed ${
                code !== null ? `with exit code: ${code}` : ``
              } `,
            ),
          );
        }
      });
    });
  }

  public getUrl(): string {
    return `nats://${this.host}:${this.port}`;
  }

  public getHost(): string {
    return this.host;
  }

  public getPort(): number {
    return this.port;
  }

  public async stop(): Promise<void> {
    if (this.process == null) {
      return;
    }

    const { verbose } = this.options;

    return new Promise<void>((resolve) => {
      this.process?.on(`close`, (_code, _signal) => {
        verbose && console.log(`NATS server was stop at:`, this.getUrl());

        resolve();
      });

      this.process?.kill(`SIGTERM`);
    });
  }
}
