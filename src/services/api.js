// API service for handling authentication and user registration

const API_URL = 'http://localhost:8000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }
  return data;
};

// User registration
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

// User login
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse(response);
    // Store tokens in localStorage
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('accessToken') !== null;
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Refresh token
export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) throw new Error('No refresh token available');

    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    const data = await handleResponse(response);
    localStorage.setItem('accessToken', data.access);
    return data.access;
  } catch (error) {
    // If refresh fails, log out the user
    logoutUser();
    throw error;
  }
};

// API request with token refresh
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // Add authorization header if token exists
    const token = localStorage.getItem('accessToken');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    let response = await fetch(`${API_URL}${endpoint}`, options);
    
    // If unauthorized, try to refresh token and retry
    if (response.status === 401) {
      try {
        const newToken = await refreshToken();
        options.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, options);
      } catch (refreshError) {
        throw new Error('Session expired. Please login again.');
      }
    }
    
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

// Student API functions
export const createStudent = async (studentData) => {
  return apiRequest('/students/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });
};

export const getAllStudents = async () => {
  return apiRequest('/students/');
};

export const getStudentById = async (id) => {
  return apiRequest(`/students/${id}/`);
};

export const updateStudent = async (id, studentData) => {
  return apiRequest(`/students/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });
};

export const deleteStudent = async (id) => {
  return apiRequest(`/students/${id}/`, {
    method: 'DELETE',
  });
};

export const sendStudentPDF = async (email, pdfData) => {
  return apiRequest('/students/send_pdf/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, pdf: pdfData }),
  });
}; 