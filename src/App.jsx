import { useState, useEffect } from "react";
import { getUserFromToken, isAuthenticated, checkSessionValidity, clearAuthData } from "./utils/auth";

import Header from "./components/Header";
import Footer from "./components/Footer";
import OnlineGameLobby from "./components/OnlineGameLobby";
import ChessBoardOnline from "./components/ChessBoardOnline";

import HomeView from "./views/HomeView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import PuzzlesView from "./views/PuzzlesView";
import LearnView from "./views/LearnView";
import PlayView from "./views/PlayView";
import StatsView from "./views/StatsView";
import ClassroomsView from "./views/ClassroomsView";
import AdminPanelView from "./views/AdminPanelView";

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
            token: localStorage.getItem("token")
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
    setUser(userData);
    setCurrentView("home");
  }

  function logout() {
    setUser(null);
    setCurrentView("login");
    clearAuthData();
  }

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
    switch (currentView) {
      case "register":
        return <RegisterView setCurrentView={setCurrentView} />;
      case "login":
      default:
        return <LoginView onLogin={login} setCurrentView={setCurrentView} />;
    }
  }

  // Funciones para manejar las partidas online
  const handleGameStart = (gameStartData) => {
    console.log('=== App.jsx handleGameStart ===');
    console.log('Datos recibidos gameStartData:', gameStartData);
    console.log('your_color:', gameStartData.your_color);

    // Formatear los datos para el componente ChessBoardOnline
    const formattedGameData = {
      id: gameStartData.game_id,
      player_color: gameStartData.your_color,
      opponent_name: gameStartData.your_color === 'white' ? gameStartData.black_player : gameStartData.white_player,
      current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // FEN inicial
      moves: [],
      session_token: user?.token // Agregar token para WebSocket
    };

    console.log('Datos formateados para ChessBoardOnline:', formattedGameData);
    console.log('player_color final:', formattedGameData.player_color);

    setGameData(formattedGameData);
    setCurrentView("chess-game");
  };

  // Función para terminar partida
  const handleGameEnd = () => {
    setGameData(null);
    setCurrentView("play");
  };

  // Renderiza la vista actual (solo cuando hay usuario autenticado)
  const renderCurrentView = () => {
    switch (currentView) {
      case "puzzles":
        return <PuzzlesView user={user} onBack={() => setCurrentView("home")} />;
      case "learn":
        return <LearnView user={user} onBack={() => setCurrentView("home")} />;
      case "play":
        return <PlayView user={user} setCurrentView={setCurrentView} />;
      case "stats":
        return <StatsView user={user} onBack={() => setCurrentView("home")} />;
      case "classrooms":
        return <ClassroomsView user={user} onBack={() => setCurrentView("home")} />;
      case "admin":
        return <AdminPanelView user={user} onBack={() => setCurrentView("home")} />;
      case "online-lobby":
        return (
          <OnlineGameLobby
            user={user}
            onGameStart={handleGameStart}
            onBack={() => setCurrentView("play")}
          />
        );
      case "chess-game":
        return (
          <ChessBoardOnline
            gameData={gameData}
            user={user}
            onGameEnd={handleGameEnd}
          />
        );
      case "home":
      default:
        return <HomeView user={user} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header user={user} onLogout={logout} setCurrentView={setCurrentView} />
      <main className="flex-grow">{renderCurrentView()}</main>
      <Footer user={user} />
    </div>
  );
}