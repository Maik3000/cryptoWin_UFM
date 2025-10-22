/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEthereumAddress = (address) => {
  // Check if it's a string
  if (typeof address !== 'string') {
    return false;
  }
  
  // Check if it matches the pattern: 0x followed by 40 hexadecimal characters
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
};

/**
 * Formats time remaining into human-readable string
 * @param {number} milliseconds - Time remaining in milliseconds
 * @returns {string} - Formatted time string
 */
export const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) {
    return 'Disponible ahora';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const h = hours;
  const m = minutes % 60;
  const s = seconds % 60;
  
  if (hours > 0) {
    return `${h}h ${m}m ${s}s`;
  } else if (minutes > 0) {
    return `${m}m ${s}s`;
  } else {
    return `${s}s`;
  }
};



