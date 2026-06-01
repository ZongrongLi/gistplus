/**
 * Production-Ready Gist Plus Agent for Devnet
 * 
 * This example shows how to build a production-ready AI agent
 * that works on Solana Devnet (or any network).
 */

import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';
import { getNetworkConfig, getExplorerUrl } from '@gistplus/core';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration from environment
const NETWORK = (process.env.SOLANA_NETWORK || 'devnet') as any;
const RPC_URL = process.env.SOLANA_RPC;
const PROVIDER_ENDPOINT = process.env.PROVIDER_ENDPOINT || 'http://localhost:3000';

console.log('🤖 Production-Ready Gist Plus Agent');
console.log('='.repeat(50));
console.log(`Network: ${NETWORK}`);
console.log(`RPC: ${RPC_URL || 'default'}`);
console.log(`Provider: ${PROVIDER_ENDPOINT}`);
console.log('='.repeat(50));
console.log('');

async function main() {
  try {
    // 1. Initialize Connection
    const networkConfig = getNetworkConfig(NETWORK);
    const connection = new Connection(
      RPC_URL || networkConfig.rpcUrl,
      'confirmed'
    );
    
    console.log('✅ Connected to Solana');
    
    // 2. Load Wallet
    const wallet = await loadWallet();
    console.log(`✅ Wallet loaded: ${wallet.publicKey.toBase58()}`);
    
    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`   Balance: ${(balance / 1e9).toFixed(4)} SOL`);
    
    if (balance < 0.1 * 1e9) {
      console.log('');
      console.log('⚠️  Low balance! Get SOL from:');
      console.log(`   solana airdrop 1 ${wallet.publicKey.toBase58()} --url ${NETWORK}`);
      console.log('');
      if (NETWORK !== 'mainnet-beta') {
        // Auto-airdrop on devnet/testnet
        console.log('   Requesting airdrop...');
        try {
          const signature = await connection.requestAirdrop(
            wallet.publicKey,
            1e9 // 1 SOL
          );
          await connection.confirmTransaction(signature);
          console.log('   ✅ Airdrop successful!');
        } catch (error) {
          console.log('   ❌ Airdrop failed. Request manually.');
        }
      }
    }
    
    console.log('');
    
    // 3. Initialize Gist Plus Client
    const client = new GistClient({
      connection,
      wallet,
    });
    
    console.log('✅ Gist Plus Client initialized');
    console.log('');
    
    // 4. Create Intent
    console.log('📋 Creating Intent...');
    const intent = client.createIntent({
      capability: 'weather-api',
      maxPricePerRequest: 0.01,
      token: 'USDC',
      sla: {
        maxLatencyMs: 2000,
      },
      metadata: {
        network: NETWORK,
      },
    });
    
    console.log(`   ✅ Intent ID: ${intent.intentId}`);
    console.log(`   Capability: ${intent.capability}`);
    console.log(`   Max Price: ${intent.maxPricePerRequest} ${intent.token}`);
    console.log('');
    
    // 5. Negotiate with Provider
    console.log('🤝 Negotiating with provider...');
    console.log(`   Provider: ${PROVIDER_ENDPOINT}`);
    
    const offer = await client.negotiate(PROVIDER_ENDPOINT, intent);
    
    console.log(`   ✅ Offer received: ${offer.offerId}`);
    console.log(`   Price: ${offer.pricePerRequest} ${offer.token}`);
    console.log(`   SLA: <${offer.sla.maxLatencyMs}ms`);
    console.log('');
    
    // 6. Create Session
    console.log('💰 Creating session...');
    console.log(`   Depositing: 0.01 ${offer.token}`);
    
    const session = await client.createSession(offer, {
      depositAmount: 0.01,
    });
    
    console.log(`   ✅ Session created: ${session.sessionId}`);
    console.log(`   Balance: ${session.remainingBalance} ${session.token}`);
    console.log(`   Max requests: ${Math.floor(session.remainingBalance / session.pricePerRequest)}`);
    
    if (session.creationTxSignature) {
      const explorerUrl = getExplorerUrl(session.creationTxSignature, NETWORK);
      console.log(`   Transaction: ${explorerUrl}`);
    }
    
    console.log('');
    
    // 7. Execute Requests
    console.log('🚀 Executing requests...');
    console.log('');
    
    const cities = ['New York', 'London', 'Tokyo'];
    
    for (const city of cities) {
      console.log(`🌤️  Requesting weather for: ${city}`);
      
      try {
        const result = await client.executeRequest(session.sessionId, {
          city,
        });
        
        console.log(`   ✅ Response received`);
        console.log(`   Temperature: ${result.data.weather?.temp}°F`);
        console.log(`   Condition: ${result.data.weather?.condition}`);
        console.log(`   Latency: ${result.receipt.latencyMs}ms`);
        console.log(`   Charged: ${result.receipt.amountCharged} ${session.token}`);
        console.log(`   SLA: ${result.receipt.slaVerification.met ? '✅ MET' : '❌ BREACHED'}`);
        console.log('');
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log('');
      }
    }
    
    // 8. Close Session
    console.log('💵 Closing session...');
    
    const refund = await client.closeSession(session.sessionId);
    
    console.log(`   ✅ Session closed`);
    console.log(`   Refund: ${refund.refundAmount} ${session.token}`);
    
    if (refund.txSignature) {
      const explorerUrl = getExplorerUrl(refund.txSignature, NETWORK);
      console.log(`   Transaction: ${explorerUrl}`);
    }
    
    console.log('');
    console.log('🎉 Complete!');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('   Response:', error.response.status, error.response.data);
    }
    
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure the provider is running');
    console.error('2. Check your wallet has sufficient balance');
    console.error('3. Verify SOLANA_NETWORK is set correctly');
    console.error('4. Check PROVIDER_ENDPOINT is accessible');
    
    process.exit(1);
  }
}

/**
 * Load wallet from environment or generate new one
 */
async function loadWallet(): Promise<Keypair> {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  
  if (privateKey) {
    try {
      const secretKey = Buffer.from(privateKey, 'base64');
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      console.error('❌ Invalid WALLET_PRIVATE_KEY format');
      throw error;
    }
  }
  
  // Generate new wallet for testing
  console.warn('⚠️  No WALLET_PRIVATE_KEY found, generating new wallet...');
  const wallet = Keypair.generate();
  
  console.log('');
  console.log('Generated new wallet:');
  console.log(`Public Key: ${wallet.publicKey.toBase58()}`);
  console.log(`Private Key (base64): ${Buffer.from(wallet.secretKey).toString('base64')}`);
  console.log('');
  console.log('💡 Save this to .env:');
  console.log(`WALLET_PRIVATE_KEY=${Buffer.from(wallet.secretKey).toString('base64')}`);
  console.log('');
  
  return wallet;
}

// Run the agent
main();

