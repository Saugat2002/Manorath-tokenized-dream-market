// Contract addresses and configuration

// Deployed package ID from sui client publish
const PACKAGE_ID = '0xc27670350fc823565b2da9b89a52c61e1d27df77088d2de6291f6bd7ac339182'

// Admin wallet address (the wallet that has AdminCap)
const ADMIN_WALLET_ADDRESS = '0xf446298aa6a47f9b619ec394eb5764c3763a76629aa14c94394663d24733eab4'

// AdminCap created during deployment
const ADMIN_CAP_ID = '0x339f0ce84a93173264409c0f9ba1838b7e8cc1deb1e8dd8c318a0812bf424218'

export const CONTRACTS = {
  PACKAGE_ID,
  ADMIN_CAP_ID
}

export const NETWORK = {
  TESTNET: 'https://fullnode.testnet.sui.io:443',
  DEVNET: 'https://fullnode.devnet.sui.io:443',
  MAINNET: 'https://fullnode.mainnet.sui.io:443',
}

export const CURRENT_NETWORK = NETWORK.TESTNET

export const MIST_PER_SUI = 1000000000

// Helper to check if package ID is properly configured
export const isPackageConfigured = () => {
  return PACKAGE_ID && PACKAGE_ID !== '0x0'
}

// Helper to check if user is admin
export const isAdmin = (walletAddress) => {
  return walletAddress === ADMIN_WALLET_ADDRESS
}

// Helper to check if user has admin access
export const hasAdminAccess = (currentAccount) => {
  return currentAccount && isAdmin(currentAccount.address)
}