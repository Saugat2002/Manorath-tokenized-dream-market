# Manorath Setup Guide

This guide will help you deploy your Move contracts to Sui testnet and configure your React app.

## Prerequisites

1. **Install Sui CLI**
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
   ```

2. **Create Sui Wallet**
   ```bash
   sui client new-address ed25519
   ```

3. **Switch to Testnet**
   ```bash
   sui client switch --env testnet
   ```

4. **Get Testnet SUI**
   ```bash
   sui client faucet
   ```

## Step 1: Deploy Move Contracts

1. **Navigate to your project directory**
   ```bash
   cd /path/to/your/final_project
   ```

2. **Build the Move package**
   ```bash
   sui move build
   ```

3. **Deploy to Testnet**
   ```bash
   sui client publish --gas-budget 20000000
   ```

4. **Save the Package ID**
   After successful deployment, you'll see output like:
   ```
   Transaction successful!
   Package published at: 0x1234567890abcdef...
   ```
   Copy this Package ID.

## Step 2: Configure React App

1. **Update Contract Configuration**
   Edit `src/constants/contracts.js`:
   ```javascript
   export const CONTRACTS = {
     DREAM_NFT: 'final_project::DreamNFT',
     NGO_VAULT: 'final_project::NGOVault',
     PACKAGE_ID: '0x1234567890abcdef...', // Replace with your Package ID
   }
   ```

2. **Or use Environment Variable**
   Create `.env.local` file:
   ```
   REACT_APP_PACKAGE_ID=0x1234567890abcdef...
   ```

## Step 3: Run the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Connect your wallet**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Choose your Sui wallet (Sui Wallet, Suiet, etc.)

3. **Test the application**
   - Try minting a dream NFT
   - Test pledging functionality
   - Explore NGO dashboard features

## Common Issues

### 1. "Package ID not configured" error
- Make sure you've updated `PACKAGE_ID` in `src/constants/contracts.js`
- Or set the `REACT_APP_PACKAGE_ID` environment variable

### 2. Transaction failures
- Ensure you have enough SUI for gas fees
- Check that you're connected to testnet
- Verify your wallet is properly connected

### 3. Wallet connection issues
- Install a compatible Sui wallet extension
- Make sure the wallet is set to testnet
- Refresh the page and try reconnecting

## Move Contract Functions

Your deployed contracts will have these functions:

### DreamNFT
- `mintDream(title: String, goalAmount: u64)` - Create a new dream NFT
- `pledgeToDream(nft: &mut DreamNFT, amount: u64)` - Pledge to a dream

### NGOVault  
- `createVault(dreamID: ID, matchAmount: u64, minAmount: u8)` - Create matching vault
- `recordMonthlyContribution(vault: &mut NGOVault, dream: &DreamNFT)` - Record contribution
- `releaseMatch(vault: &mut NGOVault, dream: &mut DreamNFT)` - Release matching funds

## Testing on Testnet

1. **Get testnet SUI**
   ```bash
   sui client faucet
   ```

2. **Check your balance**
   ```bash
   sui client balance
   ```

3. **View your objects**
   ```bash
   sui client objects
   ```

## Next Steps

Once everything is working:
1. Test all features thoroughly
2. Consider deploying to mainnet for production
3. Add more features like categories, search, etc.
4. Set up monitoring and analytics

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Move contracts compiled successfully
3. Ensure wallet connection is stable
4. Check Sui testnet status

Happy building! 🚀 