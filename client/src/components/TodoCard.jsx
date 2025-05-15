import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useTodo } from '../contexts/TodoContext';
import { useAuth } from '../contexts/AuthContext';

const TodoCard = ({ todo }) => {
  const navigate = useNavigate();
  const { deleteTodo } = useTodo();
  const { user } = useAuth();

  const handleEdit = () => {
    navigate(`/todos/edit/${todo._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await deleteTodo(todo._id);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {todo.title}
          </h3>
          {todo.description && (
            <p className="mt-1 text-gray-600">{todo.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-sm ${
          todo.category === 'Urgent' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {todo.category}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          {todo.dueDate && (
            <p className="text-sm text-gray-500">
              Due: {format(new Date(todo.dueDate), 'MMM d, yyyy')}
            </p>
          )}
          {user.role === 'admin' && todo.user && (
            <p className="text-sm text-gray-500">
              Created by: {todo.user.username}
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={handleEdit}
            className="text-sm"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="text-sm"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
