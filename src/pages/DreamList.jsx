import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Heart, Plus, Search, Filter, Loader2 } from 'lucide-react'
import DreamCard from '../components/DreamCard'
import { getUserDreams, mistToSui } from '../utils/blockchain'
import { isPackageConfigured } from '../constants/contracts'
import toast from 'react-hot-toast'

const DreamList = () => {
  const currentAccount = useCurrentAccount()
  
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, completed
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (currentAccount && isPackageConfigured()) {
      loadUserDreams()
    } else {
      setLoading(false)
    }
  }, [currentAccount])

  const loadUserDreams = async () => {
    setLoading(true)
    try {
      const dreamObjects = await getUserDreams(currentAccount.address)
      
      // Transform blockchain objects to our dream format
      const transformedDreams = dreamObjects.map(obj => {
        const fields = obj.data?.content?.fields || {}
        return {
          id: obj.data?.objectId,
          title: fields.title || 'Untitled Dream',
          owner: fields.owner || currentAccount.address,
          goalAmount: parseInt(fields.goalAmount || '0'),
          savedAmount: parseInt(fields.savedAmount || '0'),
          isComplete: fields.isComplete || false,
          createdAt: new Date().toISOString(), // We don't have creation time in the contract
          description: fields.description || 'No description provided',
        }
      })
      
      setDreams(transformedDreams)
    } catch (error) {
      console.error('Error loading dreams:', error)
      toast.error('Failed to load dreams')
    } finally {
      setLoading(false)
    }
  }

  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dream.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !dream.isComplete) ||
                         (filter === 'completed' && dream.isComplete)
    
    return matchesSearch && matchesFilter
  })

  if (!currentAccount) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your Sui wallet to view your dreams
          </p>
          <Link to="/" className="btn-primary">
            Go Home to Connect
          </Link>
        </div>
      </div>
    )
  }

  if (!isPackageConfigured()) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Contract Not Deployed</h2>
          <p className="text-gray-600 mb-6">
            The smart contract needs to be deployed first. Please check SETUP.md for instructions.
          </p>
          <Link to="/" className="btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-4">
          <Heart className="w-4 h-4 mr-2" />
          My Dreams
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Your Dream Collection
        </h1>
        <p className="text-white/80">
          Track your progress and manage your tokenized dreams
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search dreams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-white/80" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Dreams</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <Link to="/mint" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Dream
        </Link>
      </div>

      {/* Dreams Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      ) : filteredDreams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="card p-8 max-w-md mx-auto">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || filter !== 'all' ? 'No dreams found' : 'No dreams yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first dream NFT'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/mint" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Dream
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {dreams.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Dream Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold gradient-text">
                {dreams.length}
              </div>
              <div className="text-sm text-gray-600">Total Dreams</div>
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">
                {dreams.filter(d => d.isComplete).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">
                {dreams.filter(d => !d.isComplete).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DreamList 