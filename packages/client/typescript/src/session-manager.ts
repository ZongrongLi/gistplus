/**
 * SessionManager - Manages active sessions and their state
 */

import { Connection, Keypair } from '@solana/web3.js';
import {
  Session,
  Receipt,
  SessionState,
  isSessionActive,
  deductFromSession,
  expireSession,
} from '@gistplus/core';

/**
 * SessionManager tracks and manages active Gist Plus sessions
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private connection: Connection;
  private wallet: Keypair;
  
  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection;
    this.wallet = wallet;
    
    // Start background cleanup task
    this.startCleanupTask();
  }
  
  /**
   * Register a new session
   */
  registerSession(session: Session): void {
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
    
    // Check if session has expired and update state
    if (!isSessionActive(session) && session.state === SessionState.ACTIVE) {
      const expiredSession = expireSession(session);
      this.sessions.set(sessionId, expiredSession);
      return expiredSession;
    }
    
    return session;
  }
  
  /**
   * Update session after a request is completed
   */
  updateSessionAfterRequest(sessionId: string, receipt: Receipt): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Deduct amount from session
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
    const activeSessions: Session[] = [];
    
    for (const session of this.sessions.values()) {
      if (isSessionActive(session)) {
        activeSessions.push(session);
      }
    }
    
    return activeSessions;
  }
  
  /**
   * Get all sessions
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }
  
  /**
   * Clean up expired sessions
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.state === SessionState.EXPIRED || now > session.expiresAt) {
        // Keep expired sessions for a grace period (1 hour)
        if (now > session.expiresAt + 3600000) {
          this.sessions.delete(sessionId);
        }
      }
    }
  }
  
  /**
   * Start background cleanup task
   */
  private startCleanupTask(): void {
    // Clean up every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 300000);
  }
  
  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

