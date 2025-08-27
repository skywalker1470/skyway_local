import { useState, useEffect } from 'react';
import './App.css';

import LoginForm from './components/LoginForm';
import CheckIn from './components/CheckIn';
import ManagerApproval from './components/ManagerApproval';

type User = {
  id: string;
  employeeId: string;
  role: string; // 'employee' or 'manager'
  name: string;
};

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle onLogin
  const handleLogin = (user: User) => {
    setLoggedInUser(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    localStorage.setItem('employeeId', user.id); // Save MongoDB ObjectId here, NOT employeeId if different
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('token');
    setLoggedInUser(null);
  };

  // Show login form if no logged-in user
  if (!loggedInUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div id="root">
      <h1>Employee Portal</h1>
      <p className="loginStatus">
        Logged in as <strong>{loggedInUser.name}</strong> ({loggedInUser.role})
        <button
          onClick={handleLogout}
          style={{
            marginLeft: '14px',
            padding: '6px 16px',
            cursor: 'pointer',
            background: '#111',
            borderRadius: '7px',
            color: '#fff',
            fontWeight: 500,
            border: 'none',
          }}
        >
          Logout
        </button>
      </p>

      {loggedInUser.role === 'employee' && <CheckIn />}
      {loggedInUser.role === 'manager' && <ManagerApproval />}
    </div>
  );
}
