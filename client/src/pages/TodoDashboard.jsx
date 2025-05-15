import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTodo } from '../contexts/TodoContext';
import { useAuth } from '../contexts/AuthContext';
import TodoCard from '../components/TodoCard';
import Button from '../components/Button';

const TodoDashboard = () => {
  const { todos, loading, error, fetchTodos } = useTodo();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState({
    category: '',
    completed: ''
  });
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    fetchTodos(isAdminView);
  }, [isAdminView]);

  const filteredTodos = todos.filter(todo => {
    if (filter.category && todo.category !== filter.category) return false;
    if (filter.completed === 'completed' && !todo.completed) return false;
    if (filter.completed === 'pending' && todo.completed) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdminView ? 'All Todos' : 'My Todos'}
        </h1>
        <div className="space-x-4">
          {isAdmin && (
            <Button
              variant="secondary"
              onClick={() => setIsAdminView(!isAdminView)}
            >
              {isAdminView ? 'View My Todos' : 'View All Todos'}
            </Button>
          )}
          <Link to="/todos/create">
            <Button>Create New Todo</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          className="input"
          value={filter.category}
          onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          <option value="Urgent">Urgent</option>
          <option value="Non-Urgent">Non-Urgent</option>
        </select>

        <select
          className="input"
          value={filter.completed}
          onChange={(e) => setFilter(prev => ({ ...prev, completed: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center">Loading todos...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTodos.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No todos found. Create one to get started!
            </div>
          ) : (
            filteredTodos.map(todo => (
              <TodoCard key={todo._id} todo={todo} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TodoDashboard;
