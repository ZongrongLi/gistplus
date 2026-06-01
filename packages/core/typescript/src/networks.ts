/**
 * Solana Network Configuration for Gist Plus
 */

import { clusterApiUrl } from '@solana/web3.js';

export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet';

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  wssUrl?: string;
  explorerUrl: string;
  isProd: boolean;
}

/**
 * Solana network configurations for Gist Plus
 */
export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  'localnet': {
    name: 'Localnet',
    rpcUrl: 'http://localhost:8899',
    wssUrl: 'ws://localhost:8900',
    explorerUrl: 'http://localhost:3000',
    isProd: false,
  },
  'devnet': {
    name: 'Devnet',
    rpcUrl: clusterApiUrl('devnet'),
    wssUrl: clusterApiUrl('devnet').replace('https', 'wss'),
    explorerUrl: 'https://explorer.solana.com',
    isProd: false,
  },
  'testnet': {
    name: 'Testnet',
    rpcUrl: clusterApiUrl('testnet'),
    wssUrl: clusterApiUrl('testnet').replace('https', 'wss'),
    explorerUrl: 'https://explorer.solana.com',
    isProd: false,
  },
  'mainnet-beta': {
    name: 'Mainnet Beta',
    rpcUrl: clusterApiUrl('mainnet-beta'),
    wssUrl: clusterApiUrl('mainnet-beta').replace('https', 'wss'),
    explorerUrl: 'https://explorer.solana.com',
    isProd: true,
  },
};

/**
 * Get network configuration
 */
export function getNetworkConfig(network: NetworkType = 'devnet'): NetworkConfig {
  return NETWORKS[network];
}

/**
 * Get RPC URL for network
 */
export function getRpcUrl(network: NetworkType = 'devnet'): string {
  return NETWORKS[network].rpcUrl;
}

/**
 * Get network from environment
 */
export function getNetworkFromEnv(): NetworkType {
  const env = process.env.SOLANA_NETWORK || process.env.NETWORK || 'devnet';
  if (env in NETWORKS) {
    return env as NetworkType;
  }
  console.warn(`Unknown network ${env}, defaulting to devnet`);
  return 'devnet';
}

/**
 * Check if running on production network
 */
export function isProduction(network: NetworkType): boolean {
  return NETWORKS[network].isProd;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txSignature: string, network: NetworkType = 'devnet'): string {
  const config = NETWORKS[network];
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `${config.explorerUrl}/tx/${txSignature}${cluster}`;
}

/**
 * Get explorer URL for address
 */
export function getExplorerAddressUrl(address: string, network: NetworkType = 'devnet'): string {
  const config = NETWORKS[network];
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `${config.explorerUrl}/address/${address}${cluster}`;
}

/**
 * Premium RPC providers for production use
 */
export const PREMIUM_RPC_PROVIDERS = {
  helius: 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY',
  quicknode: 'https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_API_KEY/',
  triton: 'https://YOUR_ENDPOINT.rpcpool.com/YOUR_API_KEY',
  alchemy: 'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
};

/**
 * Get recommended RPC URL based on network and use case
 */
export function getRecommendedRpc(
  network: NetworkType,
  useCase: 'development' | 'production' = 'development'
): string {
  if (useCase === 'production' && network === 'mainnet-beta') {
    console.warn('⚠️  For production mainnet, use a premium RPC provider!');
    console.warn('   Public RPC has rate limits. Consider: Helius, QuickNode, Triton, or Alchemy');
  }
  return getRpcUrl(network);
}

