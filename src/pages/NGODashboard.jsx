import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Building, Plus, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { createNGOVault, recordMonthlyContribution, releaseMatch, getUserVaults, mistToSui } from '../utils/blockchain'
import { isPackageConfigured } from '../constants/contracts'
import toast from 'react-hot-toast'

const NGODashboard = () => {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [activeTab, setActiveTab] = useState('create') // create, vaults
  const [formData, setFormData] = useState({
    dreamId: '',
    matchAmount: '',
    minMonths: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [vaults, setVaults] = useState([])
  const [loadingVaults, setLoadingVaults] = useState(false)

  useEffect(() => {
    if (currentAccount && isPackageConfigured()) {
      loadVaults()
    }
  }, [currentAccount, activeTab])

  const loadVaults = async () => {
    setLoadingVaults(true)
    try {
      const vaultObjects = await getUserVaults(currentAccount.address)
      console.log('Raw vault objects:', vaultObjects) // Debug log
      
      // Transform blockchain objects to our vault format
      const transformedVaults = vaultObjects.map(obj => {
        const fields = obj.data?.content?.fields || {}
        console.log('Vault fields:', fields) // Debug log
        
        return {
          id: obj.data?.objectId,
          dreamId: fields.dreamID || 'unknown', // Note: dreamID is the correct field name
          matchAmount: parseInt(fields.matchAmount || '0'),
          minMonths: parseInt(fields.minMonths || '0'),
          fulfilledMonths: parseInt(fields.fulfilledMonths || '0'),
          isActive: fields.isActive !== undefined ? fields.isActive : true,
          ngo: fields.ngo || currentAccount.address,
          createdAt: new Date().toISOString(),
        }
      })
      
      console.log('Transformed vaults:', transformedVaults) // Debug log
      setVaults(transformedVaults)
    } catch (error) {
      console.error('Error loading vaults:', error)
      toast.error('Failed to load vaults')
    } finally {
      setLoadingVaults(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateVault = async (e) => {
    e.preventDefault()
    
    if (!currentAccount) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isPackageConfigured()) {
      toast.error('Smart contract not deployed')
      return
    }

    if (!formData.dreamId || !formData.matchAmount || !formData.minMonths) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      await createNGOVault(
        signAndExecute,
        formData.dreamId,
        parseFloat(formData.matchAmount),
        parseInt(formData.minMonths)
      )
      
      // Reset form
      setFormData({
        dreamId: '',
        matchAmount: '',
        minMonths: '',
      })
      
      // Switch to vaults tab and reload vaults
      setActiveTab('vaults')
      await loadVaults()
      
      toast.success('Vault created successfully!')
    } catch (error) {
      console.error('Error creating vault:', error)
      toast.error('Failed to create vault: ' + error.message)
    } finally {
      setIsLoading(false)
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
      await loadVaults() // Reload vaults after recording contribution
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
      await loadVaults() // Reload vaults after releasing match
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
          NGO Dashboard
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          NGO Partner Dashboard
        </h1>
        <p className="text-white/80">
          Create matching vaults and support dreams in your community
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-gray-800'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Create Vault
          </button>
          <button
            onClick={() => setActiveTab('vaults')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'vaults'
                ? 'bg-white text-gray-800'
                : 'text-white/80 hover:text-white'
            }`}
          >
            My Vaults ({vaults.length})
          </button>
        </div>
      </div>

      {/* Create Vault Tab */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Create Matching Vault
            </h2>
            
            <form onSubmit={handleCreateVault} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Dream ID *
                </label>
                <input
                  type="text"
                  name="dreamId"
                  value={formData.dreamId}
                  onChange={handleInputChange}
                  placeholder="Enter the dream ID you want to support"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can find dream IDs on the dreams page
                </p>
              </div>

              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Match Amount (SUI) *
                </label>
                <input
                  type="number"
                  name="matchAmount"
                  value={formData.matchAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Amount you will contribute when requirements are met
                </p>
              </div>

              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Minimum Months *
                </label>
                <input
                  type="number"
                  name="minMonths"
                  value={formData.minMonths}
                  onChange={handleInputChange}
                  placeholder="e.g., 6"
                  min="1"
                  max="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of months the dream owner must contribute before match is released
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Vault...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Vault
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">How matching vaults work</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create a vault with matching funds for a specific dream</li>
                <li>• Set minimum months the dream owner must contribute</li>
                <li>• Once requirements are met, your matching funds are released</li>
                <li>• Help amplify the impact of community savings</li>
              </ul>
            </div>
          </div>
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Vault for Dream
                      </h3>
                      <p className="text-sm text-gray-500">
                        Dream ID: {vault.dreamId && vault.dreamId !== 'unknown' ? (
                          vault.dreamId.length > 20 ? `${vault.dreamId.slice(0, 10)}...${vault.dreamId.slice(-4)}` : vault.dreamId
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
                <p className="text-gray-600 mb-6">
                  Start supporting dreams by creating your first matching vault
                </p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Vault
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NGODashboard 