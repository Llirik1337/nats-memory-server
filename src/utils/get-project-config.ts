import path, { isAbsolute } from 'path';
import fs from 'fs';

const configKey = `natsMemoryServer` as const;
const configFileBaseName = `nats-memory-server` as const;
const allowedExtensions = [`.ts`, `.js`, `.json`] as const;

const readFileMap = {
  '.ts': (filePath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/quotes
    const tsNode = require('ts-node');

    if (tsNode == null) {
      throw new Error(`ts-node is not installed`);
    }

    tsNode.register();
    return require(filePath);
  },
  '.js': (filePath: string) => require(filePath),
  '.json': (filePath: string) => JSON.parse(fs.readFileSync(filePath, `utf8`)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<(typeof allowedExtensions)[number], (path: string) => any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readFile(filePath: string): any {
  const ext = path.extname(filePath).toLowerCase();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return readFileMap[ext](filePath);
}

export interface NatsMemoryServerConfig {
  download: boolean;
  downloadDir: string;
  version: string;
  buildFromSource: boolean;
  binPath: string;
  downloadUrl?: string;
}

const defaultConfig: NatsMemoryServerConfig = {
  download: true,
  downloadDir: `node_modules/.cache/nats-memory-server`,
  version: `v2.9.16`,
  buildFromSource: false,
  binPath: `node_modules/.cache/nats-memory-server/nats-server`,
};

function prepareConfig(
  config: NatsMemoryServerConfig,
  projectPath: string,
): NatsMemoryServerConfig {
  let downloadDir = config.downloadDir;
  let binPath = config.binPath;

  if (!isAbsolute(config.downloadDir)) {
    downloadDir = path.resolve(projectPath, config.downloadDir);
  }

  if (!isAbsolute(config.binPath)) {
    binPath = path.resolve(projectPath, config.binPath);
  }
  return {
    ...config,
    downloadDir,
    binPath,
  };
}

export function getProjectConfig(projectPath: string): NatsMemoryServerConfig {
  const projectConfigPath = allowedExtensions
    .map((ext) => path.resolve(projectPath, `./${configFileBaseName}${ext}`))
    .find((filePath) => fs.existsSync(filePath));

  const packageJsonPath = path.resolve(projectPath, `./package.json`);

  let config: NatsMemoryServerConfig;

  if (projectConfigPath !== undefined) {
    config = {
      ...defaultConfig,
      ...readFile(projectConfigPath),
    };
  } else if (fs.existsSync(packageJsonPath)) {
    config = {
      ...defaultConfig,
      ...readFile(packageJsonPath)[configKey],
    };
  } else {
    config = defaultConfig;
  }

  return prepareConfig(config, projectPath);
}
