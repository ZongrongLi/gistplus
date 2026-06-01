/**
 * HTTP Client for Gist Plus protocol communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Intent,
  Offer,
  Session,
  Receipt,
  HEADERS,
  HTTP_STATUS,
  verifyReceipt,
} from '@gistplus/core';

export interface HttpClientConfig {
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * HttpClient handles HTTP communication with Gist Plus providers
 */
export class HttpClient {
  private axios: AxiosInstance;
  
  constructor(config?: HttpClientConfig) {
    this.axios = axios.create({
      timeout: config?.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }
  
  /**
   * Send Intent to provider and receive Offer
   * 
   * Makes a request to provider endpoint, receives 402 Quote Required,
   * sends Intent, and receives signed Offer.
   */
  async sendIntent(
    endpoint: string,
    intent: Intent,
    options?: { headers?: Record<string, string>; timeout?: number }
  ): Promise<Offer> {
    try {
      // Send Intent to provider
      const response = await this.axios.post(
        endpoint,
        {},
        {
          headers: {
            [HEADERS.INTENT]: JSON.stringify(intent),
            ...options?.headers,
          },
          timeout: options?.timeout,
        }
      );
      
      // Provider should respond with Offer in header
      const offerHeader = response.headers[HEADERS.OFFER.toLowerCase()];
      if (!offerHeader) {
        throw new Error('Provider did not return an Offer');
      }
      
      const offer: Offer = JSON.parse(offerHeader);
      return offer;
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HTTP_STATUS.QUOTE_REQUIRED) {
        // Expected 402 response with Offer
        const offerHeader = error.response.headers[HEADERS.OFFER.toLowerCase()];
        if (offerHeader) {
          const offer: Offer = JSON.parse(offerHeader);
          return offer;
        }
      }
      
      throw new Error(`Failed to negotiate with provider: ${error}`);
    }
  }
  
  /**
   * Create a Session with provider
   */
  async createSession(
    offer: Offer,
    depositAmount: number,
    txSignature: string
  ): Promise<Session> {
    try {
      const response = await this.axios.post(
        `${offer.endpoint}/session/create`,
        {
          offerId: offer.offerId,
          depositAmount,
          txSignature,
        }
      );
      
      if (response.status !== HTTP_STATUS.SESSION_STARTED && response.status !== 201) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      
      const session: Session = response.data;
      return session;
      
    } catch (error) {
      throw new Error(`Failed to create session: ${error}`);
    }
  }
  
  /**
   * Execute a request within a Session
   */
  async executeRequest(
    session: Session,
    requestData: any
  ): Promise<{ data: any; receipt: Receipt }> {
    try {
      // Get provider endpoint from session metadata or construct it
      const endpoint = this.getSessionEndpoint(session);
      
      const response = await this.axios.post(
        endpoint,
        requestData,
        {
          headers: {
            [HEADERS.SESSION_ID]: session.sessionId,
          },
        }
      );
      
      // Extract receipt from header
      const receiptHeader = response.headers[HEADERS.RECEIPT.toLowerCase()];
      if (!receiptHeader) {
        throw new Error('Provider did not return a Receipt');
      }
      
      const receipt: Receipt = JSON.parse(receiptHeader);
      
      // Verify receipt signature
      verifyReceipt(receipt);
      
      return {
        data: response.data,
        receipt,
      };
      
    } catch (error) {
      throw new Error(`Failed to execute request: ${error}`);
    }
  }
  
  /**
   * Close a session and request refund
   */
  async closeSession(
    session: Session
  ): Promise<{ refundAmount: number; txSignature: string }> {
    try {
      const endpoint = this.getSessionEndpoint(session);
      
      const response = await this.axios.post(
        `${endpoint}/close`,
        {
          sessionId: session.sessionId,
        },
        {
          headers: {
            [HEADERS.SESSION_ID]: session.sessionId,
          },
        }
      );
      
      return response.data;
      
    } catch (error) {
      throw new Error(`Failed to close session: ${error}`);
    }
  }
  
  /**
   * Get provider endpoint for session
   */
  private getSessionEndpoint(session: Session): string {
    // In a real implementation, this might be stored in session metadata
    // For now, construct from provider's base endpoint
    return session.metadata?.endpoint || `https://provider/${session.providerPubkey}`;
  }
}

