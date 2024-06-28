import child_process from "node:child_process";
import os from "node:os";
import net from "node:net";
import path from "node:path";

const packageJsonPath = path.resolve("./package.json");

const packageJson = require(packageJsonPath)

export const DEFAULT_NATS_SERVER_CONSTANTS = {
  downloadDir: "node_modules/.cache/nats-memory-server",
  executeFileName: "nats-server",
} as const;

export interface NatsServerOptions {
  verbose: boolean;
  args: string[];
  port?: number;
  ip: string;
}

const natsMemoryServerConfig = { ...DEFAULT_NATS_SERVER_CONSTANTS, ...packageJson.natsMemoryServerConfig };

export const DEFAULT_NATS_SERVER_OPTIONS = {
  verbose: true,
  ip: "0.0.0.0",
  args: [],
} satisfies NatsServerOptions;


export class NatsServer {
  private process!: child_process.ChildProcessWithoutNullStreams;

  private host!: string;
  private port!: number;

  private constructor(private readonly options: NatsServerOptions) { }

  private static async getFreePort() {
    return new Promise<number>((res) => {
      const srv = net.createServer();
      srv.listen(0, () => {
        const port = (srv.address() as any).port;
        srv.close(() => res(port));
      });
    });
  }

  static async create(options?: Partial<NatsServerOptions>): Promise<NatsServer> {

    const serverOptions = { ...DEFAULT_NATS_SERVER_OPTIONS, ...options };

    const server = new NatsServer(serverOptions);

    return server;
  }

  async start(): Promise<NatsServer> {
    if (this.process) {
      throw new Error(`Nats server already started at ${this.getUrl()}`);
    }

    const { verbose,
      args,
      ip,
      port = await NatsServer.getFreePort(),
    } = this.options;

    const suffix = os.platform() === "win32" ? ".exe" : "";

    const { downloadDir, executeFileName } = natsMemoryServerConfig;

    return new Promise<NatsServer>((resolve, reject) => {
      this.process = child_process.spawn(
        path.resolve(downloadDir, executeFileName) + suffix,
        ["--addr", ip, "--port", port.toString(), ...args],
        { stdio: "pipe" }
      );

      this.host = ip;
      this.port = port;

      this.process.once("error", (err) => {
        reject(err);
      });

      this.process.stderr.on("data", (data) => {
        verbose && console.log(data.toString());

        if (data?.toString()?.includes("Server is ready")) {
          resolve(this);
          this.process.unref();
        }
      });

      this.process.on("close", (code) => {
        verbose && console.log("NATS server was stop!");

        if (!code) {
          resolve(this);
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
    const { verbose = DEFAULT_NATS_SERVER_OPTIONS.verbose } =
      this.options || {};

    return new Promise<void>((resolve) => {
      this.process.on("close", (_code, _signal) => {
        verbose && console.log("NATS server was stop at:", this.getUrl());

        resolve();
      });

      this.process.kill("SIGTERM");
    });
  }
}
