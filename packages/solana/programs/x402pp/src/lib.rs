/**
 * Gist Plus Solana Program
 * 
 * On-chain storage and verification for:
 * - Sessions (prepaid channels)
 * - Receipts (proof of work)
 * - Escrow (payment holding)
 * - Refunds (dispute resolution)
 */

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("X4o2PPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod x402pp {
    use super::*;

    /**
     * Initialize a Session on-chain
     * 
     * Creates a PDA to store session state and escrow funds.
     */
    pub fn initialize_session(
        ctx: Context<InitializeSession>,
        session_id: String,
        offer_id: String,
        deposit_amount: u64,
        price_per_request: u64,
        expires_at: i64,
    ) -> Result<()> {
        let session = &mut ctx.accounts.session;
        let clock = Clock::get()?;

        session.session_id = session_id;
        session.offer_id = offer_id;
        session.agent = ctx.accounts.agent.key();
        session.provider = ctx.accounts.provider.key();
        session.deposit_amount = deposit_amount;
        session.remaining_balance = deposit_amount;
        session.price_per_request = price_per_request;
        session.started_at = clock.unix_timestamp;
        session.expires_at = expires_at;
        session.request_count = 0;
        session.state = SessionState::Active;
        session.bump = ctx.bumps.session;

        msg!("Session initialized: {}", session.session_id);
        Ok(())
    }

    /**
     * Anchor a Receipt on-chain
     * 
     * Stores a cryptographically signed receipt as proof of work.
     */
    pub fn anchor_receipt(
        ctx: Context<AnchorReceipt>,
        receipt_id: String,
        session_id: String,
        request_number: u32,
        input_hash: String,
        output_hash: String,
        latency_ms: u64,
        amount_charged: u64,
        sla_met: bool,
    ) -> Result<()> {
        let receipt = &mut ctx.accounts.receipt;
        let session = &mut ctx.accounts.session;
        let clock = Clock::get()?;

        // Verify session is active
        require!(
            session.state == SessionState::Active,
            X402Error::SessionNotActive
        );

        // Verify session hasn't expired
        require!(
            clock.unix_timestamp <= session.expires_at,
            X402Error::SessionExpired
        );

        // Verify sufficient balance
        require!(
            session.remaining_balance >= amount_charged,
            X402Error::InsufficientBalance
        );

        // Update session
        session.remaining_balance = session
            .remaining_balance
            .checked_sub(amount_charged)
            .ok_or(X402Error::MathOverflow)?;
        session.request_count = session
            .request_count
            .checked_add(1)
            .ok_or(X402Error::MathOverflow)?;

        // If balance depleted, mark session as depleted
        if session.remaining_balance < session.price_per_request {
            session.state = SessionState::Depleted;
        }

        // Create receipt
        receipt.receipt_id = receipt_id;
        receipt.session_id = session_id;
        receipt.request_number = request_number;
        receipt.input_hash = input_hash;
        receipt.output_hash = output_hash;
        receipt.latency_ms = latency_ms;
        receipt.amount_charged = amount_charged;
        receipt.sla_met = sla_met;
        receipt.timestamp = clock.unix_timestamp;
        receipt.provider = ctx.accounts.provider.key();
        receipt.bump = ctx.bumps.receipt;

        msg!("Receipt anchored: {} for session: {}", receipt.receipt_id, receipt.session_id);
        Ok(())
    }

    /**
     * Close a Session and process refund
     * 
     * Returns remaining balance to agent.
     */
    pub fn close_session(ctx: Context<CloseSession>) -> Result<()> {
        let session = &ctx.accounts.session;
        let clock = Clock::get()?;

        // Verify caller is agent or provider
        let caller = ctx.accounts.authority.key();
        require!(
            caller == session.agent || caller == session.provider,
            X402Error::Unauthorized
        );

        // Calculate refund amount
        let refund_amount = session.remaining_balance;

        if refund_amount > 0 {
            // Transfer refund to agent
            let seeds = &[
                b"session",
                session.session_id.as_bytes(),
                &[session.bump],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.session_vault.to_account_info(),
                to: ctx.accounts.agent_token_account.to_account_info(),
                authority: ctx.accounts.session.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

            token::transfer(cpi_ctx, refund_amount)?;
        }

        // Mark session as refunded
        let session_mut = &mut ctx.accounts.session;
        session_mut.state = SessionState::Refunded;
        session_mut.remaining_balance = 0;

        msg!("Session closed: {} with refund: {}", session.session_id, refund_amount);
        Ok(())
    }

    /**
     * Create a Refund Claim for dispute resolution
     */
    pub fn create_refund_claim(
        ctx: Context<CreateRefundClaim>,
        claim_id: String,
        session_id: String,
        refund_amount: u64,
        reason: String,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.refund_claim;
        let session = &ctx.accounts.session;
        let clock = Clock::get()?;

        // Verify caller is agent
        require!(
            ctx.accounts.agent.key() == session.agent,
            X402Error::Unauthorized
        );

        // Verify refund amount is valid
        require!(
            refund_amount <= session.deposit_amount,
            X402Error::InvalidRefundAmount
        );

        claim.claim_id = claim_id;
        claim.session_id = session_id;
        claim.agent = session.agent;
        claim.provider = session.provider;
        claim.refund_amount = refund_amount;
        claim.reason = reason;
        claim.state = RefundClaimState::Pending;
        claim.created_at = clock.unix_timestamp;
        claim.bump = ctx.bumps.refund_claim;

        msg!("Refund claim created: {} for amount: {}", claim.claim_id, refund_amount);
        Ok(())
    }
}

// ============================================================================
// Account Contexts
// ============================================================================

#[derive(Accounts)]
#[instruction(session_id: String)]
pub struct InitializeSession<'info> {
    #[account(
        init,
        payer = agent,
        space = 8 + Session::INIT_SPACE,
        seeds = [b"session", session_id.as_bytes()],
        bump
    )]
    pub session: Account<'info, Session>,

    #[account(mut)]
    pub agent: Signer<'info>,

    /// CHECK: Provider public key
    pub provider: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(receipt_id: String)]
