/**
 * Express middleware for Gist Plus protocol
 */

import { Request, Response, NextFunction } from 'express';
import {
  Intent,
  Offer,
  Session,
  Receipt,
  HEADERS,
  HTTP_STATUS,
  validateIntent,
} from '@gistplus/core';
import { GistProvider, GistProviderConfig } from './provider';

// Extend Express Request and Response types
declare global {
  namespace Express {
    interface Request {
      gistSession?: Session;
      gistIntent?: Intent;
      gistRequestStartTime?: number;
    }
    interface Response {
      gistReceipt?: (data: any) => Response;
    }
  }
}

/**
 * Create Gist Plus middleware for Express
 * 
 * This middleware handles:
 * 1. Detecting requests without sessions (402 responses with Offers)
 * 2. Validating session headers
 * 3. Attaching session info to request
 * 4. Generating and attaching Receipts to responses
 * 
 * @param config - Provider configuration
 * @returns Express middleware
 */
export function gistMiddleware(config: GistProviderConfig) {
  const provider = new GistProvider(config);
  
  return async (req: Request, res: Response, next: NextFunction) => {
    req.gistRequestStartTime = Date.now();
    
    try {
      // Check for session header
      const sessionId = req.headers[HEADERS.SESSION_ID.toLowerCase()] as string;
      
      if (sessionId) {
        // Request has session - validate and attach
        await handleSessionRequest(req, res, next, provider, sessionId);
      } else {
        // No session - check for Intent and respond with Offer
        await handleIntentRequest(req, res, next, provider);
      }
      
    } catch (error) {
      console.error('Gist Plus middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Handle request with Intent (no session yet)
 */
async function handleIntentRequest(
  req: Request,
  res: Response,
  next: NextFunction,
  provider: GistProvider
) {
  // Check for Intent header
  const intentHeader = req.headers[HEADERS.INTENT.toLowerCase()] as string;
  
  if (!intentHeader) {
    // No Intent, no Session -> 402 Quote Required
    res.status(HTTP_STATUS.QUOTE_REQUIRED).json({
      error: 'Payment Required',
      message: 'This endpoint requires Gist Plus payment. Send an Intent to negotiate.',
      protocol: 'Gist Plus',
    });
    return;
  }
  
  try {
    // Parse and validate Intent
    const intent: Intent = JSON.parse(intentHeader);
    validateIntent(intent);
    
    // Create Offer
    const offer = await provider.createOfferForIntent(intent);
    
    // Respond with 402 and Offer in header
    res.setHeader(HEADERS.OFFER, JSON.stringify(offer));
    res.status(HTTP_STATUS.QUOTE_REQUIRED).json({
      message: 'Offer provided',
      offerId: offer.offerId,
      pricePerRequest: offer.pricePerRequest,
      token: offer.token,
    });
    
  } catch (error) {
    res.status(HTTP_STATUS.INVALID_OFFER).json({
      error: 'Invalid Intent',
      message: String(error),
    });
  }
}

/**
 * Handle request with existing Session
 */
async function handleSessionRequest(
  req: Request,
  res: Response,
  next: NextFunction,
  provider: GistProvider,
  sessionId: string
) {
  try {
    // Get session
    const session = provider.getSession(sessionId);
    
    if (!session) {
      res.status(HTTP_STATUS.SESSION_EXPIRED).json({
        error: 'Session not found',
        message: `Session ${sessionId} does not exist or has expired`,
      });
      return;
    }
    
    // Validate session is active
    // (This would check expiration, balance, etc.)
    
    // Attach session to request
    req.gistSession = session;
    
    // Create Receipt helper function
    res.gistReceipt = (data: any) => {
      // This will be called by the route handler
      provider
        .createReceiptForRequest(
          sessionId,
          req.body,
          data,
          req.gistRequestStartTime!
        )
        .then((receipt) => {
          // Attach receipt to response header
          res.setHeader(HEADERS.RECEIPT, JSON.stringify(receipt));
          res.setHeader(
            HEADERS.SLA_STATUS,
            receipt.slaVerification.met ? 'met' : 'breached'
          );
          res.json(data);
        })
        .catch((error) => {
          res.status(500).json({
            error: 'Failed to generate receipt',
            message: String(error),
          });
        });

      return res;
    };
    
    // Continue to route handler
    next();
    
  } catch (error) {
    res.status(500).json({
      error: 'Session error',
      message: String(error),
    });
  }
}

/**
 * Middleware specifically for session creation endpoint
 */
export function sessionCreationHandler(provider: GistProvider) {
  return async (req: Request, res: Response) => {
    try {
      const { offerId, depositAmount, txSignature } = req.body;
      
      if (!offerId || !depositAmount || !txSignature) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['offerId', 'depositAmount', 'txSignature'],
        });
        return;
      }
      
      // For MVP, we'll need to reconstruct or store the offer
      // In production, you'd store offers temporarily
      
      // Create session (this includes payment verification)
      const agentPubkey = req.body.agentPubkey; // Should be derived from tx
      
      // This is a simplified version - in production you'd:
      // 1. Retrieve the stored offer by offerId
      // 2. Verify the offer hasn't expired
      // 3. Create the session
      
      res.status(HTTP_STATUS.SESSION_STARTED).json({
        message: 'Session creation endpoint - implement offer storage',
      });
      
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create session',
        message: String(error),
      });
    }
  };
}

