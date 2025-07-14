import { Link, useLocation } from 'react-router-dom'
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit'
import { Wallet, Home, Heart, Building, Users, Plus, LogOut, ChevronDown, User } from 'lucide-react'
import { hasAdminAccess } from '../constants/contracts'
import { useState, useEffect, useRef } from 'react'

const Navigation = () => {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const location = useLocation()
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const walletMenuRef = useRef(null)

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setShowWalletMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-strong">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="nav-icon" />
                </div>
                <span className={`nav-label ${
                  active ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Wallet Menu or Connect Button */}
          {currentAccount ? (
            <div className="relative" ref={walletMenuRef}>
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="nav-item"
              >
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600 transition-all duration-200">
                  <Wallet className="nav-icon" />
                </div>
                <span className="nav-label">
                  Wallet
                </span>
              </button>

              {/* Dropdown Menu */}
              {showWalletMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-strong border border-gray-200 min-w-[220px]">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Connected Wallet</div>
                        <div className="font-mono text-xs text-gray-500 truncate">
                          {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                        </div>
                      </div>
                    </div>
                    {hasAdminAccess(currentAccount) && (
                      <div className="mt-2">
                        <span className="status-badge bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          NGO Administrator
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
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
            <div className="nav-item">
              <ConnectButton className="flex flex-col items-center">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600 transition-all duration-200">
                  <Wallet className="nav-icon" />
                </div>
                <span className="nav-label">
                  Connect
                </span>
              </ConnectButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation