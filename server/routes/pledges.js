import express from 'express';
import database from '../services/database.js';

const router = express.Router();

// Get all pledges
router.get('/', async (req, res) => {
  try {
    const { dreamId, pledger } = req.query;
    let pledges = await database.getPledges();

    // Filter by dream ID
    if (dreamId) {
      pledges = pledges.filter(p => p.dreamId === dreamId);
    }

    // Filter by pledger
    if (pledger) {
      pledges = pledges.filter(p => p.pledger === pledger);
    }

    res.json({
      success: true,
      data: pledges,
      count: pledges.length
    });
  } catch (error) {
    console.error('Error fetching pledges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pledges'
    });
  }
});

// Get pledges for a specific dream
router.get('/dream/:dreamId', async (req, res) => {
  try {
    const pledges = await database.getPledgesByDream(req.params.dreamId);
    
    // Calculate total pledged amount
    const totalAmount = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
    
    res.json({
      success: true,
      data: {
        pledges,
        totalAmount,
        count: pledges.length
      }
    });
  } catch (error) {
    console.error('Error fetching dream pledges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dream pledges'
    });
  }
});

// Create new pledge
router.post('/', async (req, res) => {
  try {
    const { dreamId, pledger, amount, transactionHash } = req.body;

    if (!dreamId || !pledger || !amount || !transactionHash) {
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
        error: 'Dream is not approved for pledging'
      });
    }

    if (dream.isComplete) {
      return res.status(400).json({
        success: false,
        error: 'Dream is already completed'
      });
    }

    const pledge = await database.addPledge({
      dreamId,
      pledger,
      amount: parseInt(amount),
      transactionHash,
      status: 'confirmed'
    });

    // Update dream saved amount
    const newSavedAmount = dream.savedAmount + parseInt(amount);
    const isComplete = newSavedAmount >= dream.goalAmount;
    
    await database.updateDream(dreamId, {
      savedAmount: newSavedAmount,
      isComplete,
      ...(isComplete && { completedAt: new Date().toISOString() })
    });

    res.status(201).json({
      success: true,
      data: pledge
    });
  } catch (error) {
    console.error('Error creating pledge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create pledge'
    });
  }
});

// Get pledge statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const pledges = await database.getPledges();
    
    const stats = {
      totalPledges: pledges.length,
      totalAmount: pledges.reduce((sum, p) => sum + p.amount, 0),
      uniquePledgers: new Set(pledges.map(p => p.pledger)).size,
      averagePledge: pledges.length > 0 ? pledges.reduce((sum, p) => sum + p.amount, 0) / pledges.length : 0,
      recentPledges: pledges
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching pledge stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pledge statistics'
    });
  }
});

export default router;