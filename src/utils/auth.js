// src/utils/auth.js
export const API_BASE_URL = "http://localhost:8000/api";

// Función para hacer requests autenticados
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  // Si el token expiró, limpiar localStorage y redirigir al login
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
  }

  return response;
};

// Función para obtener el perfil completo del usuario
export const getUserProfile = async (username) => {
  try {
    const response = await authFetch(`/users/perfil/${username}`);
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Función para decodificar el JWT token
export const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = decodeToken(token);
    // Verificar si el token no ha expirado
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};

// Función para logout
export const logout = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

// Función para obtener datos del usuario desde el token
export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = decodeToken(token);
    return {
      username: payload.username,
      email: payload.email,
      type: payload.role === "profesor" ? "teacher" : "user",
      role: payload.role
    };
  } catch (error) {
    return null;
  }
};