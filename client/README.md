# Manorath Frontend

React frontend application for the Manorath tokenized dream market platform.

## Features

- Professional dark green and white monochromatic design
- Responsive layout optimized for all devices
- Sui blockchain integration with wallet connectivity
- Dream creation, approval, and pledging workflows
- NGO dashboard for administrators
- Legacy wall showcasing completed dreams

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure contracts**
   - Update `PACKAGE_ID` in `src/constants/contracts.js`
   - Ensure smart contracts are deployed

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.jsx   # Bottom navigation
│   ├── DreamCard.jsx    # Dream display component
│   └── ErrorBoundary.jsx
├── pages/              # Route components
│   ├── Home.jsx        # Landing page
│   ├── MintDream.jsx   # Dream creation
│   ├── DreamList.jsx   # User's dreams
│   ├── Pledge.jsx      # Support dreams
│   ├── NGODashboard.jsx # Admin panel
│   └── LegacyWall.jsx  # Completed dreams
├── utils/              # Blockchain utilities
│   └── blockchain.js   # Sui integration
├── constants/          # App configuration
│   └── contracts.js    # Contract addresses
└── index.css          # Global styles
```

## Design System

### Colors
- **Primary Green**: #22c55e (primary-600)
- **White**: #ffffff
- **Gray Scale**: #f9fafb to #111827

### Typography
- **Font Family**: Inter (primary), JetBrains Mono (code)
- **Font Weights**: 300-900

### Components
- **Cards**: Clean white backgrounds with subtle shadows
- **Buttons**: Primary (green), secondary (white), outline, danger
- **Status Badges**: Color-coded for different states
- **Progress Bars**: Green fill with smooth animations

## Key Features

### Wallet Integration
- Mysten Dapp Kit for Sui wallet connectivity
- Automatic network detection
- Transaction signing and execution

### Dream Management
- Create and submit dreams for approval
- Track approval status and progress
- Pledge to approved dreams

### NGO Administration
- Review and approve/reject dreams
- Create matching fund vaults
- Track vault progress and release funds

### Responsive Design
- Mobile-first approach
- Bottom navigation for mobile
- Adaptive layouts for all screen sizes

## Environment Variables

Create a `.env.local` file:
```
REACT_APP_PACKAGE_ID=your_deployed_package_id
```

## Dependencies

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **@mysten/dapp-kit**: Sui blockchain integration
- **Lucide React**: Icon library
- **React Router**: Client-side routing
- **React Hot Toast**: Notifications