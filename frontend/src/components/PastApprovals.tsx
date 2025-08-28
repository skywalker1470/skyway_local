import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCheckouts } from '../api/api';
import styles from './PastApprovals.module.css';

interface Employee {
  _id: string;
  employeeId: string;
  firstName?: string;
  lastName?: string;
}

interface Checkin {
  _id: string;
  timestamp: string;
  photoUrl?: string;
}

interface Checkout {
  _id: string;
  employee: Employee;
  checkin: Checkin | null;
  timestamp: string; // checkout timestamp
}

const PastApprovals: React.FC = () => {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Extract fetch function to reuse on refresh
  const loadCheckouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      const data = await fetchCheckouts(token);
      setCheckouts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch checkouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckouts();
  }, []);

  const getDuration = (checkinTimestamp: string | null, checkoutTimestamp: string) => {
    if (!checkinTimestamp) return 'N/A';
    const start = new Date(checkinTimestamp).getTime();
    const end = new Date(checkoutTimestamp).getTime();
    if (isNaN(start) || isNaN(end)) return 'Invalid date';
    const diffMs = end - start;
    if (diffMs < 0) return 'Invalid duration';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2>Past Approvals</h2>

      <button onClick={() => navigate('/manager-approval')} className={styles.backButton}>
        Back to Manager Approval
      </button>

      {/* New refresh button */}
      <button onClick={loadCheckouts} className={styles.refreshButton} style={{ marginLeft: '10px' }}>
        See new checkouts
      </button>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Checkin Timestamp</th>
            <th>Checkout Timestamp</th>
            <th>Duration (Checkin to Checkout)</th>
            <th>Checkin Photo</th>
          </tr>
        </thead>
        <tbody>
          {checkouts.map(({ _id, employee, checkin, timestamp }) => (
            <tr key={_id}>
              <td>{employee?.employeeId || 'N/A'}</td>
              <td>{checkin?.timestamp ? new Date(checkin.timestamp).toLocaleString() : 'N/A'}</td>
              <td>{new Date(timestamp).toLocaleString()}</td>
              <td>{getDuration(checkin?.timestamp || null, timestamp)}</td>
              <td>
                {checkin?.photoUrl ? (
                  <img
                    src={checkin.photoUrl}
                    alt="Checkin Photo"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => setModalImage(checkin.photoUrl!)}
                  />
                ) : (
                  'No photo'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalImage && (
        <div className={styles.modalOverlay} onClick={() => setModalImage(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setModalImage(null)}>
              &times;
            </button>
            <img src={modalImage} alt="Checkin Large" className={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PastApprovals;
