import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CheckinDetials.module.css';

interface Employee {
  employeeId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Checkin {
  _id: string;
  employee: Employee;
  lat: number;
  lng: number;
  photoUrl: string;
  officeName: string;
  status: 'approved' | 'rejected';
  timestamp: string;
  reviewComments: string;
}

const API_URL = 'http://localhost:5000/api/checkin/approval/history';

const CheckinDetails: React.FC = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string>(''); // filter input
  const [filteredCheckins, setFilteredCheckins] = useState<Checkin[]>([]);

  const navigate = useNavigate();

  const fetchCheckinHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || '';
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCheckins(response.data);
      setFilteredCheckins(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch check-in history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckinHistory();
  }, []);

  // Filter checkins by employee id substring (case-insensitive)
  useEffect(() => {
    if (!employeeFilter) {
      setFilteredCheckins(checkins);
    } else {
      const filtered = checkins.filter((c) =>
        c.employee?.employeeId.toLowerCase().includes(employeeFilter.toLowerCase())
      );
      setFilteredCheckins(filtered);
    }
  }, [employeeFilter, checkins]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }
  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2>All Check-in Approval History</h2>

      <button onClick={() => navigate('/manager-approval')} className={styles.backButton}>
        Back to Manager Approval
      </button>
      <button onClick={fetchCheckinHistory} className={styles.refreshButton} style={{ marginLeft: '10px' }}>
        See latest checkin status
      </button>

      <div style={{ margin: '15px 0' }}>
        <label htmlFor="employeeIdFilter" style={{ marginRight: 10 }}>
          Filter by Employee ID:
        </label>
        <input
          id="employeeIdFilter"
          type="text"
          value={employeeFilter}
          placeholder="Enter Employee ID"
          onChange={(e) => setEmployeeFilter(e.target.value)}
          style={{ padding: '6px 8px', fontSize: 16, minWidth: 200 }}
        />
      </div>

      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Office</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Status</th>
              <th>Review Comments</th>
              <th>Timestamp</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {filteredCheckins.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>No records found.</td>
              </tr>
            ) : (
              filteredCheckins.map((c) => (
                <tr key={c._id}>
                  <td>
                    {c.employee
                      ? `${c.employee.firstName || ''} ${c.employee.lastName || ''} (${c.employee.employeeId})`
                      : 'N/A'}
                  </td>
                  <td>{c.officeName || 'N/A'}</td>
                  <td>{c.lat !== undefined ? c.lat : 'N/A'}</td>
                  <td>{c.lng !== undefined ? c.lng : 'N/A'}</td>
                  <td>{c.status}</td>
                  <td>{c.reviewComments || 'N/A'}</td>
                  <td>{new Date(c.timestamp).toLocaleString()}</td>
                  <td>
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt="Check-in"
                        className={styles.photoThumbnail}
                        onClick={() => setModalImage(c.photoUrl!)}
                      />
                    ) : (
                      'No photo'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalImage && (
        <div className={styles.modalOverlay} onClick={() => setModalImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setModalImage(null)}>
              &times;
            </button>
            <img src={modalImage} alt="Check-in Large" className={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinDetails;
