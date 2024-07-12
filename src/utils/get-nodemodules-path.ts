import path from 'node:path';

export function getNodemodulesPath(cwd: string = process.cwd()): string {
  let nodeModulesDir = cwd;

  console.log(`cwd:`, cwd);
  console.log(`node_modules${path.sep}nats-memory-server`);
  console.log(
    nodeModulesDir.endsWith(`node_modules${path.sep}nats-memory-server`),
  );

  while (nodeModulesDir.endsWith(`node_modules${path.sep}nats-memory-server`)) {
    nodeModulesDir = path.resolve(nodeModulesDir, `..`, `..`);
  }

  return nodeModulesDir;
}
