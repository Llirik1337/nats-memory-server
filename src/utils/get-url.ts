export function getUrl(
  version: string,
  platform: string,
  arch: string,
  buildFromSource = false,
): string {
  if (buildFromSource) {
    return `https://github.com/nats-io/nats-server/archive/refs/tags/${version}.zip`;
  }

  return `https://github.com/nats-io/nats-server/releases/download/${version}/nats-server-${version}-${platform}-${arch}.zip`;
}
