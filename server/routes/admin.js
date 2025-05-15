const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const Todo = require('../models/Todo');

// Protect all admin routes
router.use(auth, checkRole(['admin']));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user.id && role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin cannot demote themselves' 
      });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalTodos, userStats, todoStats] = await Promise.all([
      User.countDocuments(),
      Todo.countDocuments(),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Todo.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalUsers,
      totalTodos,
      usersByRole: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      todosByCategory: todoStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get all todos with user details
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

module.exports = router;
