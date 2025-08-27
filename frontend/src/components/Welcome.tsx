import React, { useState } from 'react';
import { checkout } from '../api/api';
import styles from './Welcome.module.css';

const Welcome: React.FC = () => {
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const employeeId = localStorage.getItem('employeeId');
  const checkinId = localStorage.getItem('checkinId');

  const handleCheckout = async () => {
    setMessage('');
    if (!token || !employeeId || !checkinId) {
      localStorage.clear();
      window.location.href = '/';
      return;
    }
    try {
      const res = await checkout(employeeId, checkinId, token);
      setMessage(res.message || 'Checkout successful!');
      localStorage.removeItem('checkinId');
      window.location.href = '/';
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || 'Checkout failed.';
      setMessage(errMsg);
      if (errMsg.toLowerCase().includes('already checked out')) {
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/';
        }, 1500);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Welcome!</div>
      <button onClick={handleCheckout} className={styles.button}>
        Checkout
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Welcome;
