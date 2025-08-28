import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCheckouts } from '../api/api'; // Your centralized axios API helper

interface Employee {
  _id: string;
  employeeId: string;
}

interface Checkin {
  _id: string;
  timestamp: string;
}

interface Checkout {
  _id: string;
  employee: Employee;
  checkin: Checkin | null;
  timestamp: string;  // checkout timestamp
}

const PastApprovals: React.FC = () => {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadCheckouts = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const data = await fetchCheckouts(token);
      setCheckouts(data);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Past Approvals</h2>

      {/* Back button */}
      <button
        onClick={() => navigate('/manager-approval')}
        style={{ marginBottom: 20, padding: '8px 16px', cursor: 'pointer' }}
      >
        Back to Manager Approval
      </button>

      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Checkin Timestamp</th>
            <th>Checkout Timestamp</th>
            <th>Duration (Checkin to Checkout)</th>
          </tr>
        </thead>
        <tbody>
          {checkouts.map(({ _id, employee, checkin, timestamp }) => (
            <tr key={_id}>
              <td>{employee?.employeeId || 'N/A'}</td>
              <td>{checkin?.timestamp ? new Date(checkin.timestamp).toLocaleString() : 'N/A'}</td>
              <td>{new Date(timestamp).toLocaleString()}</td>
              <td>{getDuration(checkin?.timestamp || null, timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PastApprovals;
