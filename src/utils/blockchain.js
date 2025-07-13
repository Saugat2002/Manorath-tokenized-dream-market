import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { CONTRACTS, MIST_PER_SUI } from '../constants/contracts'
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

// Get all dream NFTs from the blockchain
export const getAllDreams = async () => {
  try {
    const response = await suiClient.queryObjects({
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::DreamNFT::DreamNFT`
      },
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching all dreams:', error)
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

// Get all NGO vaults from the blockchain
export const getAllNGOVaults = async () => {
  try {
    const response = await suiClient.queryObjects({
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::NGOVault::NGOVault`
      },
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching all NGO vaults:', error)
    return []
  }
}

// Mint a new dream NFT
export const mintDream = async (signAndExecute, title, goalAmount) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::mintDream`,
      arguments: [
        tx.pure.string(title),
        tx.pure.u64(suiToMist(goalAmount)),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Dream NFT minted successfully!')
    return result
  } catch (error) {
    console.error('Error minting dream:', error)
    toast.error('Failed to mint dream: ' + error.message)
    throw error
  }
}

// Pledge to a dream
export const pledgeToDream = async (signAndExecute, dreamId, amount) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::DreamNFT::pledgeToDream`,
      arguments: [
        tx.object(dreamId),
        tx.pure.u64(suiToMist(amount)),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('Pledge successful!')
    return result
  } catch (error) {
    console.error('Error pledging to dream:', error)
    toast.error('Failed to pledge: ' + error.message)
    throw error
  }
}

// Create NGO vault
export const createNGOVault = async (signAndExecute, dreamId, matchAmount, minMonths) => {
  try {
    const tx = new Transaction()
    
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::NGOVault::createVault`,
      arguments: [
        tx.object(CONTRACTS.ADMIN_CAP_ID),
        tx.pure.id(dreamId),
        tx.pure.u64(suiToMist(matchAmount)),
        tx.pure.u8(minMonths),
      ],
    })

    const result = await signAndExecute({
      transaction: tx,
    })

    toast.success('NGO Vault created successfully!')
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

// Release match from NGO vault
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

// Get all dreams created by a user
export const getUserDreams = async (address) => {
  try {
    const objects = await getOwnedObjects(address)
    return filterDreamNFTs(objects)
  } catch (error) {
    console.error('Error fetching user dreams:', error)
    return []
  }
}

// Get all NGO vaults created by a user
export const getUserVaults = async (address) => {
  try {
    const objects = await getOwnedObjects(address)
    return filterNGOVaults(objects)
  } catch (error) {
    console.error('Error fetching user vaults:', error)
    return []
  }
}

export { suiClient } 