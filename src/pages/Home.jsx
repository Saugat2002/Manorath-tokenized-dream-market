import { Link } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit'
import { Heart, Plus, Building, Users, ArrowRight, Star, Target, DollarSign } from 'lucide-react'
import { hasAdminAccess } from '../constants/contracts'

const Home = () => {
  const currentAccount = useCurrentAccount()
  const isAdmin = currentAccount && hasAdminAccess(currentAccount)

  const features = [
    {
      icon: Heart,
      title: 'Tokenized Dreams',
      description: 'Transform your aspirations into NFTs on the Sui blockchain'
    },
    {
      icon: DollarSign,
      title: 'Community Support',
      description: 'Receive pledges from others to help achieve your goals'
    },
    {
      icon: Building,
      title: 'NGO Partnership',
      description: 'Get matching funds from NGO partners when you meet requirements'
    },
    {
      icon: Users,
      title: 'Legacy Wall',
      description: 'Celebrate completed dreams and inspire others'
    }
  ]

  const adminFeatures = [
    {
      icon: Target,
      title: 'Dream Approval',
      description: 'Review and approve dreams submitted by users'
    },
    {
      icon: Building,
      title: 'Vault Management',
      description: 'Create and manage matching fund vaults'
    },
    {
      icon: Star,
      title: 'Community Impact',
      description: 'Track the impact of your NGO\'s support'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-4">
            <Heart className="w-4 h-4 mr-2" />
            Manorath - Tokenized Dream Market
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transform Dreams into
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reality
            </span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Create, fund, and achieve your dreams with the power of blockchain technology and community support.
          </p>

          {/* Wallet Connection */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {!currentAccount ? (
              <div className="space-y-4">
                <ConnectButton className="btn-primary text-lg px-8 py-3" />
                <p className="text-white/60 text-sm">
                  Connect your Sui wallet to get started
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <span className="text-sm opacity-80">Connected:</span>
                  <div className="font-mono text-sm">
                    {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                  </div>
                </div>
                {isAdmin && (
                  <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-4 py-2 text-yellow-300">
                    <span className="text-sm font-medium">NGO Admin</span>
                  </div>
                )}
                <ConnectButton className="btn-secondary text-sm px-4 py-2" />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {currentAccount && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {!isAdmin ? (
              <>
                <Link to="/mint" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Plus className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Dream</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Start your journey by creating your first dream NFT
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link to="/dreams" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Heart className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">My Dreams</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Track your dreams and their approval status
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">View Dreams</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link to="/dreams" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <DollarSign className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Support Dreams</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Pledge to approved dreams and help others succeed
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">Browse Dreams</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link to="/legacy" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Users className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Legacy Wall</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Celebrate completed dreams and get inspired
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">View Legacy</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/ngo" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Target className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Review Dreams</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Approve or reject submitted dreams
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">Manage Dreams</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link to="/ngo" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Building className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Vaults</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Set up matching fund vaults for approved dreams
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">Manage Vaults</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link to="/dreams" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Heart className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">All Dreams</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    View all approved dreams available for pledging
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">Browse Dreams</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                <Link to="/legacy" className="card p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
                  <Star className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Impact Tracking</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Monitor the success of your NGO's support
                  </p>
                  <div className="flex items-center justify-center text-primary-500">
                    <span className="text-sm font-medium">View Impact</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {isAdmin ? 'NGO Admin Features' : 'How It Works'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isAdmin ? adminFeatures : features).map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card p-6 text-center">
                  <Icon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        {!currentAccount && (
          <div className="text-center">
            <div className="card p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet and begin creating or supporting dreams today.
              </p>
              <ConnectButton className="btn-primary text-lg px-8 py-3" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-white/60">
          <p className="text-sm">
            Built on Sui Blockchain • Powered by Community Support
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home 