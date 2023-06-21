import child_process, { SpawnOptionsWithoutStdio } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import net from "node:net";

import download from "download";
import decompress from "decompress";

export interface NatsBinaryOpts {
  version?: string;
  downloadDir?: string;
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
}

export class NatsServer {
  private process!: child_process.ChildProcessWithoutNullStreams;

  private url!: string;

  private constructor(private readonly options?: NatsServerOptions) {}

  private static async getFreePort() {
    return new Promise<number>((res) => {
      const srv = net.createServer();
      srv.listen(0, () => {
        const port = (srv.address() as any).port;
        srv.close((err) => res(port));
      });
    });
  }

  private static async checkAndDownload(options?: NatsServerOptions["binary"]) {
    const { downloadDir = "node_modules/.cache/nats-memory-server" } =
      options || {};

    const sourceUrl =
      "https://github.com/nats-io/nats-server/releases/download/v2.9.18/nats-server-v2.9.18-linux-amd64.zip";

    const natsServerNotDownload = fs.existsSync(downloadDir) === false;

    if (natsServerNotDownload) {
      const fileBuffer = await download(sourceUrl, os.tmpdir());
      await decompress(fileBuffer, downloadDir, { strip: 1 });
    }
  }

  static async create(options?: NatsServerOptions): Promise<NatsServer> {
    const { autoStart = true } = options || {};

    await NatsServer.checkAndDownload(options?.binary);

    const server = new NatsServer(options);

    if (autoStart) {
      await server.start();
    }

    return server;
  }

  private async start(): Promise<void> {
    const {
      ip = "127.0.0.1",
      args = [],
      port = await NatsServer.getFreePort(),
    } = this.options?.instance || {};

    return new Promise((resolve) => {
      this.process = child_process.spawn(
        "node_modules/.cache/nats-memory-server/nats-server",
        ["--addr", ip, "--port", port?.toString(), ...args]
      );

      this.process.once("spawn", () => {
        this.url = `nats://${ip}:${port}`;

        // this.process.stdout.on("data", (data) => {
        //   console.log(`stdout: ${data}`);
        // });

        // this.process.stderr.on("data", async (data) => {
        //   console.error(`stderr: ${data}`);
        // });

        resolve();
      });
    });
  }

  public getUrl() {
    return this.url;
  }

  public async stop() {
    return new Promise<void>((resolve) => {
      this.process.on("close", (code, signal) => {
        resolve();
      });

      this.process.kill("SIGTERM");
    });
  }
}
