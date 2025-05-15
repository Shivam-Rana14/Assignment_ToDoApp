import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useTodo } from '../contexts/TodoContext';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateEditTodo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createTodo, updateTodo, todos } = useTodo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: 'Non-Urgent',
    completed: false
  });

  useEffect(() => {
    if (id) {
      const todo = todos.find(t => t._id === id);
      if (todo) {
        setFormData({
          title: todo.title,
          description: todo.description || '',
          dueDate: todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd') : '',
          category: todo.category,
          completed: todo.completed
        });
      }
    }
  }, [id, todos]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      const todoData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      };

      if (id) {
        await updateTodo(id, todoData);
      } else {
        await createTodo(todoData);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Todo' : 'Create New Todo'}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={100}
        />

        <div className="mb-4">
          <label className="label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input h-32"
            maxLength={500}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />

        <div className="mb-4">
          <label className="label">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            <option value="Non-Urgent">Non-Urgent</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="completed"
            id="completed"
            checked={formData.completed}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
            Mark as completed
          </label>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : (id ? 'Update Todo' : 'Create Todo')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditTodo;
