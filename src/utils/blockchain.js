import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { CONTRACTS, MIST_PER_SUI } from '../constants/contracts.js'
import toast from 'react-hot-toast'

// Initialize Sui client for testnet
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
})

// Convert SUI to MIST
export const suiToMist = (sui) => {
  return Math.floor(sui * MIST_PER_SUI)
}

// Convert MIST to SUI
export const mistToSui = (mist) => {
  return mist / MIST_PER_SUI
}

// Get all dream NFTs from the blockchain using events
export const getAllDreams = async () => {
  try {
    // Use events to find all dreams
    const response = await fetch(getFullnodeUrl('testnet'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_queryEvents',
        params: [
          {
            MoveModule: {
              package: CONTRACTS.PACKAGE_ID,
              module: 'DreamNFT'
            }
          },
          null, // cursor
          100,  // limit
          false // descending order
        ]
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      console.error('Events query failed:', data.error)
      return []
    }
    
    // Extract dream IDs from MintedNFT events
    const dreamIds = data.result?.data
      ?.filter(event => event.type.includes('MintedNFT'))
      ?.map(event => event.parsedJson?.dreamID)
      ?.filter(id => id) || []
    
    if (dreamIds.length === 0) {
      return []
    }
    
    // Get full object details for all dreams
    const dreams = await suiClient.multiGetObjects({
      ids: dreamIds,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      }
    })
    
    return dreams.filter(dream => dream.data).map(dream => ({
      ...dream,
      data: {
        ...dream.data,
        // Add additional metadata if needed
        isShared: dream.data.owner === 'Shared'
      }
    }))
  } catch (error) {
    console.error('Error fetching dreams:', error)
    return []
  }
}

// Get all completed dreams from the blockchain
export const getAllCompletedDreams = async () => {
  try {
    const allDreams = await getAllDreams()
    return allDreams.filter(obj => obj.data?.content?.fields?.isComplete === true)
  } catch (error) {
    console.error('Error fetching completed dreams:', error)
    return []
  }
}

// Get all pending dreams (not approved yet)
export const getPendingDreams = async () => {
  try {
    const allDreams = await getAllDreams()
    return allDreams.filter(obj => 
      obj.data?.content?.fields?.isApproved === false && 
      obj.data?.content?.fields?.isComplete === false
    )
  } catch (error) {
    console.error('Error fetching pending dreams:', error)
    return []
  }
}

// Get all approved dreams (with vaults - ready for pledging)
export const getApprovedDreams = async () => {
  try {
    const allDreams = await getAllDreams()
    return allDreams.filter(obj => 
      obj.data?.content?.fields?.isApproved === true && 
      obj.data?.content?.fields?.hasVault === true
    )
  } catch (error) {
    console.error('Error fetching approved dreams:', error)
    return []
  }
}

// Get all dreams that are approved but don't have vaults yet
export const getApprovedDreamsWithoutVault = async () => {
  try {
    const allDreams = await getAllDreams()
    return allDreams.filter(obj => 
      obj.data?.content?.fields?.isApproved === true && 
      obj.data?.content?.fields?.hasVault === false
    )
  } catch (error) {
    console.error('Error fetching approved dreams without vault:', error)
    return []
  }
}

// Get all NGO vaults from the blockchain
export const getAllNGOVaults = async () => {
  try {
    // Use events to find NGO vaults
    const response = await fetch(getFullnodeUrl('testnet'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_queryEvents',
        params: [
          {
            MoveModule: {
              package: CONTRACTS.PACKAGE_ID,
              module: 'NGOVault'
            }
          },
          null, // cursor
          100,  // limit
          false // descending order
        ]
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      console.error('NGO Vault events query failed:', data.error)
      return []
    }
    
    // Extract vault IDs from VaultCreated events
    const vaultIds = new Set()
    
    if (data.result && data.result.data) {
      for (const event of data.result.data) {
        if (event.type && event.type.includes('VaultCreated')) {
          // Extract vault ID from the event
          const vaultId = event.parsedJson?.id
          if (vaultId) {
            vaultIds.add(vaultId)
          }
        }
      }
    }
    
    if (vaultIds.size === 0) {
      return []
    }
    
    // Get detailed object data for each vault
    const detailedObjects = await suiClient.multiGetObjects({
      ids: Array.from(vaultIds),
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      }
    })
    
    // Filter out any null/error responses
    return detailedObjects.filter(obj => obj.data && !obj.error)
    
  } catch (error) {
    console.error('Error fetching all NGO vaults:', error)
    return []
  }
}

// Mint a new dream NFT
export const mintDream = async (signAndExecute, title, goalAmount, description) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::mintDream`,
      arguments: [
        tx.pure.string(title),
        tx.pure.u64(suiToMist(goalAmount)),
        tx.pure.string(description),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Dream NFT minted successfully! Waiting for NGO approval.')
    return result
  } catch (error) {
    console.error('Error minting dream:', error)
    toast.error('Failed to mint dream: ' + error.message)
    throw error
  }
}

// Admin function to approve a dream
export const approveDream = async (signAndExecute, dreamId) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::approveDream`,
      arguments: [
        tx.object(CONTRACTS.ADMIN_CAP_ID),
        tx.object(dreamId),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Dream approved successfully!')
    return result
  } catch (error) {
    console.error('Error approving dream:', error)
    toast.error('Failed to approve dream: ' + error.message)
    throw error
  }
}

