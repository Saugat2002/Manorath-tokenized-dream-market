import { Link, useLocation } from 'react-router-dom'
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit'
import { Wallet, Home, Heart, Building, Users, Plus, LogOut, ChevronDown } from 'lucide-react'
import { hasAdminAccess } from '../constants/contracts'
import { useState } from 'react'

const Navigation = () => {
  const currentAccount = useCurrentAccount()
  const { disconnect } = useDisconnectWallet()
  const location = useLocation()
  const [showWalletMenu, setShowWalletMenu] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dreams', label: 'Dreams', icon: Heart },
    { path: '/mint', label: 'Create', icon: Plus },
    { path: '/legacy', label: 'Legacy', icon: Users },
  ]

  // Add NGO Dashboard only for admin users
  if (currentAccount && hasAdminAccess(currentAccount)) {
    navItems.push({ path: '/ngo', label: 'NGO', icon: Building })
  }

  const handleDisconnect = () => {
    disconnect()
    setShowWalletMenu(false)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background blur and border */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    active
                      ? 'text-primary-600 bg-gradient-to-r from-primary-500/20 to-purple-500/20 shadow-lg'
                      : 'text-gray-600 hover:text-primary-500 hover:bg-white/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                    active 
                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-primary-50'
                  }`}>
                    <Icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-xs font-medium mt-1 transition-colors ${
                    active ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* Wallet Menu or Connect Button */}
            {currentAccount ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-105 text-gray-600 hover:text-primary-500 hover:bg-white/50"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 hover:bg-primary-50 transition-all duration-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium mt-1 text-gray-500">
                    Wallet
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showWalletMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px]">
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
                      <div className="font-mono text-sm text-gray-800 truncate">
                        {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center p-2">
                <ConnectButton className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 transform hover:scale-105 text-gray-600 hover:text-primary-500 hover:bg-white/50">
                  <div className="p-1.5 rounded-lg bg-gray-100 hover:bg-primary-50 transition-all duration-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium mt-1 text-gray-500">
                    Connect
                  </span>
                </ConnectButton>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom safe area for mobile devices */}
      <div className="h-2 bg-white/80 backdrop-blur-xl"></div>
    </nav>
  )
}

export default Navigation 