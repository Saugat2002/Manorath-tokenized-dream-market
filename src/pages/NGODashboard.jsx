import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Building, Plus, DollarSign, Clock, CheckCircle, Loader2, Eye, CheckCircle2, XCircle } from 'lucide-react'
import { createNGOVault, recordMonthlyContribution, releaseMatch, getUserVaults, mistToSui, getPendingDreams, getApprovedDreams, approveDream, rejectDream, getApprovedDreamsWithoutVault, getObjectDetails } from '../utils/blockchain'
import { isPackageConfigured, hasAdminAccess } from '../constants/contracts'
import toast from 'react-hot-toast'

const NGODashboard = () => {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [activeTab, setActiveTab] = useState('pending') // pending, approved, vaults
  const [vaultFormData, setVaultFormData] = useState({
    dreamId: '',
    matchAmount: '',
    minMonths: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [vaults, setVaults] = useState([])
  const [loadingVaults, setLoadingVaults] = useState(false)
  const [pendingDreams, setPendingDreams] = useState([])
  const [approvedDreams, setApprovedDreams] = useState([])
  const [loadingDreams, setLoadingDreams] = useState(false)

  useEffect(() => {
    if (currentAccount && isPackageConfigured() && hasAdminAccess(currentAccount)) {
      loadData()
    }
  }, [currentAccount, activeTab])

  const loadData = async () => {
    if (activeTab === 'vaults') {
      await loadVaults()
    } else if (activeTab === 'pending') {
      await loadPendingDreams()
    } else if (activeTab === 'approved') {
      await loadApprovedDreams()
    }
  }

  const loadPendingDreams = async () => {
    setLoadingDreams(true)
    try {
      const dreams = await getPendingDreams()
      setPendingDreams(dreams)
    } catch (error) {
      console.error('Error loading pending dreams:', error)
      toast.error('Failed to load pending dreams')
    } finally {
      setLoadingDreams(false)
    }
  }

  const loadApprovedDreams = async () => {
    setLoadingDreams(true)
    try {
      const dreams = await getApprovedDreams()
      setApprovedDreams(dreams)
    } catch (error) {
      console.error('Error loading approved dreams:', error)
      toast.error('Failed to load approved dreams')
    } finally {
      setLoadingDreams(false)
    }
  }

  const loadVaults = async () => {
    setLoadingVaults(true)
    try {
      const vaultObjects = await getUserVaults(currentAccount.address)
      
      // Transform blockchain objects to our vault format and fetch dream details
      const vaultsWithDreams = await Promise.all(
        vaultObjects.map(async (obj) => {
          const fields = obj.data?.content?.fields || {}
          const dreamId = fields.dreamID || 'unknown'
          
          // Fetch dream details for this vault
          let dreamTitle = 'Unknown Dream'
          let dreamDescription = ''
          let dreamGoalAmount = 0
          
          if (dreamId !== 'unknown') {
            try {
              const dreamObject = await getObjectDetails(dreamId)
              if (dreamObject?.data?.content?.fields) {
                const dreamFields = dreamObject.data.content.fields
                dreamTitle = dreamFields.title || 'Untitled Dream'
                dreamDescription = dreamFields.description || ''
                dreamGoalAmount = parseInt(dreamFields.goalAmount || '0')
              }
            } catch (error) {
              console.error('Error fetching dream details for vault:', error)
            }
          }
          
          return {
            id: obj.data?.objectId,
            dreamId: dreamId,
            dreamTitle: dreamTitle,
            dreamDescription: dreamDescription,
            dreamGoalAmount: dreamGoalAmount,
            matchAmount: parseInt(fields.matchAmount || '0'),
            minMonths: parseInt(fields.minMonths || '0'),
            fulfilledMonths: parseInt(fields.fulfilledMonths || '0'),
            isActive: fields.isActive !== undefined ? fields.isActive : true,
            ngo: fields.ngo || currentAccount.address,
            createdAt: new Date().toISOString(),
          }
        })
      )
      
      setVaults(vaultsWithDreams)
    } catch (error) {
      console.error('Error loading vaults:', error)
      toast.error('Failed to load vaults')
    } finally {
      setLoadingVaults(false)
    }
  }

  const handleVaultFormChange = (e) => {
    const { name, value } = e.target
    setVaultFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApproveAndCreateVault = async (dreamId, matchAmount, minMonths) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isPackageConfigured()) {
      toast.error('Smart contract not deployed')
      return
    }

    if (!matchAmount || !minMonths) {
      toast.error('Please provide match amount and minimum months')
      return
    }

    setIsLoading(true)
    
    try {
      await createNGOVault(
        signAndExecute,
        dreamId,
        parseFloat(matchAmount),
        parseInt(minMonths)
      )
      
      // Reload all data
      await loadPendingDreams()
      await loadApprovedDreams()
      
      toast.success('Dream approved and vault created successfully!')
    } catch (error) {
      console.error('Error creating vault:', error)
      toast.error('Failed to create vault: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectDream = async (dreamId) => {
    try {
      await rejectDream(signAndExecute, dreamId)
      await loadPendingDreams()
    } catch (error) {
      console.error('Error rejecting dream:', error)
    }
  }

  const handleRecordContribution = async (vaultId, dreamId) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isPackageConfigured()) {
      toast.error('Smart contract not deployed')
      return
    }

    try {
      await recordMonthlyContribution(signAndExecute, vaultId, dreamId)
      await loadVaults()
      toast.success('Monthly contribution recorded!')
    } catch (error) {
      console.error('Error recording contribution:', error)
      toast.error('Failed to record contribution: ' + error.message)
    }
  }

  const handleReleaseMatch = async (vaultId, dreamId) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isPackageConfigured()) {
      toast.error('Smart contract not deployed')
      return
    }

    try {
      await releaseMatch(signAndExecute, vaultId, dreamId)
      await loadVaults()
      toast.success('Match released successfully!')
    } catch (error) {
      console.error('Error releasing match:', error)
      toast.error('Failed to release match: ' + error.message)
    }
  }

  if (!currentAccount) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your Sui wallet to access the NGO dashboard
          </p>
          <Link to="/" className="btn-primary">
            Go Home to Connect
          </Link>
        </div>
      </div>
    )
  }

  if (!hasAdminAccess(currentAccount)) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only the NGO admin wallet can access this dashboard.
          </p>
          <Link to="/" className="btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  if (!isPackageConfigured()) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
          <Building className="w-4 h-4 mr-2" />
          NGO Admin Dashboard
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          NGO Partner Dashboard
        </h1>
        <p className="text-white/80">
          Manage dream approvals and create matching vaults
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-gray-800'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Pending Dreams ({pendingDreams.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'approved'
                ? 'bg-white text-gray-800'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Approved Dreams ({approvedDreams.length})
          </button>
          <button
            onClick={() => setActiveTab('vaults')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'vaults'
                ? 'bg-white text-gray-800'
                : 'text-white/80 hover:text-white'
            }`}
          >
            My Vaults ({vaults.length})
          </button>
        </div>
      </div>

      {/* Pending Dreams Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {loadingDreams ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : pendingDreams.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {pendingDreams.map((dreamObj) => {
                const fields = dreamObj.data?.content?.fields || {}
                const dream = {
                  id: dreamObj.data?.objectId,
                  title: fields.title || 'Untitled Dream',
                  owner: fields.owner || 'unknown',
                  goalAmount: parseInt(fields.goalAmount || '0'),
                  savedAmount: parseInt(fields.savedAmount || '0'),
                  description: fields.description || 'No description',
                }
                
                return (
                  <div key={dream.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {dream.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          By: {dream.owner.slice(0, 6)}...{dream.owner.slice(-4)}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Goal Amount:</span>
                        <span className="font-medium">{mistToSui(dream.goalAmount).toFixed(2)} SUI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Description:</span>
                      </div>
                      <p className="text-sm text-gray-600">{dream.description}</p>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Match Amount (SUI)</label>
                          <input
                            type="number"
                            placeholder="100"
                            step="0.1"
                            min="0"
                            className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                            id={`match-${dream.id}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Min Months</label>
                          <input
                            type="number"
                            placeholder="6"
                            min="1"
                            className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                            id={`months-${dream.id}`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const matchAmount = document.getElementById(`match-${dream.id}`).value
                            const minMonths = document.getElementById(`months-${dream.id}`).value
                            if (matchAmount && minMonths) {
                              handleApproveAndCreateVault(dream.id, matchAmount, minMonths)
                            } else {
                              toast.error('Please fill in match amount and minimum months')
                            }
                          }}
                          disabled={isLoading}
                          className="btn-primary flex-1 py-2 text-sm disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {isLoading ? 'Processing...' : 'Approve & Create Vault'}
                        </button>
                        <button
                          onClick={() => handleRejectDream(dream.id)}
                          className="btn-secondary py-2 px-4 text-sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="card p-8 max-w-md mx-auto">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Pending Dreams
                </h3>
                <p className="text-gray-600">
                  All dreams have been reviewed or no new dreams have been submitted.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approved Dreams Tab */}
      {activeTab === 'approved' && (
        <div className="space-y-6">
          {loadingDreams ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : approvedDreams.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {approvedDreams.map((dreamObj) => {
                const fields = dreamObj.data?.content?.fields || {}
                const dream = {
                  id: dreamObj.data?.objectId,
                  title: fields.title || 'Untitled Dream',
                  owner: fields.owner || 'unknown',
                  goalAmount: parseInt(fields.goalAmount || '0'),
                  savedAmount: parseInt(fields.savedAmount || '0'),
                  description: fields.description || 'No description',
                  isComplete: fields.isComplete || false,
                }
                
                return (
                  <div key={dream.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {dream.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          By: {dream.owner.slice(0, 6)}...{dream.owner.slice(-4)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dream.isComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {dream.isComplete ? 'Completed' : 'Approved'}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Goal Amount:</span>
                        <span className="font-medium">{mistToSui(dream.goalAmount).toFixed(2)} SUI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Raised:</span>
                        <span className="font-medium">{mistToSui(dream.savedAmount).toFixed(2)} SUI</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">
                          {dream.goalAmount > 0 ? ((dream.savedAmount / dream.goalAmount) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="progress-bar mb-4">
                      <div 
                        className="progress-fill"
                        style={{ width: `${dream.goalAmount > 0 ? Math.min((dream.savedAmount / dream.goalAmount) * 100, 100) : 0}%` }}
                      ></div>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      Vault created and active
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="card p-8 max-w-md mx-auto">
                <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Approved Dreams
                </h3>
                <p className="text-gray-600">
                  No dreams have been approved yet. Check the pending dreams tab.
                </p>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Vaults Tab */}
      {activeTab === 'vaults' && (
        <div className="space-y-6">
          {loadingVaults ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : vaults.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {vaults.map((vault) => (
                <div key={vault.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-3">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {vault.dreamTitle || 'Vault for Dream'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        Goal: {mistToSui(vault.dreamGoalAmount || 0).toFixed(2)} SUI
                      </p>
                      {vault.dreamDescription && (
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {vault.dreamDescription}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {vault.dreamId && vault.dreamId !== 'unknown' ? (
                          vault.dreamId.length > 20 ? `${vault.dreamId.slice(0, 8)}...${vault.dreamId.slice(-6)}` : vault.dreamId
                        ) : 'Loading...'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vault.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vault.isActive ? 'Active' : 'Released'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Match Amount:</span>
                      <span className="font-medium">{mistToSui(vault.matchAmount).toFixed(2)} SUI</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min Months:</span>
                      <span className="font-medium">{vault.minMonths}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fulfilled Months:</span>
                      <span className="font-medium">{vault.fulfilledMonths}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {vault.minMonths > 0 ? Math.min((vault.fulfilledMonths / vault.minMonths) * 100, 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${vault.minMonths > 0 ? Math.min((vault.fulfilledMonths / vault.minMonths) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {vault.isActive && vault.fulfilledMonths < vault.minMonths && (
                      <button
                        onClick={() => handleRecordContribution(vault.id, vault.dreamId)}
                        className="btn-secondary flex-1 py-2 text-sm"
                        disabled={vault.dreamId === 'unknown'}
                      >
                        Record Month
                      </button>
                    )}
                    {vault.isActive && vault.fulfilledMonths >= vault.minMonths && (
                      <button
                        onClick={() => handleReleaseMatch(vault.id, vault.dreamId)}
                        className="btn-primary flex-1 py-2 text-sm"
                        disabled={vault.dreamId === 'unknown'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Release Match
                      </button>
                    )}
                    {!vault.isActive && (
                      <div className="flex-1 text-center text-sm text-gray-500 py-2">
                        Match Released
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="card p-8 max-w-md mx-auto">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Vaults Created
                </h3>
                <p className="text-gray-600">
                  Vaults are created automatically when you approve dreams. Check the pending dreams tab to approve dreams and create vaults.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NGODashboard 