pub struct AnchorReceipt<'info> {
    #[account(
        init,
        payer = provider,
        space = 8 + Receipt::INIT_SPACE,
        seeds = [b"receipt", receipt_id.as_bytes()],
        bump
    )]
    pub receipt: Account<'info, Receipt>,

    #[account(mut)]
    pub session: Account<'info, Session>,

    #[account(mut)]
    pub provider: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseSession<'info> {
    #[account(
        mut,
        seeds = [b"session", session.session_id.as_bytes()],
        bump = session.bump
    )]
    pub session: Account<'info, Session>,

    #[account(mut)]
    pub session_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub agent_token_account: Account<'info, TokenAccount>,

    /// CHECK: Can be agent or provider
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(claim_id: String)]
pub struct CreateRefundClaim<'info> {
    #[account(
        init,
        payer = agent,
        space = 8 + RefundClaim::INIT_SPACE,
        seeds = [b"refund_claim", claim_id.as_bytes()],
        bump
    )]
    pub refund_claim: Account<'info, RefundClaim>,

    #[account(mut)]
    pub session: Account<'info, Session>,

    #[account(mut)]
    pub agent: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// Account Structures
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Session {
    #[max_len(64)]
    pub session_id: String,
    #[max_len(64)]
    pub offer_id: String,
    pub agent: Pubkey,
    pub provider: Pubkey,
    pub deposit_amount: u64,
    pub remaining_balance: u64,
    pub price_per_request: u64,
    pub started_at: i64,
    pub expires_at: i64,
    pub request_count: u32,
    pub state: SessionState,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Receipt {
    #[max_len(64)]
    pub receipt_id: String,
    #[max_len(64)]
    pub session_id: String,
    pub request_number: u32,
    #[max_len(64)]
    pub input_hash: String,
    #[max_len(64)]
    pub output_hash: String,
    pub latency_ms: u64,
    pub amount_charged: u64,
    pub sla_met: bool,
    pub timestamp: i64,
    pub provider: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct RefundClaim {
    #[max_len(64)]
    pub claim_id: String,
    #[max_len(64)]
    pub session_id: String,
    pub agent: Pubkey,
    pub provider: Pubkey,
    pub refund_amount: u64,
    #[max_len(256)]
    pub reason: String,
    pub state: RefundClaimState,
    pub created_at: i64,
    pub bump: u8,
}

// ============================================================================
// Enums
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum SessionState {
    Active,
    Depleted,
    Expired,
    Refunded,
    Disputed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RefundClaimState {
    Pending,
    Approved,
    Rejected,
    Disputed,
    Settled,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum X402Error {
    #[msg("Session is not active")]
    SessionNotActive,
    
    #[msg("Session has expired")]
    SessionExpired,
    
    #[msg("Insufficient balance in session")]
    InsufficientBalance,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Invalid refund amount")]
    InvalidRefundAmount,
    
    #[msg("Math overflow")]
    MathOverflow,
}

