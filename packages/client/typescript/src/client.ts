/**
 * GistClient - Main client interface for Gist Plus protocol
 */

import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Intent,
  Offer,
  Session,
  Receipt,
  SLA,
  SupportedToken,
  createIntent as coreCreateIntent,
  verifyOffer,
  TOKEN_MINTS,
} from '@gistplus/core';
import { HttpClient } from './http-client';
import { SessionManager } from './session-manager';

export interface GistClientConfig {
  /** Solana connection */
  connection: Connection;
  
  /** Agent's keypair for signing transactions */
  wallet: Keypair;
  
  /** Optional HTTP client config */
  httpConfig?: {
    timeout?: number;
    headers?: Record<string, string>;
  };
}

export interface CreateIntentOptions {
  capability: string;
  maxPricePerRequest: number;
  token: SupportedToken;
  maxSessionBudget?: number;
  sessionDurationMs?: number;
  sla?: SLA;
  metadata?: Record<string, any>;
}

export interface NegotiateOptions {
  /** Custom headers for the request */
  headers?: Record<string, string>;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface CreateSessionOptions {
  /** Custom deposit amount (defaults to maxSessionBudget from Intent) */
  depositAmount?: number;
  
  /** Whether to anchor session on-chain (costs extra transaction fee) */
  anchorOnChain?: boolean;
}

/**
 * GistClient - Primary interface for Gist Plus protocol
 * 
 * Enables AI agents to:
 * 1. Create Intents expressing their needs
 * 2. Negotiate Offers with providers
 * 3. Create prepaid Sessions
 * 4. Execute requests and verify Receipts
 */
export class GistClient {
  private connection: Connection;
  private wallet: Keypair;
  private httpClient: HttpClient;
  private sessionManager: SessionManager;
  
  constructor(config: GistClientConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;
    this.httpClient = new HttpClient(config.httpConfig);
    this.sessionManager = new SessionManager(this.connection, this.wallet);
  }
  
  /**
   * Create a new Intent
   */
  createIntent(options: CreateIntentOptions): Intent {
    return coreCreateIntent({
      ...options,
      agentPubkey: this.wallet.publicKey,
    });
  }
  
  /**
   * Negotiate an Offer with a provider
   * 
   * Sends Intent to provider's endpoint and receives a signed Offer.
   * 
   * @param providerEndpoint - Provider's endpoint URL
   * @param intent - Intent object
   * @param options - Negotiation options
   * @returns Signed Offer from provider
   */
  async negotiate(
    providerEndpoint: string,
    intent: Intent,
    options?: NegotiateOptions
  ): Promise<Offer> {
    // Send Intent to provider
    const offer = await this.httpClient.sendIntent(
      providerEndpoint,
      intent,
      options
    );
    
    // Verify Offer signature and validity
    verifyOffer(offer);
    
    return offer;
  }
  
  /**
   * Create a Session from an accepted Offer
   * 
   * Transfers funds to the provider and creates a prepaid session.
   * 
   * @param offer - Accepted Offer
   * @param options - Session creation options
   * @returns Active Session
   */
  async createSession(
    offer: Offer,
    options?: CreateSessionOptions
  ): Promise<Session> {
    // Calculate deposit amount
    const depositAmount = options?.depositAmount || this.calculateDefaultDeposit(offer);
    
    // Transfer funds to provider
    const txSignature = await this.transferFunds(
      offer.providerPubkey,
      offer.token,
      depositAmount
    );
    
    // Create session with provider
    const session = await this.httpClient.createSession(
      offer,
      depositAmount,
      txSignature
    );
    
    // Register session with manager
    this.sessionManager.registerSession(session);
    
    return session;
  }
  
  /**
   * Get an active session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessionManager.getSession(sessionId);
  }
  
  /**
   * Execute a request within a Session
   * 
   * @param sessionId - Session ID
   * @param requestData - Request payload
   * @returns Response data and Receipt
   */
  async executeRequest(
    sessionId: string,
    requestData: any
  ): Promise<{ data: any; receipt: Receipt }> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Execute request via HTTP client
    const result = await this.httpClient.executeRequest(session, requestData);
    
    // Update session state
    this.sessionManager.updateSessionAfterRequest(sessionId, result.receipt);
    
    return result;
  }
  
  /**
   * Close a session and claim refund for remaining balance
   */
  async closeSession(sessionId: string): Promise<{ refundAmount: number; txSignature: string }> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Request refund from provider
    const refundResponse = await this.httpClient.closeSession(session);
    
    // Mark session as closed
    this.sessionManager.closeSession(sessionId);
    
    return refundResponse;
  }
  
  /**
   * Get all active sessions
   */
  getActiveSessions(): Session[] {
    return this.sessionManager.getActiveSessions();
  }
  
  /**
   * Transfer funds to provider (SOL or SPL token)
   */
  private async transferFunds(
    providerPubkey: string,
    token: SupportedToken,
    amount: number
  ): Promise<string> {
    const provider = new PublicKey(providerPubkey);
    
    if (token === 'SOL') {
      // Transfer SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: provider,
          lamports: amount * 1e9, // Convert SOL to lamports
        })
      );
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet]
      );
      
      return signature;
    } else {
      // Transfer SPL token
      const mintAddress = new PublicKey(TOKEN_MINTS[token]);
      
      // Get or create associated token accounts
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.wallet,
        mintAddress,
        this.wallet.publicKey
      );
      
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.wallet,
        mintAddress,
        provider
      );
      
      // Create transfer instruction
      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount.address,
          toTokenAccount.address,
          this.wallet.publicKey,
          amount * 1e6, // Assuming 6 decimals for USDC/USDT
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.wallet]
      );
      
      return signature;
    }
  }
  
  /**
   * Calculate default deposit amount from Offer
   */
  private calculateDefaultDeposit(offer: Offer): number {
    // Default: enough for 10 requests or session duration worth
    const minRequests = 10;
    return offer.pricePerRequest * minRequests;
  }
  
  /**
   * Get wallet public key
   */
  get publicKey(): PublicKey {
    return this.wallet.publicKey;
  }
}