// Admin function to reject a dream
export const rejectDream = async (signAndExecute, dreamId) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::rejectDream`,
      arguments: [
        tx.object(CONTRACTS.ADMIN_CAP_ID),
        tx.object(dreamId),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Dream rejected successfully!')
    return result
  } catch (error) {
    console.error('Error rejecting dream:', error)
    toast.error('Failed to reject dream: ' + error.message)
    throw error
  }
}

// Pledge to a dream (only approved dreams)
export const pledgeToDream = async (signAndExecute, dreamId, amount) => {
  try {
    const tx = new Transaction()
    
    // Split coins to get the exact amount to pledge
    const [pledgeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiToMist(amount))])
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::pledgeToDream`,
      arguments: [
        tx.object(dreamId),
        pledgeCoin,
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Pledge successful! Real SUI tokens transferred.')
    return result
  } catch (error) {
    console.error('Error pledging to dream:', error)
    if (error.message.includes('1')) {
      toast.error('This dream is not approved for pledging yet.')
    } else if (error.message.includes('2')) {
      toast.error('This dream needs a vault before pledging is allowed.')
    } else {
      toast.error('Failed to pledge: ' + error.message)
    }
    throw error
  }
}

// Create NGO vault (admin only) - now also approves the dream
export const createNGOVault = async (signAndExecute, dreamId, matchAmount, minMonths) => {
  try {
    const tx = new Transaction()
    
    // Split coins to get the exact match amount to deposit
    const [matchCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiToMist(matchAmount))])
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::NGOVault::createVault`,
      arguments: [
        tx.object(CONTRACTS.ADMIN_CAP_ID),
        tx.object(dreamId),
        tx.pure.u64(suiToMist(matchAmount)),
        tx.pure.u8(minMonths),
        matchCoin,
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Dream approved and vault created with real SUI deposit!')
    return result
  } catch (error) {
    console.error('Error creating NGO vault:', error)
    toast.error('Failed to create vault: ' + error.message)
    throw error
  }
}

// Record monthly contribution
export const recordMonthlyContribution = async (signAndExecute, vaultId, dreamId) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::NGOVault::recordMonthlyContribution`,
      arguments: [
        tx.object(vaultId),
        tx.object(dreamId),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Monthly contribution recorded!')
    return result
  } catch (error) {
    console.error('Error recording contribution:', error)
    toast.error('Failed to record contribution: ' + error.message)
    throw error
  }
}

// Release match from NGO vault (admin only)
export const releaseMatch = async (signAndExecute, vaultId, dreamId) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::NGOVault::releaseMatch`,
      arguments: [
        tx.object(CONTRACTS.ADMIN_CAP_ID),
        tx.object(vaultId),
        tx.object(dreamId),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Match released successfully!')
    return result
  } catch (error) {
    console.error('Error releasing match:', error)
    toast.error('Failed to release match: ' + error.message)
    throw error
  }
}

// Release all funds to dream owner (dream owner only)
export const releaseFunds = async (signAndExecute, dreamId) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::releaseFunds`,
      arguments: [
        tx.object(dreamId),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('All funds released to your wallet!')
    return result
  } catch (error) {
    console.error('Error releasing funds:', error)
    if (error.message.includes('0')) {
      toast.error('Only completed dreams can release funds.')
    } else if (error.message.includes('1')) {
      toast.error('Only the dream owner can release funds.')
    } else {
      toast.error('Failed to release funds: ' + error.message)
    }
    throw error
  }
}

// Get owned objects by address
export const getOwnedObjects = async (address) => {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      },
    })
    return objects.data
  } catch (error) {
    console.error('Error fetching owned objects:', error)
    return []
  }
}

// Get object details
export const getObjectDetails = async (objectId) => {
  try {
    const object = await suiClient.getObject({
      id: objectId,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      },
    })
    return object
  } catch (error) {
    console.error('Error fetching object details:', error)
    return null
  }
}

// Helper function to filter dream NFTs from owned objects
export const filterDreamNFTs = (objects) => {
  return objects.filter(obj => 
    obj.data?.type?.includes('DreamNFT') || 
    obj.data?.type?.includes(`${CONTRACTS.PACKAGE_ID}::DreamNFT::DreamNFT`)
  )
}

// Helper function to filter NGO vaults from owned objects
export const filterNGOVaults = (objects) => {
  return objects.filter(obj => 
    obj.data?.type?.includes('NGOVault') || 
    obj.data?.type?.includes(`${CONTRACTS.PACKAGE_ID}::NGOVault::NGOVault`)
  )
}

// Get all dreams created by a user (dreams are shared objects, so we filter by owner field)
export const getUserDreams = async (address) => {
  try {
    const allDreams = await getAllDreams()
    return allDreams.filter(obj => obj.data?.content?.fields?.owner === address)
  } catch (error) {
    console.error('Error fetching user dreams:', error)
    return []
  }
}

// Get all NGO vaults created by a user (vaults are shared objects, so we filter by ngo field)
export const getUserVaults = async (address) => {
  try {
    const allVaults = await getAllNGOVaults()
    return allVaults.filter(obj => obj.data?.content?.fields?.ngo === address)
  } catch (error) {
    console.error('Error fetching user vaults:', error)
    return []
  }
}

export { suiClient } 