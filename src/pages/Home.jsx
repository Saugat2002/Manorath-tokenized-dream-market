import { Link } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Heart, Plus, Building, Award, Target, Users, Zap } from 'lucide-react'

const Home = () => {
  const currentAccount = useCurrentAccount()

  const features = [
    {
      icon: Target,
      title: 'Tokenized Dreams',
      description: 'Transform your aspirations into NFTs and track progress toward your goals.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Get support from the community through pledges and contributions.',
    },
    {
      icon: Building,
      title: 'NGO Matching',
      description: 'NGOs can provide matching funds to amplify your savings impact.',
    },
    {
      icon: Award,
      title: 'Legacy Wall',
      description: 'Celebrate completed dreams on our public legacy wall.',
    },
    {
      icon: Zap,
      title: 'Instant Transactions',
      description: 'Fast and secure transactions powered by Sui blockchain.',
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium">
          <Heart className="w-4 h-4 mr-2" />
          Tokenized Dream Market
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Turn Your Dreams Into
          <br />
          <span className="gradient-text">Digital Reality</span>
        </h1>
        
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Create NFTs for your dreams, get community support, and receive matching funds from NGOs. 
          Make your aspirations achievable with blockchain technology.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentAccount ? (
            <>
              <Link to="/mint" className="btn-primary text-lg px-8 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Create Your Dream
              </Link>
              <Link to="/dreams" className="btn-secondary text-lg px-8 py-3">
                View My Dreams
              </Link>
            </>
          ) : (
            <div className="text-white/60 text-lg">
              Connect your wallet to get started
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          )
        })}
      </div>

      {/* Stats Section */}
      <div className="card p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Platform Impact</h2>
          <p className="text-gray-600">Making dreams come true, one NFT at a time</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">100+</div>
            <div className="text-gray-600">Dreams Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">50+</div>
            <div className="text-gray-600">Dreams Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">10+</div>
            <div className="text-gray-600">NGO Partners</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Create Your Dream</h3>
            <p className="text-gray-600">
              Mint an NFT representing your dream with a clear goal and target amount.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Support</h3>
            <p className="text-gray-600">
              Receive pledges from the community and matching funds from NGO partners.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Achieve Your Goal</h3>
            <p className="text-gray-600">
              Reach your target amount and see your dream featured on the legacy wall.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 