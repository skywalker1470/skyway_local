import React, { useState } from 'react';
import { loginUser } from '../api/api';
import styles from './LoginForm.module.css';
import BackgroundCellTowers from './BackgroundCellTowers';

interface User {
  id: string;
  employeeId: string;
  role: string;
  name: string;
}

export default function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await loginUser(employeeId, password);
      localStorage.setItem('token', res.token);

      // Role-based welcome message
      if (res.user.role === 'manager') {
        setMessage(`Welcome, Manager ${res.user.name}`);
      } else if (res.user.role === 'employee') {
        setMessage(`Welcome, Employee ${res.user.name}`);
      } else {
        setMessage(`Welcome, ${res.user.name}`);
      }

      onLogin(res.user);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setMessage('Access denied. Please check your credentials.');
      } else {
        setMessage('Invalid employee ID or password');
      }
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      {/* Background animation */}
      <BackgroundCellTowers />

      {/* Styled form */}
      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <h2 className={styles.formTitle}>Login</h2>
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className={styles.formField}
          />
          <input
            type="password"
            placeholder="Password (phone number)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.formField}
          />
          <button type="submit" className={styles.formButton}>Login</button>
          <p className={styles.formMessage}>{message}</p>
        </form>
      </div>
    </>
  );
}
