import { Link } from 'react-router-dom'
import { Heart, DollarSign, User, Calendar, CheckCircle } from 'lucide-react'
import { mistToSui } from '../utils/blockchain'

const DreamCard = ({ dream, showPledgeButton = false }) => {
  // Use the dream data directly from blockchain
  const dreamData = {
    id: dream?.id || 'unknown',
    title: dream?.title || 'Untitled Dream',
    owner: dream?.owner || 'unknown',
    goalAmount: dream?.goalAmount || 0,
    savedAmount: dream?.savedAmount || 0,
    isComplete: dream?.isComplete || false,
    createdAt: dream?.createdAt || new Date().toISOString(),
    description: dream?.description || 'No description provided',
  }

  const progressPercentage = dreamData.goalAmount > 0 ? (dreamData.savedAmount / dreamData.goalAmount) * 100 : 0
  const remainingAmount = Math.max(0, dreamData.goalAmount - dreamData.savedAmount)

  const truncateAddress = (address) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {dreamData.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            {truncateAddress(dreamData.owner)}
          </div>
        </div>
        {dreamData.isComplete && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Complete</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {mistToSui(dreamData.savedAmount).toFixed(2)} SUI raised
          </span>
          <span className="text-sm font-medium text-gray-800">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>Goal: {mistToSui(dreamData.goalAmount).toFixed(2)} SUI</span>
          <span>Remaining: {mistToSui(remainingAmount).toFixed(2)} SUI</span>
        </div>
      </div>

      {/* Description */}
      {dreamData.description && dreamData.description !== 'No description provided' && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {dreamData.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(dreamData.createdAt).toLocaleDateString()}
        </div>
        
        {showPledgeButton && !dreamData.isComplete && (
          <Link 
            to={`/pledge/${dreamData.id}`}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Heart className="w-4 h-4 mr-1" />
            Pledge
          </Link>
        )}
      </div>
    </div>
  )
}

export default DreamCard 