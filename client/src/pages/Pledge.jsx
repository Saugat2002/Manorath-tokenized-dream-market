import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Heart, DollarSign, User, ArrowLeft, Loader2, CheckCircle, Clock, Shield, Zap } from 'lucide-react'
import { pledgeToDream, mistToSui, getObjectDetails } from '../utils/blockchain'
import { isPackageConfigured } from '../constants/contracts'
import toast from 'react-hot-toast'

const Pledge = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [dream, setDream] = useState(null)
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDream, setLoadingDream] = useState(true)

  useEffect(() => {
    if (id && isPackageConfigured()) {
      loadDream()
    } else {
      setLoadingDream(false)
    }
  }, [id])

  const loadDream = async () => {
    setLoadingDream(true)
    try {
      const dreamObject = await getObjectDetails(id)
      
      if (dreamObject && dreamObject.data) {
        const fields = dreamObject.data.content?.fields || {}
        const transformedDream = {
          id: dreamObject.data.objectId,
          title: fields.title || 'Untitled Dream',
          owner: fields.owner || 'unknown',
          goalAmount: parseInt(fields.goalAmount || '0'),
          savedAmount: parseInt(fields.savedAmount || '0'),
          isComplete: fields.isComplete || false,
          isApproved: fields.isApproved || false,
          createdAt: new Date().toISOString(),
          description: fields.description || 'No description provided',
        }
        setDream(transformedDream)
      } else {
        toast.error('Dream not found')
      }
    } catch (error) {
      console.error('Error loading dream:', error)
      toast.error('Failed to load dream')
    } finally {
      setLoadingDream(false)
    }
  }

  const handlePledge = async (e) => {
    e.preventDefault()
    
    if (!currentAccount) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!pledgeAmount || parseFloat(pledgeAmount) <= 0) {
      toast.error('Please enter a valid pledge amount')
      return
    }

    if (!isPackageConfigured()) {
      toast.error('Smart contract not deployed')
      return
    }

    if (!dream.isApproved) {
      toast.error('This dream is not approved for pledging yet')
      return
    }

    setIsLoading(true)
    
    try {
      await pledgeToDream(signAndExecute, dream.id, parseFloat(pledgeAmount))
      
      // Update dream data locally
      const newSavedAmount = dream.savedAmount + (parseFloat(pledgeAmount) * 1000000000)
      setDream(prev => ({
        ...prev,
        savedAmount: newSavedAmount,
        isComplete: newSavedAmount >= prev.goalAmount
      }))
      
      setPledgeAmount('')
      toast.success('Pledge successful!')
    } catch (error) {
      console.error('Error making pledge:', error)
      toast.error('Failed to make pledge: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              You need to connect your Sui wallet to make pledges
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
              The smart contract needs to be deployed first. Please check SETUP.md for instructions.
            </p>
            <Link to="/" className="btn-primary">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loadingDream) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!dream) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dream Not Found</h2>
            <p className="text-gray-600 mb-6">
              The dream you're looking for doesn't exist or has been removed.
            </p>
            <button onClick={() => navigate('/dreams')} className="btn-primary">
              Back to Dreams
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = dream.goalAmount > 0 ? (dream.savedAmount / dream.goalAmount) * 100 : 0
  const remainingAmount = Math.max(0, dream.goalAmount - dream.savedAmount)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium border border-primary-200">
              <Heart className="w-4 h-4 mr-2" />
              Support a Dream
            </div>
          </div>
          
          <div></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dream Details */}
          <div className="space-y-6">
            <div className="card p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {dream.title}
              </h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <User className="w-4 h-4 mr-1" />
                {dream.owner && dream.owner.length > 10 ? `${dream.owner.slice(0, 8)}...${dream.owner.slice(-6)}` : dream.owner}
              </div>

              {/* Status */}
              {!dream.isApproved ? (
                <div className="flex items-center text-yellow-600 mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">Awaiting NGO Approval</span>
                </div>
              ) : dream.isComplete ? (
                <div className="flex items-center text-green-600 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Dream Completed!</span>
                </div>
              ) : (
                <div className="flex items-center text-primary-600 mb-6 p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Approved for Pledging</span>
                </div>
              )}

              {/* Progress */}
              {!dream.isComplete && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {mistToSui(dream.savedAmount).toFixed(2)} SUI raised
                    </span>
                    <span className="text-sm font-bold text-gray-900">
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
                    <span>Goal: {mistToSui(dream.goalAmount).toFixed(2)} SUI</span>
                    <span>Remaining: {mistToSui(remainingAmount).toFixed(2)} SUI</span>
                  </div>
                </div>
              )}

              {/* Description */}
              {dream.description && dream.description !== 'No description provided' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">About this dream</h3>
                  <p className="text-gray-600 leading-relaxed">{dream.description}</p>
                </div>
              )}
            </div>

            {/* Info about pledging */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">How Pledging Works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Heart className="w-4 h-4 mr-3 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Your pledge helps the dream creator reach their goal</span>
                </div>
                <div className="flex items-start">
                  <Shield className="w-4 h-4 mr-3 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Transactions are secured by the Sui blockchain</span>
                </div>
                <div className="flex items-start">
                  <Zap className="w-4 h-4 mr-3 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a confirmation once the pledge is processed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pledge Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Make a Pledge
            </h2>
            
            {dream.isComplete ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dream Completed!
                </h3>
                <p className="text-gray-600">
                  This dream has already reached its goal. Check out other dreams that need support.
                </p>
              </div>
            ) : !dream.isApproved ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Awaiting Approval
                </h3>
                <p className="text-gray-600">
                  This dream is currently under review by the NGO team. Once approved, you'll be able to pledge.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePledge} className="space-y-6">
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-3">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pledge Amount (SUI)
                  </label>
                  <input
                    type="number"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    placeholder="Enter amount to pledge"
                    min="0"
                    step="0.01"
                    className="input-field"
                    required
                  />
                </div>

                {/* Quick amounts */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Quick amounts:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 25].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setPledgeAmount(amount.toString())}
                        className="btn-secondary text-sm py-2"
                      >
                        {amount} SUI
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !pledgeAmount || parseFloat(pledgeAmount) <= 0}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Pledge...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Pledge {pledgeAmount || '0'} SUI
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Transaction Info */}
            <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h4 className="font-medium text-primary-800 mb-2">Transaction Details</h4>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• Network: Sui Testnet</li>
                <li>• Gas fees will be deducted from your wallet</li>
                <li>• Transaction confirmation typically takes a few seconds</li>
                <li>• You can track your pledge on the Sui Explorer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pledge