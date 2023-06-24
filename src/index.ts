import child_process from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import net from "node:net";

import download from "download";
import decompress from "decompress";
import path from "node:path";

export interface NatsBinaryOpts {
  version?: string;
  downloadDir?: string;
  executeFileName?: string;
  systemBinary?: string;
}

export interface NatsMemoryInstancePropBaseT {
  args?: string[];
  port?: number;
}
export interface NatsMemoryInstancePropT extends NatsMemoryInstancePropBaseT {
  ip?: string;
}

export interface NatsServerOptions {
  instance?: NatsMemoryInstancePropT;
  binary?: NatsBinaryOpts;
  autoStart?: false;
  verbose?: false;
}

export const DEFAULT_NATS_SERVER_CONSTANTS = {
  downloadDir: "node_modules/.cache/nats-memory-server",
  version: "v2.9.16",
  ip: "0.0.0.0",
  executeFileName: "nats-server",
  args: [],
  verbose: false,
  autoStart: true,
} as const;

export class NatsServer {
  private process!: child_process.ChildProcessWithoutNullStreams;

  private host!: string;
  private port!: number;

  private constructor(private readonly options?: NatsServerOptions) {}

  private static async getFreePort() {
    return new Promise<number>((res) => {
      const srv = net.createServer();
      srv.listen(0, () => {
        const port = (srv.address() as any).port;
        srv.close(() => res(port));
      });
    });
  }

  private static async checkAndDownload(options?: NatsServerOptions) {
    const {
      downloadDir = DEFAULT_NATS_SERVER_CONSTANTS.downloadDir,
      version = DEFAULT_NATS_SERVER_CONSTANTS.version,
      executeFileName = DEFAULT_NATS_SERVER_CONSTANTS.executeFileName,
    } = options?.binary || {};

    const { verbose = DEFAULT_NATS_SERVER_CONSTANTS.verbose } = options || {};

    const sourceUrl = `https://github.com/nats-io/nats-server/archive/refs/tags/${version}.zip`;

    const natsServerNotDownload = fs.existsSync(downloadDir) === false;
    const natsServerNotBuilded =
      fs.existsSync(path.resolve(downloadDir, executeFileName)) === false;

    if (natsServerNotDownload) {
      verbose && console.log("Download sources NATS server");

      const fileBuffer = await download(sourceUrl, os.tmpdir());

      verbose && console.log("Downloaded was successful");
      verbose && console.log("Decompress sources");

      await decompress(fileBuffer, downloadDir, { strip: 1 });

      verbose && console.log("Decompress was successful sources");
    }

    if (natsServerNotBuilded) {
      return new Promise<void>((resolve, reject) => {
        const goBuild = child_process.spawn("go", ["build"], {
          cwd: downloadDir,
        });

        verbose &&
          goBuild.on("spawn", () => {
            console.log("NATS server start building!");
          });

        verbose &&
          goBuild.stdout.on("data", (data) => console.log(data.toString()));

        verbose &&
          goBuild.stderr.on("data", (data) => {
            console.log(data.toString());
          });

        goBuild.on("close", (code) => {
          verbose && console.log("NATS server was builded successful!");

          if (code === 0) {
            resolve();
          } else {
            reject();
          }
        });
      });
    }
  }

  static async create(options?: NatsServerOptions): Promise<NatsServer> {
    const { autoStart = DEFAULT_NATS_SERVER_CONSTANTS.autoStart } =
      options || {};

    await NatsServer.checkAndDownload(options);

    const server = new NatsServer(options);

    if (autoStart) {
      await server.start();
    }

    return server;
  }

  async start(): Promise<void> {
    if (this.process) {
      throw new Error(`Nats server already started at ${this.getUrl()}`);
    }

    const { verbose = DEFAULT_NATS_SERVER_CONSTANTS.verbose } =
      this.options || {};

    const {
      ip = DEFAULT_NATS_SERVER_CONSTANTS.ip,
      args = DEFAULT_NATS_SERVER_CONSTANTS.args,
      port = await NatsServer.getFreePort(),
    } = this.options?.instance || {};

    const {
      downloadDir = DEFAULT_NATS_SERVER_CONSTANTS.downloadDir,
      executeFileName = DEFAULT_NATS_SERVER_CONSTANTS.executeFileName,
    } = this.options?.binary || {};

    const suffix = os.platform() === "win32" ? ".exe" : "";

    return new Promise((resolve, reject) => {
      this.process = child_process.spawn(
        path.resolve(downloadDir, executeFileName) + suffix,
        ["--addr", ip, "--port", port.toString(), ...args],
        { stdio: "overlapped" }
      );

      this.host = ip;
      this.port = port;

      this.process.stderr.on("data", (data) => {
        verbose && console.log(data.toString());

        if (data?.toString()?.includes("Server is ready")) {
          resolve();
        }
      });

      this.process.on("close", (code) => {
        verbose && console.log("NATS server was stop!");

        if (code === 0) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  public getUrl() {
    return `nats://${this.host}:${this.port}`;
  }

  public getHost() {
    return this.host;
  }

  public getPort() {
    return this.port;
  }

  public async stop() {
    const { verbose = DEFAULT_NATS_SERVER_CONSTANTS.verbose } =
      this.options || {};

    return new Promise<void>((resolve) => {
      this.process.on("close", (code, signal) => {
        verbose && console.log("NATS server was stop at:", this.getUrl());

        resolve();
      });

      this.process.kill("SIGTERM");
    });
  }
}
