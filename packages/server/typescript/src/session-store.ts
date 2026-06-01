/**
 * SessionStore - In-memory session storage for providers
 */

import { Connection, Keypair } from '@solana/web3.js';
import {
  Session,
  Receipt,
  SessionState,
  deductFromSession,
  expireSession,
  isSessionActive,
} from '@gistplus/core';

/**
 * SessionStore manages active sessions for a provider
 * 
 * In production, this would be backed by Redis, PostgreSQL, or similar.
 * For MVP, we use an in-memory store.
 */
export class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private connection: Connection;
  private wallet: Keypair;
  
  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection;
    this.wallet = wallet;
    
    // Start background cleanup
    this.startCleanupTask();
  }
  
  /**
   * Save a new session
   */
  saveSession(session: Session): void {
    this.sessions.set(session.sessionId, session);
  }
  
  /**
   * Get a session by ID
   */
  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return undefined;
    }
    
    // Check if expired
    if (!isSessionActive(session) && session.state === SessionState.ACTIVE) {
      const expiredSession = expireSession(session);
      this.sessions.set(sessionId, expiredSession);
      return expiredSession;
    }
    
    return session;
  }
  
  /**
   * Update session after a request
   */
  updateSessionAfterRequest(sessionId: string, receipt: Receipt): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const updatedSession = deductFromSession(session, receipt.amountCharged);
    this.sessions.set(sessionId, updatedSession);
  }
  
  /**
   * Close a session
   */
  closeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
  
  /**
   * Get all active sessions
   */
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(isSessionActive);
  }
  
  /**
   * Clean up expired sessions
   */
  private cleanup(): void {
    const now = Date.now();
    const graceperiod = 3600000; // 1 hour
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt + graceperiod) {
        this.sessions.delete(sessionId);
      }
    }
  }
  
  /**
   * Start background cleanup task
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanup();
    }, 300000); // Every 5 minutes
  }
  
  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

