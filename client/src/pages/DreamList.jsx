import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Heart, Plus, Search, Filter, Loader2, CheckCircle, Clock, Eye, BarChart3 } from 'lucide-react'
import DreamCard from '../components/DreamCard'
import { getUserDreams, getApprovedDreams, mistToSui } from '../utils/blockchain'
import { isPackageConfigured, hasAdminAccess } from '../constants/contracts'
import toast from 'react-hot-toast'

const DreamList = () => {
  const currentAccount = useCurrentAccount()
  
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, completed, pending, approved
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
      let dreamObjects
      
      if (hasAdminAccess(currentAccount)) {
        // Admin can see all approved dreams
        dreamObjects = await getApprovedDreams()
      } else {
        // Normal users see their own dreams
        dreamObjects = await getUserDreams(currentAccount.address)
      }
      
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
          isApproved: fields.isApproved || false,
          createdAt: new Date().toISOString(),
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
    
    let matchesFilter = true
    if (filter === 'active') {
      matchesFilter = !dream.isComplete && dream.isApproved
    } else if (filter === 'completed') {
      matchesFilter = dream.isComplete
    } else if (filter === 'pending') {
      matchesFilter = !dream.isApproved && !dream.isComplete
    } else if (filter === 'approved') {
      matchesFilter = dream.isApproved && !dream.isComplete
    }
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: dreams.length,
    completed: dreams.filter(d => d.isComplete).length,
    active: dreams.filter(d => !d.isComplete && d.isApproved).length,
    pending: dreams.filter(d => !d.isApproved && !d.isComplete).length,
    totalRaised: dreams.reduce((sum, d) => sum + d.savedAmount, 0)
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              You need to connect your Sui wallet to view your dreams
            </p>
            <Link to="/" className="btn-primary">
              Go Home to Connect
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isPackageConfigured()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Not Deployed</h2>
            <p className="text-gray-600 mb-6">
              The smart contract needs to be deployed first. Please check SETUP.md for deployment instructions.
            </p>
            <Link to="/" className="btn-primary">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="section-header">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4 border border-primary-200">
            <Heart className="w-4 h-4 mr-2" />
            {hasAdminAccess(currentAccount) ? 'All Dreams' : 'My Dreams'}
          </div>
          
          <h1 className="section-title">
            {hasAdminAccess(currentAccount) ? 'All Dreams' : 'Your Dream Collection'}
          </h1>
          <p className="section-subtitle">
            {hasAdminAccess(currentAccount) 
              ? 'View all approved dreams that can receive pledges'
              : 'Track your progress and manage your tokenized dreams'
            }
          </p>
        </div>

        {/* Stats */}
        {dreams.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="card p-4 text-center">
              <BarChart3 className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="card p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="card p-4 text-center">
              <Heart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="card p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xl font-bold text-primary-600">{mistToSui(stats.totalRaised).toFixed(0)}</div>
              <div className="text-sm text-gray-600">SUI Raised</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search dreams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                <option value="all">All Dreams</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                {!hasAdminAccess(currentAccount) && (
                  <>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {!hasAdminAccess(currentAccount) && (
            <Link to="/mint" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Dream
            </Link>
          )}
        </div>

        {/* Dreams Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredDreams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDreams.map((dream) => (
              <DreamCard key={dream.id} dream={dream} showPledgeButton={hasAdminAccess(currentAccount)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="card p-8 max-w-md mx-auto">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No dreams found' : 'No dreams yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : hasAdminAccess(currentAccount)
                    ? 'No approved dreams available for pledging'
                    : 'Start by creating your first dream NFT'
                }
              </p>
              {!searchTerm && filter === 'all' && !hasAdminAccess(currentAccount) && (
                <Link to="/mint" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Dream
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DreamList