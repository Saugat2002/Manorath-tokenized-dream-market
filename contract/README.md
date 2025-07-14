# Manorath Smart Contracts

This directory contains the Sui Move smart contracts for the Manorath platform.

## Contracts

### DreamNFT.move
- Main contract for creating and managing dream NFTs
- Handles dream creation, approval, and pledging
- Includes admin functionality for dream approval

### NGOVault.move
- Manages NGO matching fund vaults
- Tracks monthly contributions
- Handles conditional fund release

## Deployment

1. **Build contracts**
   ```bash
   sui move build
   ```

2. **Deploy to testnet**
   ```bash
   sui client publish --gas-budget 20000000
   ```

3. **Update frontend configuration**
   - Copy the package ID from deployment output
   - Update `PACKAGE_ID` in `../client/src/constants/contracts.js`

## Testing

Run tests with:
```bash
sui move test
```

## Contract Functions

### DreamNFT
- `mintDream()` - Create a new dream NFT
- `approveDream()` - Admin function to approve dreams
- `pledgeToDream()` - Pledge SUI to an approved dream

### NGOVault
- `createVault()` - Create a matching fund vault
- `recordMonthlyContribution()` - Track monthly contributions
- `releaseMatch()` - Release matching funds when conditions are met