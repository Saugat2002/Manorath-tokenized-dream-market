// Contract addresses and configuration

// Deployed package ID from sui client publish
const PACKAGE_ID = '0xa59e7d128d008793d0c7e3b11bdf09b2731d305ee3d3b03b3fd091c15f3a250c'

// Admin wallet address (the wallet that has AdminCap)
const ADMIN_WALLET_ADDRESS = '0xf446298aa6a47f9b619ec394eb5764c3763a76629aa14c94394663d24733eab4'

// AdminCap created during deployment
const ADMIN_CAP_ID = '0x793f9413ecec293dfc067b817037657c4df6cb0d1d179a1a426f6fc8152d6ec5'

export const CONTRACTS = {
  PACKAGE_ID: "0x2482d6f76254ecb6fb2c1bbb844c810ddd7b317ff45eabbe6c6039ac0f2f2713",
  ADMIN_CAP_ID: "0x0f435128d189e9d3ef16cf611b7b956aaa2464dfba21681ca1c0da5804746912",
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