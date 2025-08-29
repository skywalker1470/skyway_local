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
import CheckinDetails from './components/CheckinDetails';  // Newly added import
import './App.css';

type User = {
  id: string;
  employeeId: string;
  role: string; // 'employee' or 'manager'
  name: string;
};

// ProtectedRoute for role-based access control
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
    localStorage.setItem('employeeId', user.id); // Save MongoDB ObjectId here
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
      <div className="employee-portal">
        <h1>Employee Portal</h1>
        <div className="loginStatus">
          <div>
            Hi, <strong>{loggedInUser.name}</strong> ({loggedInUser.role})
          </div>
          <button className="logoutButton" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <Routes>
          {/* Role-based home route */}
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

          {/* Protected routes for manager */}
          <Route element={<ProtectedRoute allowedRoles={['manager']} user={loggedInUser} />}>
            <Route path="/manager-approval" element={<ManagerApproval />} />
            <Route path="/past-approvals" element={<PastApprovals />} />
            <Route path="/checkin-details" element={<CheckinDetails />} />{/* Newly added route */}
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
