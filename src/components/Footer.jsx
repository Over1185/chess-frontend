import { FaChessQueen, FaHeart } from "react-icons/fa";

export default function Footer({ user }) {
  const getUserColor = () => {
    if (!user) return "bg-slate-800";
    return user.type === "profesor" ? "bg-emerald-700" : "bg-blue-700";
  };

  return (
    <footer className={`${getUserColor()} text-white py-6 mt-auto`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-white/10 p-2 rounded-lg">
              <FaChessQueen className="text-xl" />
            </div>
            <div>
              <div className="font-bold text-lg">ChessEdu</div>
              <div className="text-sm opacity-75">Plataforma Educativa de Ajedrez</div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-1 text-sm opacity-75">
              <span>Hecho con</span>
              <FaHeart className="text-red-400 text-xs" />
              <span>por el grupo maravilla @ PUCESE 2025</span>
            </div>
            <div className="text-xs opacity-60 mt-1">
              Versión 1.0.0 - © Todos los derechos reservados
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
