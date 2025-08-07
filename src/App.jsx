import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getUserFromToken, isAuthenticated, checkSessionValidity, clearAuthData } from "./utils/auth";
import { WebSocketProvider } from "./contexts/WebSocketContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import OnlineGameLobby from "./components/OnlineGameLobby";
import ChessBoardOnline from "./components/ChessBoardOnline";
import DynamicLessonView from "./components/DynamicLessonView";

import HomeView from "./views/HomeView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import PuzzlesView from "./views/PuzzlesView";
import LearnView from "./views/LearnView";
import PlayView from "./views/PlayView";
import AIPlayView from "./views/AIPlayView";
import StatsView from "./views/StatsView";
import ClassroomsView from "./views/ClassroomsView";
import TeacherPanelView from "./views/TeacherPanelView";

// Componente interno que tiene acceso a useNavigate
function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserFromToken();
        if (userData) {
          setUser({
            name: userData.username,
            username: userData.username,
            email: userData.email,
            type: userData.role,
            rating: userData.elo || 1200,
            token: localStorage.getItem("token"),
            lecciones_vistas: userData.lecciones_vistas || [] // Agregar progreso de lecciones
          });
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Verificar sesión cada 30 segundos
    const sessionCheck = setInterval(() => {
      if (!checkSessionValidity()) {
        // Sesión expirada
        setUser(null);
      }
    }, 30000);

    return () => clearInterval(sessionCheck);
  }, []);

  // Función de login actualizada
  function login(userData) {
    setUser({
      ...userData,
      lecciones_vistas: userData.lecciones_vistas || []
    });
    navigate("/");
  }

  function logout() {
    setUser(null);
    clearAuthData();
    navigate("/login");
  }


  // Funciones para manejar las partidas online
  const handleGameStart = (gameStartData) => {

    // Formatear los datos para el componente ChessBoardOnline
    const formattedGameData = {
      id: gameStartData.game_id,
      player_color: gameStartData.your_color,
      opponent_name: gameStartData.your_color === 'white' ? gameStartData.black_player : gameStartData.white_player,
      current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // FEN inicial
      moves: [],
      session_token: user?.token // Agregar token para WebSocket
    };
    setGameData(formattedGameData);
    // Navegar a la partida será manejado por React Router
  };

  // Función para terminar partida
  const handleGameEnd = () => {
    setGameData(null);
    // Navegar de vuelta al lobby será manejado por React Router
  };

  // Mostrar pantalla de carga mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar solo login y register
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<RegisterView />} />
        <Route path="*" element={<LoginView onLogin={login} />} />
      </Routes>
    );
  }

  // Usuario autenticado - mostrar aplicación completa con rutas
  return (
    <WebSocketProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header user={user} onLogout={logout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeView user={user} />} />
            <Route path="/home" element={<HomeView user={user} />} />
            <Route path="/puzzles" element={<PuzzlesView user={user} />} />
            <Route path="/learn" element={<LearnView user={user} />} />
            <Route path="/learn/:lessonId" element={<DynamicLessonView user={user} />} />
            <Route path="/play" element={<PlayView user={user} />} />
            <Route path="/ai-play" element={<AIPlayView user={user} />} />
            <Route path="/stats" element={<StatsView user={user} />} />
            <Route path="/classrooms" element={<ClassroomsView user={user} />} />
            <Route
              path="/teacher-panel"
              element={
                user?.type === "profesor"
                  ? <TeacherPanelView user={user} />
                  : <Navigate to="/home" replace />
              }
            />
            <Route
              path="/online-lobby"
              element={
                <OnlineGameLobby
                  user={user}
                  onGameStart={handleGameStart}
                />
              }
            />
            <Route
              path="/chess-game"
              element={
                gameData ? (
                  <ChessBoardOnline
                    gameData={gameData}
                    user={user}
                    onGameEnd={handleGameEnd}
                  />
                ) : (
                  <Navigate to="/play" replace />
                )
              }
            />
            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <Footer user={user} />
      </div>
    </WebSocketProvider>
  );
}

// Componente principal que envuelve AppContent en Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}