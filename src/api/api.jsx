import axios from 'axios';

// 1. Leitura direta sem optional chaining para o Vite substituir corretamente no build
const rawBaseURL = import.meta.env.VITE_API_URL 
  || (typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL : null)
  || 'https://biblioteca-api-iucz.onrender.com';

// 2. Sanitização da URL (remove aspas, espaços e garante o protocolo)
const cleanBaseURL = rawBaseURL.trim().replace(/^["']|["']$/g, '');

console.log("✈️ URL ATUAL DO AXIOS:", cleanBaseURL);

const api = axios.create({
  baseURL: cleanBaseURL, 
  timeout: 10000, 
});

// Interceptor para injetar o Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@Library:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loanService = {
  listLoans: async (params) => {
    const response = await api.get('/loans', { params }); 
    return response.data;
  },

  approveLoan: async (loanId) => {
    const response = await api.patch(`/loans/${loanId}/approve`);
    return response.data;
  },

  rejectLoan: async (loanId) => {
    const response = await api.patch(`/loans/${loanId}/reject`);
    return response.data;
  },

  returnLoan: async (loanId) => {
    const response = await api.patch(`/loans/${loanId}/return`);
    return response.data; 
  }
};

export default api;