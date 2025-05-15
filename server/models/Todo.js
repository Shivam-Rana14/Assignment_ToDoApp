const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  dueDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['Urgent', 'Non-Urgent'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
todoSchema.index({ user: 1, createdAt: -1 }); // For user's todos list with sorting
todoSchema.index({ dueDate: 1 }); // For due date queries
todoSchema.index({ category: 1 }); // For category filtering
todoSchema.index({ completed: 1 }); // For completed/incomplete filtering

// Compound indexes for common query patterns
todoSchema.index({ user: 1, category: 1, completed: 1 }); // For filtered user queries
todoSchema.index({ dueDate: 1, completed: 1 }); // For due date filtering with completion status

// Add methods for common operations
todoSchema.statics.findUserTodos = function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.category) query.category = filters.category;
  if (filters.completed !== undefined) query.completed = filters.completed;
  if (filters.dueBefore) query.dueDate = { $lte: filters.dueBefore };
  if (filters.dueAfter) query.dueDate = { ...query.dueDate, $gte: filters.dueAfter };

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'username email');
};

// Virtual for checking if todo is overdue
todoSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && !this.completed;
});

module.exports = mongoose.model('Todo', todoSchema);
