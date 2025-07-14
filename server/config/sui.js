import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
// import { fromBase64 } from '@mysten/sui/utils';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sui client
export const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || getFullnodeUrl('testnet')
});

// Initialize admin keypair for automated actions
let adminKeypair = null;
if (process.env.ADMIN_PRIVATE_KEY) {
  try {
    // const privateKeyBytes = fromBase64(process.env.ADMIN_PRIVATE_KEY);
    adminKeypair = Ed25519Keypair.fromSecretKey(process.env.ADMIN_PRIVATE_KEY);
  } catch (error) {
    console.warn('Invalid admin private key format:', error.message);
  }
}

export { adminKeypair };

// Contract configuration
export const CONTRACT_CONFIG = {
  PACKAGE_ID: process.env.PACKAGE_ID,
  DREAM_NFT_TYPE: `${process.env.PACKAGE_ID}::DreamNFT::DreamNFT`,
  NGO_VAULT_TYPE: `${process.env.PACKAGE_ID}::NGOVault::NGOVault`,
};

// Network configuration
export const NETWORK_CONFIG = {
  NETWORK: process.env.SUI_NETWORK || 'testnet',
  RPC_URL: process.env.SUI_RPC_URL || getFullnodeUrl('testnet'),
  ADMIN_ADDRESS: process.env.ADMIN_ADDRESS,
};

// Validate configuration
export const validateConfig = () => {
  const required = ['PACKAGE_ID', 'ADMIN_ADDRESS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  if (!adminKeypair) {
    console.warn('Admin keypair not configured - automated actions will be disabled');
    return false;
  }
  
  return true;
};