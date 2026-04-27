import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get movie by ID with proper error handling
export const getMovieById = async (id) => {
  try {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Movie not found');
    }
    throw error;
  }
};

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    if (response.data) {
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, ...response.data }));
    }
    return response.data;
  }
};

export const movieService = {
  getAll: async (params) => {
    const response = await api.get('/movies', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },
  
  watchMovie: async (id) => {
    const response = await api.get(`/movies/watch/${id}`);
    return response.data;
  },
  
  getFeatured: async () => {
    const response = await api.get('/movies/featured');
    return response.data;
  },
  
  getTrending: async () => {
    const response = await api.get('/movies/trending');
    return response.data;
  },
  
  getByCategory: async (category) => {
    const response = await api.get(`/movies/category/${category}`);
    return response.data;
  },
  
  getSimilar: async (id) => {
    const response = await api.get(`/movies/similar/${id}`);
    return response.data;
  }
};

export const watchlistService = {
  get: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },
  
  add: async (movieId) => {
    const response = await api.post(`/watchlist/${movieId}`);
    return response.data;
  },
  
  remove: async (movieId) => {
    const response = await api.delete(`/watchlist/${movieId}`);
    return response.data;
  }
};

export const adminService = {
  getMovies: async () => {
    const response = await api.get('/admin/movies');
    return response.data;
  },
  
  createMovie: async (data) => {
    const response = await api.post('/admin/movies', data);
    return response.data;
  },
  
  updateMovie: async (id, data) => {
    const response = await api.put(`/admin/movies/${id}`, data);
    return response.data;
  },
  
  deleteMovie: async (id) => {
    const response = await api.delete(`/admin/movies/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },
  
  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },
  
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
};

export default api;