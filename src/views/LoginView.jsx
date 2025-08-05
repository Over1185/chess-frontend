import { useState } from "react";
import { FaEye, FaEyeSlash, FaChessQueen, FaSignInAlt, FaUserPlus, FaCrown } from "react-icons/fa";
import { loginUser } from "../utils/auth";

export default function LoginView({ onLogin, setCurrentView }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creatingTeacher, setCreatingTeacher] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError("");
  };

  const createTeacherAccount = async () => {
    setCreatingTeacher(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/crear-profesor-temporal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Usuario profesor creado exitosamente!\n\nEmail: ${data.credentials.email}\nContraseña: ${data.credentials.password}`);

        // Auto-llenar el formulario con las credenciales del profesor
        setFormData({
          email: data.credentials.email,
          password: data.credentials.password
        });
      } else {
        setError("Error al crear usuario profesor");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión al crear usuario profesor");
    } finally {
      setCreatingTeacher(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await loginUser(formData);

    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
            <FaChessQueen className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            ¡Bienvenido!
          </h1>
          <p className="text-gray-600 text-lg">Inicia sesión en ChessEdu</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-pulse">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="ejemplo@correo.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
          >
            <FaSignInAlt className="text-lg" />
            <span className="text-lg">{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</span>
          </button>
        </form>

        {/* Register link */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 mb-4 font-medium">¿No tienes una cuenta?</p>
          <button
            onClick={() => setCurrentView("register")}
            className="w-full bg-white text-purple-600 border-2 border-purple-200 py-4 px-4 rounded-xl hover:bg-purple-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center space-x-3 shadow-md hover:shadow-lg mb-3"
            disabled={loading || creatingTeacher}
          >
            <FaUserPlus className="text-lg" />
            <span className="text-lg">Crear cuenta nueva</span>
          </button>

          {/* Botón temporal para crear profesor */}
          <button
            onClick={createTeacherAccount}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center space-x-3 shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={loading || creatingTeacher}
          >
            <FaCrown className="text-lg" />
            <span className="text-lg">
              {creatingTeacher ? "Creando usuario profesor..." : "Crear usuario profesor (Temporal)"}
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-2">Solo para desarrollo - Crea: profesor@chess.edu</p>
        </div>
      </div>
    </div>
  );
}