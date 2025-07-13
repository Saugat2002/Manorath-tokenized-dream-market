import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { mintDream } from '../utils/blockchain'
import { CONTRACTS, isPackageConfigured } from '../constants/contracts'
import { ArrowLeft, Plus, Target, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MintDream = () => {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: 'education'
  })
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    'education',
    'healthcare',
    'business',
    'technology',
    'arts',
    'sports',
    'travel',
    'other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentAccount) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isPackageConfigured()) {
      toast.error('Smart contract not deployed. Please check SETUP.md for deployment instructions.')
      return
    }

    if (!formData.title || !formData.goalAmount) {
      toast.error('Please fill in all required fields')
      return
    }

    const goalAmount = parseFloat(formData.goalAmount)
    if (goalAmount <= 0) {
      toast.error('Goal amount must be greater than 0')
      return
    }

    setIsLoading(true)
    
    try {
      await mintDream(signAndExecute, formData.title, goalAmount)
      toast.success('Dream NFT created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        goalAmount: '',
        category: 'education'
      })
    } catch (error) {
      console.error('Error creating dream:', error)
      toast.error('Failed to create dream: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentAccount) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your Sui wallet to create dream NFTs.
          </p>
          <Link to="/" className="btn-primary">
            Go Home to Connect
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Dream</h1>
          <p className="text-gray-600">
            Transform your aspiration into an NFT and start your journey toward achievement.
          </p>
        </div>

        {!isPackageConfigured() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              ⚠️ Smart contract not deployed. Please check SETUP.md for deployment instructions.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Dream Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Complete my Master's Degree"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your dream and what achieving it means to you..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Amount (SUI) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                id="goalAmount"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleInputChange}
                placeholder="100"
                min="0"
                step="0.1"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              The amount of SUI tokens you need to achieve your dream
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              to="/"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !isPackageConfigured()}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Dream NFT
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MintDream 