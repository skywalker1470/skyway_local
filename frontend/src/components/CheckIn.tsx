import React, { useState, useEffect, useRef } from 'react';
import { checkIn } from '../api/api';
import Webcam from 'react-webcam';
import Welcome from './Welcome';
import styles from './CheckIn.module.css';

export default function CheckIn() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const intervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toString());
          setLng(pos.coords.longitude.toString());
        },
        () => setMessage('Could not get location.')
      );
    } else {
      setMessage('Geolocation not supported.');
    }
  }, []);

  useEffect(() => {
    const pollApprovalStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must login first.');
        return;
      }
      const checkinId = localStorage.getItem('checkinId');
      if (!checkinId) {
        setApproved(false);
        setRejected(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/checkin/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch check-in status');
        const data = await response.json();
        if (data.status === 'approved') {
          setApproved(true);
          setRejected(false);
          if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        } else if (data.status === 'rejected') {
          setRejected(true);
          setApproved(false);
          setMessage('Your check-in request has been rejected by the manager.');
          if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          localStorage.removeItem('checkinId');
        } else {
          setRejected(false);
          setApproved(false);
          setMessage('');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    pollApprovalStatus();
    intervalIdRef.current = window.setInterval(pollApprovalStatus, 5000);

    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setImgSrc(imageSrc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buttonDisabled) return; // Prevent if already submitting
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must login first.');
      return;
    }
    if (!lat || !lng || !imgSrc) {
      setMessage('Location and photo are required.');
      return;
    }
    try {
      setButtonDisabled(true); // Disable immediately on submit
      const blob = await fetch(imgSrc).then(res => res.blob());
      const res = await checkIn(lat, lng, new File([blob], 'checkin.jpg', { type: 'image/jpeg' }), token);
      localStorage.setItem('checkinId', res.checkinId);
      setMessage(res.message || 'Success! Check-in recorded.');
      setRejected(false);
      setApproved(false);

      setTimeout(() => {
        setButtonDisabled(false); // Re-enable after 10 seconds
      }, 10000);

      setTimeout(() => {
        setMessage(''); // Clear message after 12 seconds
      }, 12000);

    } catch (err: any) {
      setButtonDisabled(false);
      setMessage(err.response?.data?.message || 'Check-in failed');
    }
  };

  if (approved) {
    return <Welcome />;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.container}>
        <h2 className={styles.title}>Check In</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Latitude:</label>
          <input type="text" value={lat} readOnly className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Longitude:</label>
          <input type="text" value={lng} readOnly className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <div className={styles.webcamBox}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={340}
              height={220}
              style={{ borderRadius: '8px' }}
            />
          </div>
          <button type="button" onClick={capture} className={styles.button}>
            Capture photo
          </button>
          {imgSrc && <img src={imgSrc} alt="captured" className={styles.capturedImage} />}
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={buttonDisabled}
          style={{ backgroundColor: buttonDisabled ? '#bbb' : undefined, cursor: buttonDisabled ? 'not-allowed' : 'pointer' }}
        >
          Check In
        </button>
      </form>
      {rejected && (
        <p className={styles.message}>
          Your check-in request has been rejected by the manager.
        </p>
      )}
      {message && !rejected && <p className={styles.message}>{message}</p>}
    </>
  );
}
