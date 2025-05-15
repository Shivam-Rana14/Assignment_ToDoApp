const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const Todo = require('../models/Todo');

// Validation middleware
const todoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('category')
    .isIn(['Urgent', 'Non-Urgent'])
    .withMessage('Category must be either Urgent or Non-Urgent')
];

// Create Todo (Protected: authenticated users only)
router.post('/', auth, todoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const todo = new Todo({
      ...req.body,
      user: req.user.id
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo' });
  }
});

// Get all todos (Protected: different behavior for admin and user)
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    const todos = await Todo.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// Get single todo (Protected: check ownership or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate('user', 'username email');
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user has permission to view
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todo' });
  }
});

// Update todo (Protected: check ownership or admin)
router.put('/:id', auth, todoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user has permission to edit
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(todo, req.body);
    await todo.save();
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo' });
  }
});

// Delete todo (Protected: check ownership or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await todo.deleteOne();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

module.exports = router;
