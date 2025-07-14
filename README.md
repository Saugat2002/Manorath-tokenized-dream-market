# Manorath - Tokenized Dream Market

A decentralized platform built on Sui blockchain that allows users to create NFTs representing their dreams/goals, receive community support through pledges, and get matching funds from NGO partners.

## Project Structure

```
manorath/
├── contract/              # Sui Move smart contracts
│   ├── sources/
│   │   ├── DreamNFT.move
│   │   └── NGOVault.move
│   ├── tests/
│   ├── Move.toml
│   └── Move.lock
└── client/               # React frontend application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── utils/
    │   └── constants/
    ├── package.json
    └── vite.config.js
```

## Features

### 🎯 **Dream NFTs**
- Create tokenized representations of your dreams and goals
- Set target amounts and track progress
- Receive community pledges to reach your goals

### 🤝 **Community Support**
- Browse and support other people's dreams
- Make pledges using SUI tokens
- Track your contributions and impact

### 🏢 **NGO Matching**
- NGOs can create matching vaults for specific dreams
- Conditional matching based on consistent contributions
- Amplify community impact through institutional support

### 🏆 **Legacy Wall**
- Celebrate completed dreams publicly
- Inspire others with success stories
- Track platform impact and statistics

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Blockchain**: Sui Move smart contracts
- **Wallet Integration**: Mysten Dapp Kit
- **UI Components**: Lucide React icons
- **State Management**: React hooks

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Sui wallet (Sui Wallet, Suiet, etc.)
- SUI tokens for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd manorath
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Deploy smart contracts**
   ```bash
   cd ../contract
   sui move build
   sui client publish --gas-budget 20000000
   ```

4. **Configure environment**
   - Update `PACKAGE_ID` in `client/src/constants/contracts.js` with your deployed contract address
   - Ensure you're connected to the correct Sui network (testnet/devnet)

5. **Start the development server**
   ```bash
   cd ../client
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Connect your Sui wallet

## Smart Contract Deployment

The platform requires two main Move contracts:

### 1. DreamNFT Contract
```move
module final_project::DreamNFT {
    // Creates dream NFTs with goals and tracking
    public entry fun mintDream(title: String, goalAmount: u64, description: String, ctx: &mut TxContext)
    public entry fun pledgeToDream(nft: &mut DreamNFT, amount: u64)
    // ... other functions
}
```

### 2. NGOVault Contract
```move
module final_project::NGOVault {
    // Manages NGO matching funds
    public entry fun createVault(dreamID: ID, matchAmount: u64, minAmount: u8, ctx: &mut TxContext)
    public entry fun releaseMatch(vault: &mut NGOVault, dream: &mut DreamNFT, ctx: &mut TxContext)
    // ... other functions
}
```

### Deployment Steps
1. Compile the Move contracts: `sui move build`
2. Deploy to network: `sui client publish --gas-budget 20000000`
3. Update `PACKAGE_ID` in the React app configuration

## Usage Guide

### For Dream Creators
1. **Connect Wallet**: Click "Connect Wallet" in the navigation
2. **Create Dream**: Go to "Create Dream" and fill out the form
3. **Wait for Approval**: NGO team will review your dream
4. **Track Progress**: Monitor pledges on "Dreams" page

### For Supporters
1. **Browse Dreams**: Visit "Dreams" to see approved dreams
2. **Make Pledges**: Click "Pledge" on any active dream
3. **Track Impact**: See your contributions and their impact

### For NGOs
1. **Access Dashboard**: Navigate to "NGO Dashboard" (admin only)
2. **Review Dreams**: Approve or reject pending dreams
3. **Create Vaults**: Set up matching funds for specific dreams
4. **Monitor**: Track contribution milestones and release funds

## Design Philosophy

The frontend features a professional, monochromatic design with:
- **Dark green and white color scheme** for trust and growth
- **Sharp contrasts** for clarity and accessibility
- **Minimal gradients** for a clean, professional appearance
- **Human-centered interactions** with clear feedback and intuitive navigation

## Development Notes

### Mock Data
The current implementation uses mock data for demonstration. In production:
- Replace mock data with actual blockchain queries
- Implement proper error handling for network calls
- Add loading states for all async operations

### Blockchain Integration
- All blockchain functions are in `client/src/utils/blockchain.js`
- Update contract addresses in `client/src/constants/contracts.js`
- Ensure proper gas fee handling for all transactions

### Styling
- Built with Tailwind CSS for responsive design
- Professional dark green and white theme
- Clean, accessible interface with sharp contrasts

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live updates
- **Categories**: Dream categorization and filtering
- **Notifications**: Email/push notifications for milestones
- **Analytics**: Advanced analytics dashboard
- **Mobile App**: React Native mobile application
- **Multi-chain**: Support for other blockchain networks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions, issues, or contributions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for the Sui blockchain ecosystem**