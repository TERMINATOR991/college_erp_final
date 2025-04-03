import { apiRequest } from './api';

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