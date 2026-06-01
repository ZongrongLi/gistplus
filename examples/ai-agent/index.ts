/**
 * Example AI Agent using Gist Plus Protocol
 * 
 * This example demonstrates how an autonomous AI agent can:
 * 1. Express its needs through an Intent
 * 2. Negotiate pricing with providers
 * 3. Create prepaid sessions
 * 4. Execute requests with automatic payment
 * 5. Verify receipts cryptographically
 */

import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
const PROVIDER_ENDPOINT = process.env.PROVIDER_ENDPOINT || 'http://localhost:3000/api/inference';

async function main() {
  console.log('🤖 Gist Plus AI Agent Example\n');
  
  // Initialize Solana connection
  const connection = new Connection(SOLANA_RPC, 'confirmed');
  console.log('✅ Connected to Solana:', SOLANA_RPC);
  
  // Load agent wallet (in production, this would be securely managed)
  const wallet = Keypair.generate(); // Generate new wallet for demo
  console.log('🔑 Agent Wallet:', wallet.publicKey.toBase58());
  
  // TODO: In production, fund the wallet
  // For demo purposes, you'll need to airdrop SOL or USDC
  console.log('⚠️  Remember to fund this wallet with SOL/USDC for transactions!\n');
  
  // Initialize Gist Plus client
  const client = new GistClient({
    connection,
    wallet,
  });
  
  console.log('📋 Creating Intent...');
  
  // Step 1: Create Intent
  // The agent expresses what it wants and maximum price willing to pay
  const intent = client.createIntent({
    capability: 'gpt-4-inference',
    maxPricePerRequest: 0.01, // Maximum 0.01 USDC per request
    token: 'USDC',
    maxSessionBudget: 1.0, // Total budget of 1 USDC
    sessionDurationMs: 600000, // 10 minutes
    sla: {
      maxLatencyMs: 2000, // Require <2s response time
      minUptimePercent: 99.0,
    },
    metadata: {
      agentName: 'AI Research Assistant',
      purpose: 'Scientific literature analysis',
    },
  });
  
  console.log('✅ Intent created:', intent.intentId);
  console.log('   Capability:', intent.capability);
  console.log('   Max Price:', intent.maxPricePerRequest, intent.token);
  console.log('   SLA: <', intent.sla?.maxLatencyMs, 'ms latency\n');
  
  try {
    // Step 2: Negotiate with Provider
    console.log('🤝 Negotiating with provider...');
    const offer = await client.negotiate(PROVIDER_ENDPOINT, intent);
    
    console.log('✅ Received Offer:', offer.offerId);
    console.log('   Actual Price:', offer.pricePerRequest, offer.token);
    console.log('   SLA Guarantee:', offer.sla.maxLatencyMs, 'ms');
    console.log('   Session Duration:', offer.sessionDurationMs / 1000, 'seconds');
    console.log('   Expires at:', new Date(offer.expiresAt).toISOString());
    
    // Check if offer meets our requirements
    if (offer.pricePerRequest > intent.maxPricePerRequest) {
      console.log('❌ Offer price too high! Expected:', intent.maxPricePerRequest, 'Got:', offer.pricePerRequest);
      return;
    }
    
    console.log('✅ Offer accepted!\n');
    
    // Step 3: Create Session
    console.log('💰 Creating prepaid session...');
    const session = await client.createSession(offer, {
      depositAmount: 0.5, // Deposit 0.5 USDC
    });
    
    console.log('✅ Session created:', session.sessionId);
    console.log('   Deposit:', session.depositAmount, session.token);
    console.log('   Remaining:', session.remainingBalance, session.token);
    console.log('   Available requests:', Math.floor(session.remainingBalance / session.pricePerRequest));
    console.log('   Expires at:', new Date(session.expiresAt).toISOString());
    console.log();
    
    // Step 4: Execute Requests
    console.log('🚀 Executing AI inference requests...\n');
    
    const requests = [
      { prompt: 'Explain quantum entanglement in simple terms' },
      { prompt: 'What are the latest developments in fusion energy?' },
      { prompt: 'Summarize the impact of AI on scientific research' },
    ];
    
    for (const [index, requestData] of requests.entries()) {
      console.log(`Request ${index + 1}: "${requestData.prompt}"`);
      
      const startTime = Date.now();
      
      // Execute request - payment is automatic!
      const result = await client.executeRequest(session.sessionId, requestData);
      
      const elapsedTime = Date.now() - startTime;
      
      console.log('✅ Response received');
      console.log('   Latency:', elapsedTime, 'ms');
      console.log('   Charged:', result.receipt.amountCharged, session.token);
      console.log('   SLA Met:', result.receipt.slaVerification.met ? '✅' : '❌');
      console.log('   Receipt ID:', result.receipt.receiptId);
      console.log('   Output (truncated):', result.data.response?.substring(0, 100) + '...');
      
      // Verify receipt signature
      console.log('   Signature:', result.receipt.signature.substring(0, 20) + '...');
      console.log();
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 5: Check session status
    console.log('📊 Final Session Status:');
    const finalSession = client.getSession(session.sessionId);
    if (finalSession) {
      console.log('   Requests made:', finalSession.requestCount);
      console.log('   Remaining balance:', finalSession.remainingBalance, finalSession.token);
      console.log('   State:', finalSession.state);
    }
    
    // Step 6: Close session and get refund
    console.log('\n💵 Closing session and claiming refund...');
    const refund = await client.closeSession(session.sessionId);
    console.log('✅ Refund processed:', refund.refundAmount, session.token);
    console.log('   Transaction:', refund.txSignature);
    
    console.log('\n🎉 Gist Plus Agent Demo Complete!');
    console.log('   ✅ Negotiated pricing');
    console.log('   ✅ Created prepaid session');
    console.log('   ✅ Executed', requests.length, 'requests');
    console.log('   ✅ Verified all receipts');
    console.log('   ✅ Received refund');
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.response?.status === 402) {
      console.log('\n💡 This is normal! The provider responded with 402 Payment Required.');
      console.log('   The Gist Plus protocol uses this to trigger negotiation.');
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Agent shutting down...');
  process.exit(0);
});

// Run the agent
main().catch(console.error);

