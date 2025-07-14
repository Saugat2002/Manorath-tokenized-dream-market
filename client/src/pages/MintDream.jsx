import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { mintDream } from '../utils/blockchain'
import { CONTRACTS, isPackageConfigured } from '../constants/contracts'
import { ArrowLeft, Plus, Target, DollarSign, FileText, Tag } from 'lucide-react'
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
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'sports', label: 'Sports' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
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

    if (!formData.title || !formData.goalAmount || !formData.description) {
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
      await mintDream(signAndExecute, formData.title, goalAmount, formData.description)
      toast.success('Dream NFT created successfully! Waiting for NGO approval.')
      
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              You need to connect your Sui wallet to create dream NFTs.
            </p>
            <Link to="/" className="btn-primary">
              Go Home to Connect
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Dream</h1>
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
              <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 mr-2" />
                Dream Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Complete my Master's Degree"
                className="input-field"
                required
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">
                Choose a clear, specific title for your dream
              </p>
            </div>

            <div>
              <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your dream and what achieving it means to you..."
                rows={4}
                className="input-field resize-none"
                required
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>This description will be reviewed by the NGO team for approval</span>
                <span>{formData.description.length}/500</span>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="goalAmount" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 mr-2" />
                Goal Amount (SUI) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="goalAmount"
                  name="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="0"
                  step="0.1"
                  className="input-field pl-12"
                  required
                />
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                The amount of SUI tokens you need to achieve your dream
              </p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="font-medium text-primary-800 mb-2">Approval Process</h4>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• Your dream will be reviewed by the NGO team</li>
                <li>• Once approved, others can pledge to support your dream</li>
                <li>• You'll receive a notification when your dream is approved</li>
                <li>• You can track the approval status in your dreams list</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                to="/"
                className="flex-1 btn-secondary py-3 text-center"
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
    </div>
  )
}

export default MintDream