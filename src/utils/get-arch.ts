import os from 'os';
const archMap: Record<string, string | undefined> = {
  x64: `amd64`,
};

export function getArch(): string {
  const osArch = os.arch();
  return archMap[osArch] ?? osArch;
}
