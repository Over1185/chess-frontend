import { FaPuzzlePiece } from "react-icons/fa";
import { Chessboard } from "react-chessboard";

export default function PuzzlesView({ user, onBack }) {
  const puzzles = [
    { id: 1, name: "Mate en 2", difficulty: "Fácil", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4" },
    { id: 2, name: "Táctica de horquilla", difficulty: "Medio", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1" },
    { id: 3, name: "Sacrificio de dama", difficulty: "Difícil", fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Puzzles de Ajedrez</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puzzles.map(puzzle => (
          <div key={puzzle.id} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">{puzzle.name}</h3>
            <p className="text-gray-600 mb-4">Dificultad: {puzzle.difficulty}</p>
            <div className="mb-4">
              <Chessboard
                position={puzzle.fen}
                arePiecesDraggable={false}
                boardWidth={250}
              />
            </div>
            <button className="btn btn-primary w-full">
              <FaPuzzlePiece className="mr-2" />
              Resolver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
