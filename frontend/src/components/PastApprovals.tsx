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
  const [filteredCheckouts, setFilteredCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>(''); // yyyy-mm-dd format
  const [dateTo, setDateTo] = useState<string>('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');

  const navigate = useNavigate();

  // Convert date string (yyyy-mm-dd) assumed in IST midnight to UTC ISO string
  const istDateToUTCISOString = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const istDate = new Date(Date.UTC(year, month - 1, day));
    istDate.setMinutes(istDate.getMinutes() - 330);
    return istDate.toISOString();
  };

  const loadCheckouts = async (from?: string, to?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';

      const data = await fetchCheckouts(token, from, to);
      setCheckouts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch checkouts');
      setCheckouts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter checkouts by employeeId substring (case-insensitive), and base data on date filters
  useEffect(() => {
    const filtered = employeeFilter
      ? checkouts.filter((checkout) =>
          checkout.employee?.employeeId
            .toLowerCase()
            .includes(employeeFilter.toLowerCase())
        )
      : checkouts;
    setFilteredCheckouts(filtered);
  }, [employeeFilter, checkouts]);

  useEffect(() => {
    loadCheckouts();
  }, []);

  const handleFilter = () => {
    if (dateFrom && dateTo) {
      const fromISO = istDateToUTCISOString(dateFrom);
      const toDateObj = new Date(dateTo);
      toDateObj.setDate(toDateObj.getDate() + 1);
      const nextDayStr = toDateObj.toISOString().slice(0, 10);
      const toISO = istDateToUTCISOString(nextDayStr);
      loadCheckouts(fromISO, toISO);
    } else {
      loadCheckouts();
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2>Past Approvals</h2>

      <button onClick={() => navigate('/manager-approval')} className={styles.backButton}>
        Back to Manager Approval
      </button>

      {/* Filters */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <label>
          From:{' '}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || undefined}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          To:{' '}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
          />
        </label>

        <label style={{ marginLeft: 10 }}>
          Employee ID:{' '}
          <input
            type="text"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            placeholder="Filter by employee ID"
            style={{ padding: '4px 6px' }}
          />
        </label>

        <button onClick={handleFilter} style={{ marginLeft: 10 }}>
          Apply Date Filter
        </button>

        <button onClick={() => loadCheckouts()} className={styles.refreshButton} style={{ marginLeft: 10 }}>
          See new checkouts
        </button>
      </div>

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
          {filteredCheckouts.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                No records found.
              </td>
            </tr>
          ) : (
            filteredCheckouts.map(({ _id, employee, checkin, timestamp }) => {
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

              return (
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
              );
            })
          )}
        </tbody>
      </table>

      {modalImage && (
        <div className={styles.modalOverlay} onClick={() => setModalImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
