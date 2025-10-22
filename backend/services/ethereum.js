import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Initialize provider
const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
);

// Initialize wallet
let wallet;
try {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in environment variables');
  }
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log('Ethereum wallet initialized:', wallet.address);
} catch (error) {
  console.error('Error initializing wallet:', error.message);
  process.exit(1);
}

/**
 * Send ETH to a recipient address
 * @param {string} recipientAddress - The address to send ETH to
 * @param {string} amountInEth - The amount of ETH to send (e.g., "0.01")
 * @returns {Promise<Object>} - Transaction receipt
 */
export const sendEth = async (recipientAddress, amountInEth = "0.01") => {
  try {
    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`Wallet balance: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) < parseFloat(amountInEth)) {
      throw new Error('Insufficient funds in faucet wallet');
    }

    // Prepare transaction
    const tx = {
      to: recipientAddress,
      value: ethers.parseEther(amountInEth),
    };

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      ...tx,
      from: wallet.address
    });
    
    // Add 20% buffer to gas estimate
    tx.gasLimit = gasEstimate * 120n / 100n;

    // Send transaction
    console.log(`Sending ${amountInEth} ETH to ${recipientAddress}`);
    const transaction = await wallet.sendTransaction(tx);
    
    console.log(`Transaction sent: ${transaction.hash}`);
    
    // Wait for confirmation
    const receipt = await transaction.wait();
    
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: wallet.address,
      to: recipientAddress,
      amount: amountInEth
    };
    
  } catch (error) {
    console.error('Error sending ETH:', error);
    throw error;
  }
};

/**
 * Get wallet balance
 * @returns {Promise<string>} - Balance in ETH
 */
export const getBalance = async () => {
  try {
    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

/**
 * Check if provider is connected
 * @returns {Promise<boolean>}
 */
export const checkConnection = async () => {
  try {
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
    return true;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

export { wallet, provider };



