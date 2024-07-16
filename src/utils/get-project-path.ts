import path from 'path';

export function getProjectPath(cwd: string = process.cwd()): string {
  let nodeModulesDir = cwd;

  while (nodeModulesDir.endsWith(`node_modules${path.sep}nats-memory-server`)) {
    nodeModulesDir = path.resolve(nodeModulesDir, `..`, `..`);
  }

  return nodeModulesDir;
}
