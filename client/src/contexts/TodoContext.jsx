import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TodoContext = createContext();

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const { isAdmin } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodos = async (isAdminView = false) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = isAdminView && isAdmin ? '/api/admin/todos' : '/api/todos';
      const { data } = await axios.get(endpoint);
      setTodos(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching todos');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData) => {
    try {
      setError(null);
      const { data } = await axios.post('/api/todos', todoData);
      setTodos(prev => [data, ...prev]);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating todo');
      throw error;
    }
  };

  const updateTodo = async (id, todoData) => {
    try {
      setError(null);
      const { data } = await axios.put(`/api/todos/${id}`, todoData);
      setTodos(prev => prev.map(todo => 
        todo._id === id ? data : todo
      ));
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating todo');
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError(null);
      await axios.delete(`/api/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting todo');
      throw error;
    }
  };

  const value = {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
