import React from 'react';

const Input = ({ 
  label,
  error,
  type = 'text',
  id,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
