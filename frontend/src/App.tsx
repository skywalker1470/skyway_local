import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import LoginForm from './components/LoginForm';
import CheckIn from './components/CheckIn';
import ManagerApproval from './components/ManagerApproval';
import PastApprovals from './components/PastApprovals';
import './App.css';
type User = {
  id: string;
  employeeId: string;
  role: string;
  name: string;
};

// ProtectedRoute wrapper with role-based access
const ProtectedRoute: React.FC<{ allowedRoles: string[]; user: User | null }> = ({
  allowedRoles,
  user,
}) => {
  if (!user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in but role not allowed
    return <p>Access denied. You do not have permission to view this page.</p>;
  }

  return <Outlet />;
};

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setLoggedInUser(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    localStorage.setItem('employeeId', user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('token');
    setLoggedInUser(null);
  };

  if (!loggedInUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Router>
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

        <Routes>
          {/* Home route: redirect based on role */}
          <Route
            path="/"
            element={
              loggedInUser.role === 'employee' ? (
                <CheckIn />
              ) : loggedInUser.role === 'manager' ? (
                <Navigate to="/manager-approval" />
              ) : (
                <p>Access denied. Unknown role.</p>
              )
            }
          />

          {/* Routes protected for manager role */}
          <Route element={<ProtectedRoute allowedRoles={['manager']} user={loggedInUser} />}>
            <Route path="/manager-approval" element={<ManagerApproval />} />
            <Route path="/past-approvals" element={<PastApprovals />} />
          </Route>

          {/* Catch unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
