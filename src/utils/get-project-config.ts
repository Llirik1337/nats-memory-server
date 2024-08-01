import path, { isAbsolute } from 'path';
import fs from 'fs';

const configKey = `natsMemoryServer`;
const configFileName = `nats-memory-server-config.json`;

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
  const projectConfigPath = path.resolve(projectPath, `./${configFileName}`);
  const packageJsonPath = path.resolve(projectPath, `./package.json`);

  let config: NatsMemoryServerConfig;

  if (fs.existsSync(projectConfigPath)) {
    config = {
      ...defaultConfig,
      ...JSON.parse(fs.readFileSync(projectConfigPath, `utf8`)),
    };
  } else if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, `utf8`));
    config = { ...defaultConfig, ...packageJson[configKey] };
  } else {
    config = defaultConfig;
  }

  return prepareConfig(config, projectPath);
}
