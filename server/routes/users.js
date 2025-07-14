import express from 'express';
import database from '../services/database.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let users = await database.getUsers();

    // Filter by role
    if (role) {
      users = users.filter(u => u.role === role);
    }

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get user by address
router.get('/:address', async (req, res) => {
  try {
    const user = await database.getUserByAddress(req.params.address);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's dreams and pledges
    const dreams = await database.getDreams();
    const pledges = await database.getPledges();
    const vaults = await database.getVaults();

    const userDreams = dreams.filter(d => d.owner === req.params.address);
    const userPledges = pledges.filter(p => p.pledger === req.params.address);
    const userVaults = vaults.filter(v => v.ngo === req.params.address);

    res.json({
      success: true,
      data: {
        ...user,
        dreams: userDreams,
        pledges: userPledges,
        vaults: userVaults,
        stats: {
          totalDreams: userDreams.length,
          completedDreams: userDreams.filter(d => d.isComplete).length,
          totalPledged: userPledges.reduce((sum, p) => sum + p.amount, 0),
          totalReceived: userDreams.reduce((sum, d) => sum + d.savedAmount, 0),
          totalVaults: userVaults.length,
          activeVaults: userVaults.filter(v => v.isActive).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Create or update user profile
router.post('/', async (req, res) => {
  try {
    const { address, name, country, role } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    // Check if user already exists
    const existingUser = await database.getUserByAddress(address);
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await database.updateUser(address, {
        name: name || existingUser.name,
        country: country || existingUser.country,
        role: role || existingUser.role
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User profile updated'
      });
    } else {
      // Create new user
      const users = await database.getUsers();
      const newUser = {
        address,
        name: name || 'Anonymous',
        country: country || 'Unknown',
        role: role || 'user',
        joinedAt: new Date().toISOString(),
        totalDreams: 0,
        totalPledged: 0,
        totalReceived: 0,
        isVerified: role === 'ngo' ? false : true
      };

      users.push(newUser);
      await database.writeFile('users.json', users);

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User profile created'
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update user'
    });
  }
});

// Update user profile
router.patch('/:address', async (req, res) => {
  try {
    const updates = req.body;
    const user = await database.updateUser(req.params.address, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const users = await database.getUsers();
    
    const stats = {
      totalUsers: users.length,
      regularUsers: users.filter(u => u.role === 'user').length,
      ngos: users.filter(u => u.role === 'ngo').length,
      verifiedNGOs: users.filter(u => u.role === 'ngo' && u.isVerified).length,
      recentUsers: users
        .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
        .slice(0, 10)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

export default router;