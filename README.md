# Todo Application

A full-stack todo application with user authentication and admin features.

## Features

- User authentication (register/login)
- Create, edit, and delete todos
- Admin dashboard
- Role-based access (admin/user)
- Task categories and due dates

## Setup

1. Clone the repository
2. Set up environment variables in `server/.env`:
```
PORT=5001
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_connection_string
```

## How to Run

1. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. Start the servers:
```bash
# Start backend server (http://localhost:5001)
cd server
npm run dev

# Start frontend (http://localhost:3000)
cd ../client
npm run dev
```

3. Access the app:
- Open http://localhost:3000 in your browser
- Register a new account
- Login with your credentials

## Admin Access

1. Register a new user
2. Login with your credentials
3. Access admin features at /admin after being promoted to admin role
