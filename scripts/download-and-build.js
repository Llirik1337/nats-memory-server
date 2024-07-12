const download = require(`download`);
const decompress = require(`decompress`);
const path = require(`path`);
const fs = require(`fs`);
const os = require(`os`);
const child_process = require(`child_process`);
const packageJsonPath = path.resolve(process.cwd(), `./package.json`);

const { natsMemoryServerConfig = {} } = require(packageJsonPath);

const DEFAULT_NATS_SERVER_CONSTANTS = {
  downloadDir: `node_modules/.cache/nats-memory-server`,
  version: `v2.9.16`,
  executeFileName: `nats-server`,
};

(async function () {
  const config = {
    ...DEFAULT_NATS_SERVER_CONSTANTS,
    ...natsMemoryServerConfig,
  };

  const { downloadDir, version, executeFileName } = config; 

  console.log(`NATS server config:`, config);

  console.log(`NATS server start download!`);

  const sourceUrl = `https://github.com/nats-io/nats-server/archive/refs/tags/${version}.zip`;

  const natsServerNotDownload = !fs.existsSync(path.resolve(process.cwd(),downloadDir));
  const natsServerNotBuilded = !fs.existsSync(
    path.resolve(process.cwd(),downloadDir, executeFileName),
  );

  if (natsServerNotDownload && natsServerNotBuilded) {
    console.log(`NATS server not found in cache, download it`);
  }

  if (natsServerNotDownload) {
    fs.mkdirSync(path.resolve(process.cwd(),downloadDir), { recursive: true });

    console.log(`Download sources NATS server`);

    const fileBuffer = await download(sourceUrl, os.tmpdir());

    console.log(`Downloaded was successful`);
    console.log(`Decompress sources`);

    await decompress(fileBuffer, path.resolve(process.cwd(),downloadDir), { strip: 1 });

    console.log(`Decompress was successful sources`);
  }

  if (natsServerNotBuilded) {
    return new Promise((resolve, reject) => {
      const goBuild = child_process.spawn(`go`, [`build`], {
        cwd: path.resolve(process.cwd(), downloadDir),
        stdio: `pipe`,
      });

      goBuild.unref();

      goBuild.once(`error`, (err) => {
        console.log(err);
        goBuild.kill();
        reject(err);
      });

      goBuild.on(`spawn`, () => {
        console.log(`NATS server start building!`);
      });

      goBuild.stdout.on(`data`, (data) => console.log(data.toString()));

      goBuild.stderr.on(`data`, (data) => {
        console.log(data.toString());
      });

      goBuild.on(`close`, (code) => {
        console.log(`NATS server was builded successful!`);

        if (code === 0) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }
})();
