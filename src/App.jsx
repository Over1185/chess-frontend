import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
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
          setCurrentView("home");
        } else {
          // Token inválido, ir al login
          setCurrentView("login");
        }
      } else {
        // No autenticado, ir al login
        setCurrentView("login");
      }
      setIsLoading(false);
    };

    checkAuth();

    // Verificar sesión cada 30 segundos
    const sessionCheck = setInterval(() => {
      if (!checkSessionValidity()) {
        // Sesión expirada
        setUser(null);
        setCurrentView("login");
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
    setCurrentView("home");
  }

  function logout() {
    setUser(null);
    setCurrentView("login");
    clearAuthData();
  }


  // Funciones para manejar las partidas online
  const handleGameStart = (gameStartData) => {
    console.log('handleGameStart called with:', gameStartData);

    // Formatear los datos para el componente ChessBoardOnline
    const formattedGameData = {
      id: gameStartData.game_id,
      player_color: gameStartData.your_color,
      opponent_name: gameStartData.your_color === 'white' ? gameStartData.black_player : gameStartData.white_player,
      current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // FEN inicial
      moves: [],
      session_token: user?.token // Agregar token para WebSocket
    };

    console.log('Setting gameData to:', formattedGameData);
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
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterView setCurrentView={setCurrentView} />} />
          <Route path="*" element={<LoginView onLogin={login} setCurrentView={setCurrentView} />} />
        </Routes>
      </Router>
    );
  }

  // Usuario autenticado - mostrar aplicación completa con rutas
  return (
    <WebSocketProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <Header user={user} onLogout={logout} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomeView user={user} setCurrentView={setCurrentView} />} />
              <Route path="/home" element={<HomeView user={user} setCurrentView={setCurrentView} />} />
              <Route path="/puzzles" element={<PuzzlesView user={user} onBack={() => setCurrentView("home")} />} />
              <Route path="/learn" element={<LearnView user={user} onBack={() => setCurrentView("home")} />} />
              <Route path="/learn/:lessonId" element={<DynamicLessonView user={user} />} />
              <Route path="/play" element={<PlayView user={user} setCurrentView={setCurrentView} />} />
              <Route path="/ai-play" element={<AIPlayView user={user} />} />
              <Route path="/stats" element={<StatsView user={user} onBack={() => setCurrentView("home")} />} />
              <Route path="/classrooms" element={<ClassroomsView user={user} onBack={() => setCurrentView("home")} />} />
              <Route
                path="/teacher-panel"
                element={
                  user?.type === "profesor"
                    ? <TeacherPanelView user={user} onBack={() => setCurrentView("home")} />
                    : <Navigate to="/home" replace />
                }
              />
              <Route
                path="/online-lobby"
                element={
                  <OnlineGameLobby
                    user={user}
                    onGameStart={handleGameStart}
                    onBack={() => setCurrentView("play")}
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
      </Router>
    </WebSocketProvider>
  );
}