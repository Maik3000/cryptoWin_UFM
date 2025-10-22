import express from 'express';
import pool from '../config/database.js';
import { sendEth } from '../services/ethereum.js';
import { claimLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validate Ethereum address
const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Calculate time in GMT-6 timezone
const getGMT6Time = (date = new Date()) => {
  // Convert to GMT-6 (Central America Time)
  const offset = -6 * 60; // -6 hours in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (offset * 60000));
};

// POST /api/claim - Claim faucet tokens
router.post('/claim', claimLimiter, async (req, res) => {
  const { walletAddress } = req.body;

  try {
    // Validate wallet address
    if (!walletAddress || !isValidEthereumAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección de wallet inválida'
      });
    }

    // Normalize address to lowercase for consistency
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet has claimed before and if 24 hours have passed
    const result = await pool.query(
      'SELECT * FROM claims WHERE wallet_address = $1',
      [normalizedAddress]
    );

    const now = new Date();
    
    if (result.rows.length > 0) {
      const lastClaim = new Date(result.rows[0].last_claim_timestamp);
      const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
      
      if (hoursSinceLastClaim < 24) {
        const nextClaimTime = new Date(lastClaim.getTime() + (24 * 60 * 60 * 1000));
        return res.status(429).json({
          success: false,
          error: 'Debes esperar 24 horas desde tu última reclamación',
          nextClaimTime: nextClaimTime.toISOString(),
          lastClaimTime: lastClaim.toISOString()
        });
      }
    }

    // Send ETH
    const transaction = await sendEth(walletAddress, '0.01');

    // Update or insert claim record
    if (result.rows.length > 0) {
      await pool.query(
        'UPDATE claims SET last_claim_timestamp = $1, transaction_hash = $2 WHERE wallet_address = $3',
        [now, transaction.transactionHash, normalizedAddress]
      );
    } else {
      await pool.query(
        'INSERT INTO claims (wallet_address, last_claim_timestamp, transaction_hash) VALUES ($1, $2, $3)',
        [normalizedAddress, now, transaction.transactionHash]
      );
    }

    const nextClaimTime = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    res.json({
      success: true,
      transactionHash: transaction.transactionHash,
      amount: '0.01',
      nextClaimTime: nextClaimTime.toISOString(),
      message: 'Recompensa enviada exitosamente'
    });

  } catch (error) {
    console.error('Error processing claim:', error);
    
    // Return generic error message to avoid exposing system details
    res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud. Por favor intenta de nuevo más tarde.'
    });
  }
});

// GET /api/check-eligibility/:address - Check if wallet is eligible to claim
router.get('/check-eligibility/:address', async (req, res) => {
  const { address } = req.params;

  try {
    // Validate wallet address
    if (!address || !isValidEthereumAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección de wallet inválida'
      });
    }

    const normalizedAddress = address.toLowerCase();

    // Check if wallet has claimed before
    const result = await pool.query(
      'SELECT * FROM claims WHERE wallet_address = $1',
      [normalizedAddress]
    );

    if (result.rows.length === 0) {
      // Wallet has never claimed
      return res.json({
        eligible: true,
        firstTime: true,
        message: 'Wallet elegible para primera reclamación'
      });
    }

    const lastClaim = new Date(result.rows[0].last_claim_timestamp);
    const now = new Date();
    const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

    if (hoursSinceLastClaim >= 24) {
      // Eligible to claim
      return res.json({
        eligible: true,
        lastClaimTime: lastClaim.toISOString(),
        message: 'Wallet elegible para reclamar'
      });
    } else {
      // Not eligible yet
      const nextClaimTime = new Date(lastClaim.getTime() + (24 * 60 * 60 * 1000));
      const timeRemaining = nextClaimTime - now;

      return res.json({
        eligible: false,
        lastClaimTime: lastClaim.toISOString(),
        nextClaimTime: nextClaimTime.toISOString(),
        timeRemainingMs: timeRemaining,
        message: 'Debes esperar antes de reclamar nuevamente'
      });
    }

  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar elegibilidad'
    });
  }
});

export default router;



