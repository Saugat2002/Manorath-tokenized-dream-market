// Contract addresses and configuration

// Deployed package ID from sui client publish
const PACKAGE_ID = '0x399526a6033a3193843567e304ded30d1822b4887d630c4f54680a8ee9e3ab41'

// AdminCap created during deployment
const ADMIN_CAP_ID = '0xe027c3a183bbb96425b02987bc1330de72aa246ca903a4c5ad701b3c8d19883a'

export const CONTRACTS = {
  DREAM_NFT: `${PACKAGE_ID}::DreamNFT`,
  NGO_VAULT: `${PACKAGE_ID}::NGOVault`,
  PACKAGE_ID,
  ADMIN_CAP_ID
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
  return (
    CONTRACTS.PACKAGE_ID !== '0x0' &&
    CONTRACTS.PACKAGE_ID !== 'YOUR_PACKAGE_ID_HERE' &&
    CONTRACTS.PACKAGE_ID.startsWith('0x') &&
    CONTRACTS.PACKAGE_ID.length === 66
  )
}