import axios from 'axios';

// Updated base URL to your Railway backend
const API_URL = 'http://localhost:5000/api';

// Login employee
export const loginUser = async (employeeId: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { employeeId, password });
  return response.data;
};

// Employee Check-In with location and photo
export const checkIn = async (
  lat: string,
  lng: string,
  photo: File,
  token: string
) => {
  const formData = new FormData();
  formData.append('lat', lat);
  formData.append('lng', lng);
  formData.append('photo', photo);

  const response = await axios.post(`${API_URL}/checkin`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Manager - fetch pending check-ins for approval
export const fetchPendingCheckins = async (token: string) => {
  const response = await axios.get(`${API_URL}/approval`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Manager - review a check-in approval (approve/reject with optional comments)
export const reviewCheckin = async (
  id: string,
  status: 'approved' | 'rejected',
  reviewComments: string,
  token: string
) => {
  const response = await axios.post(
    `${API_URL}/approval/${id}/review`,
    { status, reviewComments },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Employee Checkout
export const checkout = async (employeeId: string, checkinId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/checkout`,
    { employeeId, checkinId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Manager - fetch all checkouts (for PastApprovals page) with optional date range filtering
export const fetchCheckouts = async (
  token: string,
  fromISO?: string,
  toISO?: string
) => {
  const queryParams: string[] = [];
  if (fromISO && toISO) {
    queryParams.push(`from=${encodeURIComponent(fromISO)}`, `to=${encodeURIComponent(toISO)}`);
  }
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const response = await axios.get(`${API_URL}/checkout${queryString}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
