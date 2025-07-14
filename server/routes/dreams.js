import express from 'express';
import database from '../services/database.js';

const router = express.Router();

// Get all dreams
router.get('/', async (req, res) => {
  try {
    const { status, owner, category } = req.query;
    let dreams = await database.getDreams();

    // Filter by status
    if (status) {
      switch (status) {
        case 'pending':
          dreams = dreams.filter(d => !d.isApproved && !d.isComplete);
          break;
        case 'approved':
          dreams = dreams.filter(d => d.isApproved && !d.isComplete);
          break;
        case 'completed':
          dreams = dreams.filter(d => d.isComplete);
          break;
        case 'active':
          dreams = dreams.filter(d => d.isApproved && !d.isComplete);
          break;
      }
    }

    // Filter by owner
    if (owner) {
      dreams = dreams.filter(d => d.owner === owner);
    }

    // Filter by category
    if (category) {
      dreams = dreams.filter(d => d.category === category);
    }

    res.json({
      success: true,
      data: dreams,
      count: dreams.length
    });
  } catch (error) {
    console.error('Error fetching dreams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dreams'
    });
  }
});

// Get dream by ID
router.get('/:id', async (req, res) => {
  try {
    const dream = await database.getDreamById(req.params.id);
    
    if (!dream) {
      return res.status(404).json({
        success: false,
        error: 'Dream not found'
      });
    }

    // Get pledges for this dream
    const pledges = await database.getPledgesByDream(req.params.id);

    res.json({
      success: true,
      data: {
        ...dream,
        pledges
      }
    });
  } catch (error) {
    console.error('Error fetching dream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dream'
    });
  }
});

// Create new dream
router.post('/', async (req, res) => {
  try {
    const { title, description, goalAmount, category, owner } = req.body;

    if (!title || !description || !goalAmount || !owner) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const dream = await database.addDream({
      title,
      description,
      goalAmount: parseInt(goalAmount),
      category: category || 'general',
      owner,
      savedAmount: 0,
      isComplete: false,
      isApproved: false
    });

    res.status(201).json({
      success: true,
      data: dream
    });
  } catch (error) {
    console.error('Error creating dream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dream'
    });
  }
});

// Update dream (approve/reject)
router.patch('/:id', async (req, res) => {
  try {
    const { isApproved, isComplete, savedAmount } = req.body;
    const updates = {};

    if (typeof isApproved === 'boolean') {
      updates.isApproved = isApproved;
      if (isApproved) {
        updates.approvedAt = new Date().toISOString();
      }
    }

    if (typeof isComplete === 'boolean') {
      updates.isComplete = isComplete;
      if (isComplete) {
        updates.completedAt = new Date().toISOString();
      }
    }

    if (typeof savedAmount === 'number') {
      updates.savedAmount = savedAmount;
    }

    const dream = await database.updateDream(req.params.id, updates);

    if (!dream) {
      return res.status(404).json({
        success: false,
        error: 'Dream not found'
      });
    }

    res.json({
      success: true,
      data: dream
    });
  } catch (error) {
    console.error('Error updating dream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dream'
    });
  }
});

// Get dream statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await database.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dream stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;