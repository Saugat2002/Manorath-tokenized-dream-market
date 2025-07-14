// Contract addresses and configuration

// Deployed package ID from sui client publish
const PACKAGE_ID = '0x37caa7d9c3985be05e786194ca3dfb6a9637c832fde783f45d9e2bd057c116ba'

// Admin wallet address (the wallet that has AdminCap)
const ADMIN_WALLET_ADDRESS = '0x4540ba2680f4f59b2f8dcd6c91ac180818da62865696008ff8a0bd3484a8cbf9'

// AdminCap created during deployment
const ADMIN_CAP_ID = '0x5cef37b725fcd2656b7d7853d237d88dfe2939b92ffff73983280c06f78ba6b9'

// Dream Registry object ID
const DREAM_REGISTRY_ID = '0xd70e24d2063347ce22cbd36b641d40c37626f2a881009811ec77415dee062004'

export const CONTRACTS = {
  DREAM_NFT: `${PACKAGE_ID}::DreamNFT`,
  NGO_VAULT: `${PACKAGE_ID}::NGOVault`,
  PACKAGE_ID,
  ADMIN_CAP_ID,
  ADMIN_WALLET_ADDRESS,
  DREAM_REGISTRY_ID
}

export const NETWORK = {
  TESTNET: 'https://fullnode.testnet.sui.io:443',
  DEVNET: 'https://fullnode.devnet.sui.io:443',
  MAINNET: 'https://fullnode.mainnet.sui.io:443',
}

export const CURRENT_NETWORK = NETWORK.TESTNET

export const MIST_PER_SUI = 1000000000 // 1 SUI = 10^9 MIST

// Helper to check if package ID is properly configured
export const isPackageConfigured = () => {
  return CONTRACTS.PACKAGE_ID && 
         CONTRACTS.PACKAGE_ID !== '0x...' && 
         CONTRACTS.ADMIN_CAP_ID && 
         CONTRACTS.ADMIN_CAP_ID !== '0x...' &&
         CONTRACTS.DREAM_REGISTRY_ID && 
         CONTRACTS.DREAM_REGISTRY_ID !== '0x...'
}

// Helper to check if user is admin
export const isAdmin = (walletAddress) => {
  return walletAddress === ADMIN_WALLET_ADDRESS
}

// Helper to check if user has admin access
export const hasAdminAccess = (currentAccount) => {
  return currentAccount && isAdmin(currentAccount.address)
}