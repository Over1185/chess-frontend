// src/utils/auth.js
export const API_BASE_URL = "http://localhost:8000";

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

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const response = await fetch(fullUrl, config);

  // Si el token expiró, limpiar localStorage y redirigir al login
  if (response.status === 401) {
    clearAuthData();
    // No recargar automáticamente, mejor manejar esto en el App
    throw new Error('Sesión expirada');
  }

  return response;
};

// Función para limpiar todos los datos de autenticación
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("sessionExpiry");
};

// Función para realizar login
export const loginUser = async (credentials) => {
  try {

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar token y datos del usuario
      const tokenPayload = decodeToken(data.access_token);

      if (tokenPayload) {
        const userData = {
          name: tokenPayload.username,
          username: tokenPayload.username,
          email: tokenPayload.email,
          type: tokenPayload.role,
          role: tokenPayload.role,
          rating: tokenPayload.elo || 1200,
          token: data.access_token
        };

        // Guardar en localStorage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("sessionExpiry", (tokenPayload.exp * 1000).toString());

        return { success: true, user: userData };
      }
    }

    return { success: false, error: data.detail || "Error en el login" };
  } catch (error) {
    console.error("Error en loginUser:", error);
    return { success: false, error: "Error de conexión. Verifica que el servidor esté funcionando." };
  }
};

// Función para realizar registro
export const registerUser = async (userData) => {
  try {

    const response = await fetch(`${API_BASE_URL}/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: "¡Registro exitoso! Puedes iniciar sesión ahora." };
    }

    return { success: false, error: data.detail || data.mensaje || "Error en el registro" };
  } catch (error) {
    console.error("Error en registerUser:", error);
    return { success: false, error: `Error de conexión: ${error.message}. Verifica que el servidor esté funcionando en ${API_BASE_URL}` };
  }
};

// Función para obtener el perfil completo del usuario
export const getUserProfile = async (username) => {
  try {
    const response = await authFetch(`/api/users/perfil/${username}`);

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
  const sessionExpiry = localStorage.getItem("sessionExpiry");

  if (!token || !sessionExpiry) return false;

  // Verificar si la sesión ha expirado
  if (Date.now() > parseInt(sessionExpiry)) {
    clearAuthData();
    return false;
  }

  try {
    const payload = decodeToken(token);
    return payload && payload.exp > Date.now() / 1000;
  } catch {
    clearAuthData();
    return false;
  }
};

// Función para logout
export const logout = () => {
  clearAuthData();
  window.location.reload();
};

// Función para obtener datos del usuario desde el token o localStorage
export const getUserFromToken = () => {
  // Primero intentar obtener desde localStorage (más rápido)
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      // Verificar que la sesión sigue siendo válida
      if (isAuthenticated()) {
        return userData;
      }
    } catch {
      // Si hay error parseando, limpiar y continuar con el token
      localStorage.removeItem("user");
    }
  }

  // Fallback: obtener desde el token
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = decodeToken(token);
    // Verificar si el token no ha expirado
    if (payload && payload.exp > Date.now() / 1000) {
      const userData = {
        username: payload.username,
        email: payload.email,
        type: payload.role,
        role: payload.role,
        elo: payload.elo || 1200
      };

      // Guardar en localStorage para futuras consultas
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } else {
      clearAuthData();
      return null;
    }
  } catch {
    clearAuthData();
    return null;
  }
};

// Función para verificar y refrescar la sesión periódicamente
export const checkSessionValidity = () => {
  if (!isAuthenticated()) {
    clearAuthData();
    return false;
  }
  return true;
};

// Función para obtener el tiempo restante de la sesión
export const getSessionTimeRemaining = () => {
  const sessionExpiry = localStorage.getItem("sessionExpiry");
  if (!sessionExpiry) return 0;

  const timeRemaining = parseInt(sessionExpiry) - Date.now();
  return Math.max(0, timeRemaining);
};