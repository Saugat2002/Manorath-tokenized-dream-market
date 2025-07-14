import { Link } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit'
import { Heart, Plus, Building, Users, ArrowRight, Star, Target, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import { hasAdminAccess } from '../constants/contracts'

const Home = () => {
  const currentAccount = useCurrentAccount()
  const isAdmin = currentAccount && hasAdminAccess(currentAccount)

  const features = [
    {
      icon: Heart,
      title: 'Tokenized Dreams',
      description: 'Transform your aspirations into secure NFTs on the Sui blockchain with transparent tracking'
    },
    {
      icon: DollarSign,
      title: 'Community Support',
      description: 'Receive pledges from community members who believe in your goals and want to help'
    },
    {
      icon: Building,
      title: 'NGO Partnership',
      description: 'Access matching funds from verified NGO partners when you meet contribution requirements'
    },
    {
      icon: Users,
      title: 'Legacy Wall',
      description: 'Celebrate completed dreams publicly and inspire others to pursue their aspirations'
    }
  ]

  const adminFeatures = [
    {
      icon: Target,
      title: 'Dream Approval',
      description: 'Review and approve dreams submitted by users with comprehensive evaluation tools'
    },
    {
      icon: Building,
      title: 'Vault Management',
      description: 'Create and manage matching fund vaults with flexible contribution requirements'
    },
    {
      icon: TrendingUp,
      title: 'Impact Analytics',
      description: 'Track the measurable impact of your NGO\'s support across the platform'
    }
  ]

  const stats = [
    { label: 'Dreams Created', value: '1,247', icon: Heart },
    { label: 'Dreams Completed', value: '342', icon: CheckCircle },
    { label: 'SUI Raised', value: '15,680', icon: DollarSign },
    { label: 'Active NGOs', value: '23', icon: Building },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="section-header">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-6 border border-primary-200">
            <Heart className="w-4 h-4 mr-2" />
            Manorath - Tokenized Dream Market
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Dreams into
            <span className="block text-primary-600">
              Achievable Reality
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Create, fund, and achieve your dreams with the power of blockchain technology, 
            community support, and institutional partnerships.
          </p>

          {/* Wallet Connection */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {!currentAccount ? (
              <div className="text-center">
                <ConnectButton className="btn-primary text-lg px-8 py-4 mb-4" />
                <p className="text-gray-500 text-sm">
                  Connect your Sui wallet to get started
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="card px-6 py-3 border-primary-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <div>
                      <span className="text-sm text-gray-600">Connected Wallet</span>
                      <div className="font-mono text-sm text-gray-900">
                        {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                      </div>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="status-badge bg-yellow-100 text-yellow-800 border-yellow-200">
                    NGO Administrator
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card card-hover p-6 text-center">
                <Icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        {currentAccount && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              {isAdmin ? 'Administrator Actions' : 'Quick Actions'}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {!isAdmin ? (
                <>
                  <Link to="/mint" className="feature-card group">
                    <Plus className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">Create Dream</h3>
                    <p className="feature-description mb-4">
                      Start your journey by creating your first dream NFT
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">Get Started</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>

                  <Link to="/dreams" className="feature-card group">
                    <Heart className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">My Dreams</h3>
                    <p className="feature-description mb-4">
                      Track your dreams and monitor their approval status
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">View Dreams</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>

                  <Link to="/dreams" className="feature-card group">
                    <DollarSign className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">Support Dreams</h3>
                    <p className="feature-description mb-4">
                      Pledge to approved dreams and help others succeed
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">Browse Dreams</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>

                  <Link to="/legacy" className="feature-card group">
                    <Users className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">Legacy Wall</h3>
                    <p className="feature-description mb-4">
                      Celebrate completed dreams and get inspired
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">View Legacy</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/ngo" className="feature-card group">
                    <Target className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">Review Dreams</h3>
                    <p className="feature-description mb-4">
                      Approve or reject submitted dreams
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">Manage Dreams</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>

                  <Link to="/ngo" className="feature-card group">
                    <Building className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">Create Vaults</h3>
                    <p className="feature-description mb-4">
                      Set up matching fund vaults for approved dreams
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">Manage Vaults</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>

                  <Link to="/dreams" className="feature-card group">
                    <Heart className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">All Dreams</h3>
                    <p className="feature-description mb-4">
                      View all approved dreams available for pledging
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">Browse Dreams</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>

                  <Link to="/legacy" className="feature-card group">
                    <TrendingUp className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                    <h3 className="feature-title">Impact Tracking</h3>
                    <p className="feature-description mb-4">
                      Monitor the success of your NGO's support
                    </p>
                    <div className="flex items-center justify-center text-primary-600 font-medium">
                      <span className="text-sm">View Impact</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <div className="section-header">
            <h2 className="section-title">
              {isAdmin ? 'NGO Administrator Features' : 'How Manorath Works'}
            </h2>
            <p className="section-subtitle">
              {isAdmin 
                ? 'Comprehensive tools for managing and supporting community dreams'
                : 'A complete ecosystem for creating, funding, and achieving your aspirations'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(isAdmin ? adminFeatures : features).map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="feature-card group">
                  <Icon className="feature-icon group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="feature-title">
                    {feature.title}
                  </h3>
                  <p className="feature-description">
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
            <div className="card p-12 max-w-2xl mx-auto border-primary-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Connect your wallet and begin creating or supporting dreams today.
              </p>
              <ConnectButton className="btn-primary text-lg px-8 py-4" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Built on Sui Blockchain • Powered by Community Support • Secured by Smart Contracts
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home