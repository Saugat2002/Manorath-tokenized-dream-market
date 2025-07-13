import { useState, useEffect } from 'react'
import { Award, Calendar, DollarSign, User, Search, Trophy, Star, Loader2 } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { getAllCompletedDreams, mistToSui } from '../utils/blockchain'
import { isPackageConfigured } from '../constants/contracts'
import toast from 'react-hot-toast'

const LegacyWall = () => {
  const currentAccount = useCurrentAccount()
  const [completedDreams, setCompletedDreams] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isPackageConfigured()) {
      loadCompletedDreams()
    } else {
      setLoading(false)
    }
  }, [])

  const loadCompletedDreams = async () => {
    setLoading(true)
    try {
      const completedDreamObjects = await getAllCompletedDreams()
      
      // Transform blockchain objects to our dream format
      const completedDreamData = completedDreamObjects.map(obj => {
        const fields = obj.data?.content?.fields || {}
        return {
          id: obj.data?.objectId,
          title: fields.title || 'Untitled Dream',
          owner: fields.owner || 'unknown',
          goalAmount: parseInt(fields.goalAmount || '0'),
          savedAmount: parseInt(fields.savedAmount || '0'),
          isComplete: fields.isComplete || false,
          completedAt: new Date().toISOString(), // We don't have completion timestamp in contract
          description: fields.description || 'No description provided',
          category: 'General', // Category not implemented in contract
          pledgeCount: 0, // Pledge count not tracked in current contract
        }
      })

      setCompletedDreams(completedDreamData)
    } catch (error) {
      console.error('Error loading completed dreams:', error)
      toast.error('Failed to load completed dreams')
    } finally {
      setLoading(false)
    }
  }

  const filteredDreams = completedDreams.filter(dream =>
    dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dream.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const truncateAddress = (address) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getCategoryColor = (category) => {
    const colors = {
      Business: 'bg-blue-100 text-blue-800',
      Health: 'bg-red-100 text-red-800',
      Education: 'bg-purple-100 text-purple-800',
      Community: 'bg-green-100 text-green-800',
      Arts: 'bg-yellow-100 text-yellow-800',
      Personal: 'bg-gray-100 text-gray-800',
      General: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const totalDreams = completedDreams.length
  const totalAmount = completedDreams.reduce((sum, dream) => sum + dream.savedAmount, 0)

  if (!isPackageConfigured()) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Contract Not Deployed</h2>
          <p className="text-gray-600 mb-6">
            The smart contract needs to be deployed first to view completed dreams.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-4">
          <Award className="w-4 h-4 mr-2" />
          Legacy Wall
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Wall of Achieved Dreams
        </h1>
        <p className="text-white/80">
          Celebrating the dreams that became reality through community support
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-2xl font-bold gradient-text mb-1">
            {totalDreams}
          </div>
          <div className="text-gray-600">Dreams Completed</div>
        </div>
        
        <div className="card p-6 text-center">
          <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <div className="text-2xl font-bold gradient-text mb-1">
            {mistToSui(totalAmount).toFixed(0)}
          </div>
          <div className="text-gray-600">SUI Raised</div>
        </div>
        
        <div className="card p-6 text-center">
          <Star className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <div className="text-2xl font-bold gradient-text mb-1">
            {filteredDreams.length}
          </div>
          <div className="text-gray-600">Dreams Displayed</div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search completed dreams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Dreams Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      ) : filteredDreams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDreams.map((dream) => (
            <div key={dream.id} className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {dream.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    {truncateAddress(dream.owner)}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(dream.category)}`}>
                  {dream.category}
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-full">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {mistToSui(dream.savedAmount).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">SUI Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {dream.goalAmount > 0 ? ((dream.savedAmount / dream.goalAmount) * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Goal Achieved</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
                <div className="text-sm text-gray-600 mt-1 text-center">
                  Goal: {mistToSui(dream.goalAmount).toFixed(2)} SUI
                </div>
              </div>

              {/* Description */}
              {dream.description && dream.description !== 'No description provided' && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {dream.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(dream.completedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Award className="w-4 h-4 mr-1" />
                  Completed
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="card p-8 max-w-md mx-auto">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'No dreams found' : 'No completed dreams yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Completed dreams will appear here when goals are achieved'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LegacyWall 