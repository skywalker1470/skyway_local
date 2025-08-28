import React, { useEffect, useState } from "react";
import './ManagerApproval.css';

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CheckinRequest {
  id: string;
  employee?: Employee | null;
  lat?: number | null;
  lng?: number | null;
  photoUrl?: string | null;
  officeName?: string | null;
  status?: "pending" | "approved" | "rejected";
  timestamp?: string | null;
  reviewComments?: string;
}

const API_BASE_URL = " http://localhost:5000/api";

const ManagerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<CheckinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingIds, setActionLoadingIds] = useState<string[]>([]);
  const [comments, setComments] = useState<{ [id: string]: string }>({});
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please login.");

      // FIXED: Use /checkin/approval endpoint
      const res = await fetch(`${API_BASE_URL}/checkin/approval`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) throw new Error("Unauthorized. Please login again.");
      if (!res.ok) throw new Error("Failed to fetch check-in requests");

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid format from API");

      setRequests(
        data.map((item: any) => ({
          ...item,
          id: item._id || item.id,
        }))
      );
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (id: string, value: string) => {
    setComments((prev) => ({ ...prev, [id]: value }));
  };

  const reviewRequest = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    setActionLoadingIds((prev) => [...prev, id]);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found. Please login.");
        return;
      }
      const reviewComments = comments[id] || "";

      // FIXED: Use /checkin/approval/:id/review endpoint
      const res = await fetch(
        `${API_BASE_URL}/checkin/approval/${id}/review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, reviewComments }),
        }
      );
      if (res.status === 401) {
        alert("Unauthorized. Please login again.");
        return;
      }
      if (!res.ok) {
        const resp = await res.json();
        throw new Error(resp.message || "Failed to update check-in status");
      }
      await fetchRequests();
      setComments((prev) => ({ ...prev, [id]: "" }));
    } catch (err: any) {
      alert(err.message || "Error updating check-in status");
    } finally {
      setActionLoadingIds((prev) => prev.filter((actionId) => actionId !== id));
    }
  };

  if (loading) return <div className="container">Loading check-in requests...</div>;

  if (error)
    return (
      <div className="container errorMessage">
        Error: {error}
        <br />
        Please try logging out and logging back in.
      </div>
    );

  return (
    <div className="container">
      <h1>Manager Dashboard - Pending Check-in Requests</h1>
      <button onClick={fetchRequests} className="refreshButton">See new requests</button>
      {requests.length === 0 ? (
        <p>No pending check-in requests.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Office</th>
                <th>Photo</th>
                <th>Location</th>
                <th>Timestamp</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    {req.employee 
                      ? `${req.employee.firstName} ${req.employee.lastName} (${req.employee.employeeId})` 
                      : "Unknown Employee"}
                  </td>
                  <td>{req.officeName || "N/A"}</td>
                  <td>
                    {req.photoUrl ? (
                      <img
                        src={req.photoUrl}
                        alt="Checkin"
                        style={{ width: 100, height: "auto", borderRadius: 5, cursor: 'pointer' }}
                        onClick={() => setModalImage(req.photoUrl!)}
                      />
                    ) : (
                      "No photo"
                    )}
                  </td>
                  <td>
                    Lat: {req.lat !== undefined && req.lat !== null ? req.lat.toFixed(4) : "?"}, 
                    Lng: {req.lng !== undefined && req.lng !== null ? req.lng.toFixed(4) : "?"}
                  </td>
                  <td>
                    {req.timestamp ? new Date(req.timestamp).toLocaleString() : "No time"}
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Add comment"
                      value={comments[req.id] || ""}
                      onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      className="inputComment"
                    />
                  </td>
                  <td>
                    <button
                      disabled={actionLoadingIds.includes(req.id!)}
                      onClick={() => reviewRequest(req.id!, "approved")}
                      className="actionButton approveButton"
                    >
                      {actionLoadingIds.includes(req.id!) ? "Processing..." : "Approve"}
                    </button>
                    <button
                      disabled={actionLoadingIds.includes(req.id!)}
                      onClick={() => reviewRequest(req.id!, "rejected")}
                      className="actionButton"
                    >
                      {actionLoadingIds.includes(req.id!) ? "Processing..." : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalImage && (
            <div className="modalOverlay" onClick={() => setModalImage(null)}>
              <img src={modalImage} alt="Full screen" className="modalImage" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
