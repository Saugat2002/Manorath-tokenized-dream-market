import { suiClient, adminKeypair, CONTRACT_CONFIG } from '../config/sui.js';
import { Transaction } from '@mysten/sui/transactions';
import database from './database.js';

export async function processVaultEligibility(dreamId) {
  if (!adminKeypair) {
    console.warn('Admin keypair not configured, cannot process vault eligibility');
    return;
  }

  try {
    const vaults = await database.getVaults();
    const eligibleVaults = vaults.filter(vault => 
      vault.dreamId === dreamId && 
      vault.isActive && 
      vault.contributedAmount >= vault.minAmount
    );

    for (const vault of eligibleVaults) {
      await releaseVaultMatch(vault);
    }
  } catch (error) {
    console.error('Error processing vault eligibility:', error);
  }
}

export async function releaseVaultMatch(vault) {
  if (!adminKeypair || !CONTRACT_CONFIG.PACKAGE_ID) {
    console.warn('Configuration missing for vault match release');
    return;
  }

  try {
    console.log(`Attempting to release match for vault: ${vault.id}`);

    const tx = new Transaction();
    
    // Call the release_match function
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::NGOVault::release_match`,
      arguments: [
        tx.object(vault.id),
        tx.object(vault.dreamId)
      ]
    });

    // Execute transaction
    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: adminKeypair,
      options: {
        showEffects: true,
        showEvents: true,
      }
    });

    if (result.effects?.status?.status === 'success') {
      console.log(`Successfully released match for vault ${vault.id}`);
      
      // Update vault status in database
      await database.updateVault(vault.id, {
        isActive: false,
        releasedAt: new Date().toISOString(),
        releaseTransactionHash: result.digest
      });

      // Update dream with match amount
      const dream = await database.getDreamById(vault.dreamId);
      if (dream) {
        await database.updateDream(vault.dreamId, {
          savedAmount: dream.savedAmount + vault.matchAmount
        });
      }

      return result;
    } else {
      console.error('Transaction failed:', result.effects?.status);
      return null;
    }
  } catch (error) {
    console.error(`Error releasing match for vault ${vault.id}:`, error);
    return null;
  }
}

export async function checkAllVaultEligibility() {
  console.log('Checking all vault eligibility...');
  
  try {
    const vaults = await database.getVaults();
    const activeVaults = vaults.filter(vault => vault.isActive);

    for (const vault of activeVaults) {
      if (vault.contributedAmount >= vault.minAmount) {
        await releaseVaultMatch(vault);
      }
    }
  } catch (error) {
    console.error('Error checking vault eligibility:', error);
  }
}