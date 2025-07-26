import { useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HomeView from "./views/HomeView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import PuzzlesView from "./views/PuzzlesView";
import LearnView from "./views/LearnView";
import PlayView from "./views/PlayView";
import StatsView from "./views/StatsView";
import ClassroomsView from "./views/ClassroomsView";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("home");

  // Función de login actualizada para recibir datos del backend
  function login(userData) {
    setUser(userData);
    setCurrentView("home");
  }

  function logout() {
    setUser(null);
    setCurrentView("home");
    // Limpiar token si existe
    localStorage.removeItem("token");
  }

  // Renderiza la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case "login":
        return <LoginView onLogin={login} setCurrentView={setCurrentView} />;
      case "register":
        return <RegisterView onRegister={login} setCurrentView={setCurrentView} />;
      case "puzzles":
        return <PuzzlesView user={user} onBack={() => setCurrentView("home")} />;
      case "learn":
        return <LearnView user={user} onBack={() => setCurrentView("home")} />;
      case "play":
        return <PlayView user={user} onBack={() => setCurrentView("home")} />;
      case "stats":
        return <StatsView user={user} onBack={() => setCurrentView("home")} />;
      case "classrooms":
        return <ClassroomsView user={user} onBack={() => setCurrentView("home")} />;
      case "home":
      default:
        return <HomeView user={user} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Header user={user} onLogout={logout} setCurrentView={setCurrentView} />
      <main className="flex-grow">{renderCurrentView()}</main>
      <Footer user={user} />
    </div>
  );
}