import express from 'express';
import database from '../services/database.js';
import { releaseVaultMatch } from '../services/vaultProcessor.js';

const router = express.Router();

// Get all vaults
router.get('/', async (req, res) => {
  try {
    const { ngo, dreamId, status } = req.query;
    let vaults = await database.getVaults();

    // Filter by NGO
    if (ngo) {
      vaults = vaults.filter(v => v.ngo === ngo);
    }

    // Filter by dream ID
    if (dreamId) {
      vaults = vaults.filter(v => v.dreamId === dreamId);
    }

    // Filter by status
    if (status) {
      switch (status) {
        case 'active':
          vaults = vaults.filter(v => v.isActive);
          break;
        case 'released':
          vaults = vaults.filter(v => !v.isActive);
          break;
        case 'eligible':
          vaults = vaults.filter(v => v.isActive && v.contributedAmount >= v.minAmount);
          break;
      }
    }

    res.json({
      success: true,
      data: vaults,
      count: vaults.length
    });
  } catch (error) {
    console.error('Error fetching vaults:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vaults'
    });
  }
});

// Get vault by ID
router.get('/:id', async (req, res) => {
  try {
    const vault = await database.getVaultById(req.params.id);
    
    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found'
      });
    }

    // Get associated dream
    const dream = await database.getDreamById(vault.dreamId);

    res.json({
      success: true,
      data: {
        ...vault,
        dream
      }
    });
  } catch (error) {
    console.error('Error fetching vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vault'
    });
  }
});

// Create new vault
router.post('/', async (req, res) => {
  try {
    const { dreamId, ngo, matchAmount, minAmount, transactionHash } = req.body;

    if (!dreamId || !ngo || !matchAmount || !minAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify dream exists and is approved
    const dream = await database.getDreamById(dreamId);
    if (!dream) {
      return res.status(404).json({
        success: false,
        error: 'Dream not found'
      });
    }

    if (!dream.isApproved) {
      return res.status(400).json({
        success: false,
        error: 'Dream is not approved'
      });
    }

    const vault = await database.addVault({
      dreamId,
      ngo,
      matchAmount: parseInt(matchAmount),
      minAmount: parseInt(minAmount),
      contributedAmount: 0,
      isActive: true,
      transactionHash
    });

    res.status(201).json({
      success: true,
      data: vault
    });
  } catch (error) {
    console.error('Error creating vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create vault'
    });
  }
});

// Update vault (record monthly contribution)
router.patch('/:id/contribution', async (req, res) => {
  try {
    const vault = await database.getVaultById(req.params.id);
    
    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found'
      });
    }

    if (!vault.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Vault is not active'
      });
    }

    const newContributedAmount = vault.contributedAmount + 1;
    
    const updatedVault = await database.updateVault(req.params.id, {
      contributedAmount: newContributedAmount
    });

    res.json({
      success: true,
      data: updatedVault,
      eligible: newContributedAmount >= vault.minAmount
    });
  } catch (error) {
    console.error('Error updating vault contribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update vault contribution'
    });
  }
});

// Release vault match
router.post('/:id/release', async (req, res) => {
  try {
    const vault = await database.getVaultById(req.params.id);
    
    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found'
      });
    }

    if (!vault.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Vault is already released'
      });
    }

    if (vault.contributedAmount < vault.minAmount) {
      return res.status(400).json({
        success: false,
        error: 'Vault requirements not met'
      });
    }

    const result = await releaseVaultMatch(vault);
    
    if (result) {
      res.json({
        success: true,
        message: 'Vault match released successfully',
        transactionHash: result.digest
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to release vault match'
      });
    }
  } catch (error) {
    console.error('Error releasing vault match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to release vault match'
    });
  }
});

// Get vault statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const vaults = await database.getVaults();
    
    const stats = {
      totalVaults: vaults.length,
      activeVaults: vaults.filter(v => v.isActive).length,
      releasedVaults: vaults.filter(v => !v.isActive).length,
      eligibleVaults: vaults.filter(v => v.isActive && v.contributedAmount >= v.minAmount).length,
      totalMatchAmount: vaults.reduce((sum, v) => sum + v.matchAmount, 0),
      releasedMatchAmount: vaults.filter(v => !v.isActive).reduce((sum, v) => sum + v.matchAmount, 0),
      uniqueNGOs: new Set(vaults.map(v => v.ngo)).size
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching vault stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vault statistics'
    });
  }
});

export default router;