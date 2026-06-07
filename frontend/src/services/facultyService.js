import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/faculty';

const getAuthHeaders = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  return {
    'X-User-RegNo': user.regNo || '',
    'Content-Type': 'application/json',
  };
};

export const facultyService = {
  // Courses
  getCourses: () => axios.get(`${API_BASE_URL}/courses`, { headers: getAuthHeaders() }),

  // Assignments
  createAssignment: (formData) => axios.post(`${API_BASE_URL}/assignments`, formData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
  }),
  getAssignments: () => axios.get(`${API_BASE_URL}/assignments`, { headers: getAuthHeaders() }),
  getAssignmentSubmissions: (assignmentId) => axios.get(`${API_BASE_URL}/assignments/${assignmentId}/submissions`, { headers: getAuthHeaders() }),
  gradeSubmission: (submissionId, data) => axios.put(`${API_BASE_URL}/submissions/${submissionId}/grade`, data, { headers: getAuthHeaders() }),

  // ABL
  createAblActivity: (formData) => axios.post(`${API_BASE_URL}/abl`, formData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
  }),
  getAblActivities: () => axios.get(`${API_BASE_URL}/abl`, { headers: getAuthHeaders() }),
  getAblSubmissions: (activityId) => axios.get(`${API_BASE_URL}/abl/${activityId}/submissions`, { headers: getAuthHeaders() }),
  gradeAblSubmission: (submissionId, data) => axios.put(`${API_BASE_URL}/abl/submissions/${submissionId}/grade`, data, { headers: getAuthHeaders() }),

  // Quizzes
  createQuiz: (data) => axios.post(`${API_BASE_URL}/quizzes`, data, { headers: getAuthHeaders() }),
  getQuizzes: () => axios.get(`${API_BASE_URL}/quizzes`, { headers: getAuthHeaders() }),

  // Materials
  uploadMaterial: (formData) => axios.post(`${API_BASE_URL}/materials`, formData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
  }),
  getMaterials: () => axios.get(`${API_BASE_URL}/materials`, { headers: getAuthHeaders() }),

  // Marks
  enterMarks: (data) => axios.post(`${API_BASE_URL}/marks`, data, { headers: getAuthHeaders() }),
};