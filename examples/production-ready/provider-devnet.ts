/**
 * Production-Ready Gist Plus Provider for Devnet
 * 
 * This example shows how to build a production-ready API provider
 * that works on Solana Devnet (or any network).
 */

import express, { Request, Response } from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';
import { getNetworkConfig } from '@gistplus/core';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration from environment
const PORT = parseInt(process.env.PORT || '3000');
const NETWORK = (process.env.SOLANA_NETWORK || 'devnet') as any;
const RPC_URL = process.env.SOLANA_RPC;
const PROVIDER_ENDPOINT = process.env.PROVIDER_ENDPOINT || `http://localhost:${PORT}`;

console.log('🏭 Production-Ready Gist Plus Provider');
console.log('='.repeat(50));
console.log(`Network: ${NETWORK}`);
console.log(`RPC: ${RPC_URL || 'default'}`);
console.log(`Endpoint: ${PROVIDER_ENDPOINT}`);
console.log(`Port: ${PORT}`);
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
    
    if (balance < 0.1 * 1e9 && NETWORK !== 'mainnet-beta') {
      console.log('');
      console.log('⚠️  Low balance! Requesting airdrop...');
      try {
        const signature = await connection.requestAirdrop(
          wallet.publicKey,
          1e9
        );
        await connection.confirmTransaction(signature);
        console.log('   ✅ Airdrop successful!');
      } catch (error) {
        console.log('   ❌ Airdrop failed. Request manually:');
        console.log(`   solana airdrop 1 ${wallet.publicKey.toBase58()} --url ${NETWORK}`);
      }
    }
    
    console.log('');
    
    // 3. Initialize Express
    const app = express();
    app.use(express.json());
    
    // CORS for development
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    
    // 4. Health Check Endpoint
    app.get('/health', async (req: Request, res: Response) => {
      try {
        const health = {
          status: 'healthy',
          network: NETWORK,
          endpoint: PROVIDER_ENDPOINT,
          provider: wallet.publicKey.toBase58(),
          balance: (await connection.getBalance(wallet.publicKey)) / 1e9,
          uptime: process.uptime(),
        };
        
        res.json(health);
      } catch (error: any) {
        res.status(500).json({
          status: 'error',
          error: error.message,
        });
      }
    });
    
    // 5. Gist Plus Middleware Configuration
    const gistConfig = {
      connection,
      wallet,
      endpoint: PROVIDER_ENDPOINT,
      pricing: {
        basePrice: parseFloat(process.env.BASE_PRICE || '0.001'),
        token: (process.env.TOKEN || 'USDC') as any,
      },
      sla: {
        maxLatencyMs: parseInt(process.env.MAX_LATENCY || '2000'),
        minUptimePercent: parseFloat(process.env.MIN_UPTIME || '99.5'),
      },
      sessionDurationMs: parseInt(process.env.SESSION_DURATION || '600000'),
    };
    
    console.log('⚙️  Provider Configuration:');
    console.log(`   Base Price: ${gistConfig.pricing.basePrice} ${gistConfig.pricing.token}`);
    console.log(`   SLA: <${gistConfig.sla.maxLatencyMs}ms latency`);
    console.log(`   Session Duration: ${gistConfig.sessionDurationMs / 1000}s`);
    console.log('');
    
    // 6. Apply Gist Plus Middleware
    app.use('/api/*', gistMiddleware(gistConfig));
    
    // 7. Protected API Endpoints
    
    // Weather API
    app.post('/api/weather', async (req: Request, res: Response) => {
      try {
        const { city } = req.body;
        
        // Simulate API call
        const weather = await getWeatherData(city);
        
        // Automatic receipt generation
        return res.gistReceipt?.({
          city,
          weather,
          timestamp: new Date().toISOString(),
        });
        
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // AI Inference API
    app.post('/api/inference', async (req: Request, res: Response) => {
      try {
        const { prompt } = req.body;
        
        // Simulate AI inference
        const response = await runInference(prompt);
        
        return res.gistReceipt?.({
          prompt,
          response,
          model: 'mock-gpt-4',
          tokens: response.length,
        });
        
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Data API
    app.post('/api/data', async (req: Request, res: Response) => {
      try {
        const { query } = req.body;
        
        // Simulate data query
        const data = await queryData(query);
        
        return res.gistReceipt?.({
          query,
          data,
          count: data.length,
        });
        
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // 8. Start Server
    app.listen(PORT, () => {
      console.log('✅ Server started');
      console.log(`🌐 Listening on ${PROVIDER_ENDPOINT}`);
      console.log('');
      console.log('💡 Endpoints:');
      console.log('   GET  /health           - Health check');
      console.log('   POST /api/weather      - Weather API (Gist Plus protected)');
      console.log('   POST /api/inference    - AI inference (Gist Plus protected)');
      console.log('   POST /api/data         - Data API (Gist Plus protected)');
      console.log('');
      console.log('✨ Ready to serve requests!');
      console.log('');
      console.log('💡 Test with:');
      console.log(`   curl ${PROVIDER_ENDPOINT}/health`);
      console.log(`   node examples/production-ready/agent-devnet.ts`);
      console.log('');
    });
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Failed to start provider:', error.message);
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

/**
 * Mock weather data service
 */
async function getWeatherData(city: string = 'New York') {
  const weatherData: any = {
    'New York': { temp: 72, condition: 'Sunny', humidity: 65 },
    'London': { temp: 58, condition: 'Cloudy', humidity: 80 },
    'Tokyo': { temp: 68, condition: 'Rainy', humidity: 75 },
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
  
  return weatherData[city] || weatherData['New York'];
}

/**
 * Mock AI inference service
 */
async function runInference(prompt: string) {
  // Simulate inference delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  return `This is a simulated response to: "${prompt}". In production, this would be generated by a real AI model.`;
}

/**
 * Mock data query service
 */
async function queryData(query: string) {
  // Simulate query delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  
  return [
    { id: 1, value: Math.random() * 100 },
    { id: 2, value: Math.random() * 100 },
    { id: 3, value: Math.random() * 100 },
  ];
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the provider
main();

