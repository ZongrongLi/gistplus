export const GITHUB_REPO = 'https://github.com/gistplusxyz/gistplus'

export const NPM_PACKAGES = {
  core: 'https://www.npmjs.com/package/@gistplus/core',
  client: 'https://www.npmjs.com/package/@gistplus/client',
  server: 'https://www.npmjs.com/package/@gistplus/server',
  gateway: 'https://www.npmjs.com/package/@gistplus/gateway',
  indexer: 'https://www.npmjs.com/package/@gistplus/indexer',
} as const

export function npmPackageUrl(name: string) {
  return `https://www.npmjs.com/package/${encodeURIComponent(name)}`
}
