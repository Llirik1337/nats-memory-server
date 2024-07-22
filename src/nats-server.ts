import child_process from 'child_process';
import os from 'os';
import path from 'path';
import { getFreePort, getProjectPath } from './utils';
import fs from 'fs';
import { promisify } from 'util';

const readFilePromise = promisify(fs.readFile);

export const DEFAULT_NATS_SERVER_CONSTANTS = {
  downloadDir: `node_modules/.cache/nats-memory-server`,
  executeFileName: `nats-server`,
} as const;

export interface Logger {
  log: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

export interface NatsServerOptions {
  verbose: boolean;
  args: string[];
  port?: number;
  ip: string;
  logger: Logger;
}

export const DEFAULT_NATS_SERVER_OPTIONS = {
  verbose: true,
  ip: `0.0.0.0`,
  args: [],
  logger: console,
} satisfies NatsServerOptions;

export class NatsServer {
  private process?: child_process.ChildProcessWithoutNullStreams;

  private host!: string;
  private port!: number;

  constructor(private readonly options: NatsServerOptions) {}

  async start(): Promise<this> {
    const { verbose, logger } = this.options;

    const projectPath = getProjectPath();
    const packageJsonPath = path.resolve(projectPath, `./package.json`);

    if (this.process != null) {
      const message = `Nats server already started at ${this.getUrl()}`;

      if (verbose) {
        logger.warn(message);
      }

      return this;
    }

    const packageJsonFileContent = await readFilePromise(
      packageJsonPath,
      `utf8`,
    );

    const packageJson = JSON.parse(packageJsonFileContent);

    const natsMemoryServerConfig = {
      ...DEFAULT_NATS_SERVER_CONSTANTS,
      ...packageJson?.natsMemoryServer,
    };

    const { args, ip, port = await getFreePort() } = this.options;

    const suffix = os.platform() === `win32` ? `.exe` : ``;

    let { downloadDir, executeFileName } = natsMemoryServerConfig;

    downloadDir = path.resolve(projectPath, downloadDir);

    return await new Promise((resolve, reject) => {
      this.process = child_process.spawn(
        path.resolve(downloadDir, executeFileName) + suffix,
        [`--addr`, ip, `--port`, port.toString(), ...args],
        { stdio: `pipe` },
      );

      this.host = ip;
      this.port = port;

      this.process.once(`error`, (err) => {
        if (verbose) {
          logger.error(`NATS server error:`, err);
        }

        reject(err);
      });

      this.process.stderr.on(`data`, (data: unknown) => {
        if (verbose && data != null) {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          logger.log(data.toString());
        }

        if (data?.toString().includes(`Server is ready`) === true) {
          if (verbose) {
            logger.log(`NATS server is ready!`);
          }
          resolve(this);
          this.process?.unref();
        }
      });

      this.process.on(`close`, (code) => {
        if (verbose) {
          logger.log(`NATS server was stop!`);
        }

        if (code === 0 || code === 1) {
          resolve(this);
        } else {
          const message = `Process was killed ${
            code !== null ? `with exit code: ${code}` : ``
          } `;

          if (verbose) {
            logger.warn(message, code);
          }

          reject(new Error(message));
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

    const { verbose, logger } = this.options;

    await new Promise<void>((resolve) => {
      this.process?.on(`close`, (_code, _signal) => {
        if (verbose) {
          logger.log(`NATS server was stop at:`, this.getUrl());
        }

        resolve();
      });

      this.process?.kill();
    });
  }
}
