/**
 * Example API Provider using Gist Plus Protocol
 * 
 * This example demonstrates how an API provider can:
 * 1. Monetize their endpoints with Gist Plus
 * 2. Automatically negotiate with agents
 * 3. Manage sessions and payments
 * 4. Generate cryptographic receipts
 * 5. Enforce SLA guarantees
 */

import express, { Request, Response } from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware, GistProvider } from '@gistplus/server';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
const PROVIDER_ENDPOINT = process.env.PROVIDER_ENDPOINT || `http://localhost:${PORT}`;

async function main() {
  console.log('🏭 Gist Plus API Provider Example\n');
  
  // Initialize Solana connection
  const connection = new Connection(SOLANA_RPC, 'confirmed');
  console.log('✅ Connected to Solana:', SOLANA_RPC);
  
  // Load provider wallet
  const wallet = Keypair.generate(); // Generate new wallet for demo
  console.log('🔑 Provider Wallet:', wallet.publicKey.toBase58());
  console.log('⚠️  Fund this wallet to receive payments!\n');
  
  // Initialize Express app
  const app = express();
  app.use(express.json());
  
  // Health check endpoint (no payment required)
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      protocol: 'Gist Plus',
      version: '0.1.0',
      endpoint: PROVIDER_ENDPOINT,
    });
  });
  
  // Configure Gist Plus provider
  const providerConfig = {
    connection,
    wallet,
    endpoint: PROVIDER_ENDPOINT,
    pricing: {
      basePrice: 0.005, // 0.005 USDC per request
      token: 'USDC' as const,
    },
    sla: {
      maxLatencyMs: 2000,
      minUptimePercent: 99.5,
      maxErrorRatePercent: 0.5,
    },
    sessionDurationMs: 600000, // 10 minutes
  };
  
  console.log('⚙️  Provider Configuration:');
  console.log('   Base Price:', providerConfig.pricing.basePrice, providerConfig.pricing.token);
  console.log('   SLA: <', providerConfig.sla.maxLatencyMs, 'ms latency');
  console.log('   Session Duration:', providerConfig.sessionDurationMs / 1000, 'seconds\n');
  
  // Apply Gist Plus middleware to protected endpoints
  app.use('/api/*', gistMiddleware(providerConfig));
  
  // Protected API Endpoint: AI Inference
  app.post('/api/inference', async (req: Request, res: Response) => {
    const session = req.gistSession;
    
    if (!session) {
      // This shouldn't happen if middleware is working
      return res.status(500).json({ error: 'No session attached' });
    }
    
    console.log('🔄 Processing request for session:', session.sessionId);
    console.log('   Agent:', session.agentPubkey);
    console.log('   Request #:', session.requestCount + 1);
    console.log('   Remaining balance:', session.remainingBalance, session.token);
    
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    try {
      // Simulate AI inference
      console.log('   Prompt:', prompt.substring(0, 50) + '...');
      
      // Simulate processing time (random 500-1500ms)
      const processingTime = 500 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Generate response
      const response = generateMockResponse(prompt);
      
      // Return response with automatic Receipt generation
      // The middleware handles receipt creation and signature
      return res.gistReceipt?.({
        response,
        model: 'gpt-4-mock',
        tokens: response.length / 4, // Rough estimate
        processingTime: Math.round(processingTime),
      });
      
    } catch (error) {
      console.error('❌ Error processing request:', error);
      return res.status(500).json({ error: 'Processing failed' });
    }
  });
  
  // Protected API Endpoint: Image Generation
  app.post('/api/image', async (req: Request, res: Response) => {
    const session = req.gistSession;
    
    if (!session) {
      return res.status(500).json({ error: 'No session attached' });
    }
    
    console.log('🎨 Generating image for session:', session.sessionId);
    
    const { description } = req.body;
    
    // Simulate image generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return res.gistReceipt?.({
      imageUrl: 'https://example.com/generated-image.png',
      description,
      model: 'dall-e-3-mock',
    });
  });
  
  // Protected API Endpoint: Data Analysis
  app.post('/api/analyze', async (req: Request, res: Response) => {
    const session = req.gistSession;
    
    if (!session) {
      return res.status(500).json({ error: 'No session attached' });
    }
    
    console.log('📊 Analyzing data for session:', session.sessionId);
    
    const { data } = req.body;
    
    // Simulate data analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return res.gistReceipt?.({
      analysis: {
        mean: Math.random() * 100,
        median: Math.random() * 100,
        stdDev: Math.random() * 20,
        insights: ['Sample insight 1', 'Sample insight 2'],
      },
    });
  });
  
  // Session management endpoint
  app.post('/api/session/create', async (req: Request, res: Response) => {
    console.log('📋 Session creation request received');
    // This would be handled by a dedicated session creation handler
    res.status(201).json({ message: 'Session creation endpoint' });
  });
  
  // Start server
  app.listen(PORT, () => {
    console.log('🚀 Gist Plus Provider Server Running!');
    console.log('   URL:', PROVIDER_ENDPOINT);
    console.log('   Port:', PORT);
    console.log('\n💡 Endpoints:');
    console.log('   GET  /health           - Health check (free)');
    console.log('   POST /api/inference    - AI inference (Gist Plus protected)');
    console.log('   POST /api/image        - Image generation (Gist Plus protected)');
    console.log('   POST /api/analyze      - Data analysis (Gist Plus protected)');
    console.log('\n✨ Ready to serve AI agents with Gist Plus protocol!\n');
  });
}

/**
 * Generate a mock AI response
 */
function generateMockResponse(prompt: string): string {
  const responses: Record<string, string> = {
    'quantum': 'Quantum entanglement is a phenomenon where particles become correlated in such a way that the quantum state of each particle cannot be described independently. When particles are entangled, measuring one instantly affects the other, regardless of distance. This "spooky action at a distance" (as Einstein called it) is a fundamental feature of quantum mechanics.',
    
    'fusion': 'Recent developments in fusion energy include: 1) The National Ignition Facility achieved net energy gain in December 2022, producing more energy from fusion than the lasers input. 2) Private fusion companies are making progress with various approaches including tokamaks, stellarators, and laser fusion. 3) ITER construction continues in France, aiming for first plasma by 2025.',
    
    'ai': 'AI is revolutionizing scientific research by: 1) Accelerating drug discovery through protein folding predictions (AlphaFold). 2) Analyzing vast datasets in astronomy and physics. 3) Optimizing experimental designs. 4) Generating hypotheses from literature mining. 5) Automating routine lab tasks. The pace of scientific discovery is accelerating as AI tools become more sophisticated.',
    
    default: `This is a simulated AI response to: "${prompt}". In a production system, this would be generated by an actual language model. The Gist Plus protocol ensures that this inference is automatically paid for, with cryptographic proof of delivery and SLA enforcement.`,
  };
  
  // Find matching response
  const lowerPrompt = prompt.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerPrompt.includes(key)) {
      return response;
    }
  }
  
  return responses.default;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Provider shutting down...');
  process.exit(0);
});

// Run the provider
main().catch(console.error);

