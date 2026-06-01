/**
 * GistProvider - Main provider interface for Gist Plus server
 */

import { Connection, Keypair } from '@solana/web3.js';
import {
  Intent,
  Offer,
  Session,
  Receipt,
  SLA,
  SupportedToken,
  createOffer,
  createSession as coreCreateSession,
  createReceipt,
  validateIntent,
  doesOfferMatchIntent,
} from '@gistplus/core';
import { SessionStore } from './session-store';
import { PricingStrategy, StaticPricingStrategy } from './pricing';

export interface GistProviderConfig {
  /** Solana connection */
  connection: Connection;
  
  /** Provider's keypair for signing Offers and Receipts */
  wallet: Keypair;
  
  /** Provider's API endpoint base URL */
  endpoint: string;
  
  /** Pricing strategy */
  pricing: PricingStrategy | {
    basePrice: number;
    token: SupportedToken;
  };
  
  /** SLA guarantees */
  sla: SLA;
  
  /** Session duration in milliseconds */
  sessionDurationMs?: number;
  
  /** Offer expiration in milliseconds */
  offerExpirationMs?: number;
}

/**
 * GistProvider - Server-side provider implementation
 * 
 * Enables API providers to:
 * 1. Respond to Intents with Offers
 * 2. Create and manage Sessions
 * 3. Generate signed Receipts
 * 4. Verify payments on Solana
 */
export class GistProvider {
  private connection: Connection;
  private wallet: Keypair;
  private endpoint: string;
  private pricing: PricingStrategy;
  private sla: SLA;
  private sessionDurationMs: number;
  private offerExpirationMs: number;
  private sessionStore: SessionStore;
  
  constructor(config: GistProviderConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;
    this.endpoint = config.endpoint;
    this.sla = config.sla;
    this.sessionDurationMs = config.sessionDurationMs || 600000; // 10 minutes default
    this.offerExpirationMs = config.offerExpirationMs || 60000; // 1 minute default
    
    // Initialize pricing strategy
    if ('getPrice' in config.pricing) {
      this.pricing = config.pricing;
    } else {
      this.pricing = new StaticPricingStrategy(
        config.pricing.basePrice,
        config.pricing.token
      );
    }
    
    // Initialize session store
    this.sessionStore = new SessionStore(this.connection, this.wallet);
  }
  
  /**
   * Create an Offer in response to an Intent
   * 
   * @param intent - Agent's Intent
   * @returns Signed Offer
   */
  async createOfferForIntent(intent: Intent): Promise<Offer> {
    // Validate intent
    validateIntent(intent);
    
    // Get dynamic price based on intent
    const price = await this.pricing.getPrice(intent);
    
    // Create offer
    const offer = createOffer(
      {
        intent,
        providerPubkey: this.wallet.publicKey,
        pricePerRequest: price,
        sla: this.sla,
        sessionDurationMs: intent.sessionDurationMs || this.sessionDurationMs,
        endpoint: this.endpoint,
        expirationMs: this.offerExpirationMs,
      },
      this.wallet
    );
    
    return offer;
  }
  
  /**
   * Create a Session from an accepted Offer
   * 
   * @param offer - Accepted Offer
   * @param agentPubkey - Agent's public key
   * @param depositAmount - Amount deposited
   * @param txSignature - Solana transaction signature for payment
   * @returns Active Session
   */
  async createSessionFromOffer(
    offer: Offer,
    agentPubkey: string,
    depositAmount: number,
    txSignature: string
  ): Promise<Session> {
    // Verify payment on-chain
    await this.verifyPayment(txSignature, agentPubkey, depositAmount);
    
    // Create session
    const session = coreCreateSession({
      offer,
      agentPubkey,
      depositAmount,
      creationTxSignature: txSignature,
    });
    
    // Store session
    this.sessionStore.saveSession(session);
    
    return session;
  }
  
  /**
   * Get a session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessionStore.getSession(sessionId);
  }
  
  /**
   * Create a Receipt for a completed request
   * 
   * @param sessionId - Session ID
   * @param inputData - Request input data
   * @param outputData - Request output data
   * @param requestStartedAt - Request start timestamp
   * @returns Signed Receipt
   */
  async createReceiptForRequest(
    sessionId: string,
    inputData: any,
    outputData: any,
    requestStartedAt: number
  ): Promise<Receipt> {
    const session = this.sessionStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const requestCompletedAt = Date.now();
    
    // Create receipt
    const receipt = createReceipt(
      {
        session,
        requestNumber: session.requestCount + 1,
        inputData,
        outputData,
        requestStartedAt,
        requestCompletedAt,
        amountCharged: session.pricePerRequest,
      },
      this.wallet
    );
    
    // Update session
    this.sessionStore.updateSessionAfterRequest(sessionId, receipt);
    
    return receipt;
  }
  
  /**
   * Close a session and process refund
   */
  async closeSession(sessionId: string): Promise<{ refundAmount: number; txSignature?: string }> {
    const session = this.sessionStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const refundAmount = session.remainingBalance;
    
    if (refundAmount > 0) {
      // TODO: Process refund on-chain
      // const txSignature = await this.processRefund(session.agentPubkey, refundAmount);
      // return { refundAmount, txSignature };
    }
    
    // Mark session as closed
    this.sessionStore.closeSession(sessionId);
    
    return { refundAmount };
  }
  
  /**
   * Verify payment on Solana blockchain
   */
  private async verifyPayment(
    txSignature: string,
    expectedPayer: string,
    expectedAmount: number
  ): Promise<void> {
    try {
      const transaction = await this.connection.getTransaction(txSignature, {
        commitment: 'confirmed',
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // TODO: Verify transaction details match expected values
      // This would check:
      // 1. Payer matches expectedPayer
      // 2. Recipient is this provider
      // 3. Amount matches expectedAmount
      // 4. Transaction is successful
      
    } catch (error) {
      throw new Error(`Payment verification failed: ${error}`);
    }
  }
  
  /**
   * Get provider's public key
   */
  get publicKey() {
    return this.wallet.publicKey;
  }
}

