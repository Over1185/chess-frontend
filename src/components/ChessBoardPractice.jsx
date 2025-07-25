import { useState } from "react";

// Mapeo de piezas a sus respectivas imágenes
const pieceImages = {
  'K': '/src/assets/w_king.png',
  'Q': '/src/assets/w_queen.png', 
  'R': '/src/assets/w_rook.png',
  'B': '/src/assets/w_bishop.png',
  'N': '/src/assets/w_knight.png',
  'P': '/src/assets/w_pawn.png',
  'k': '/src/assets/b_king.png',
  'q': '/src/assets/b_queen.png',
  'r': '/src/assets/b_rook.png',
  'b': '/src/assets/b_bishop.png',
  'n': '/src/assets/b_knight.png',
  'p': '/src/assets/b_pawn.png'
};

// Piezas de ajedrez con los mejores símbolos Unicode (para capturadas)
const pieces = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Posición inicial del ajedrez
const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

export default function ChessBoardPractice() {
  const [board, setBoard] = useState(initialBoard.map(row => [...row]));
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

  const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();
  const isBlackPiece = (piece) => piece && piece === piece.toLowerCase();

  const canMovePiece = (piece) => {
    if (!piece) return false;
    return (currentPlayer === 'white' && isWhitePiece(piece)) || 
           (currentPlayer === 'black' && isBlackPiece(piece));
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol, piece) => {
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
    if (fromRow === toRow && fromCol === toCol) return false;
    
    const targetPiece = board[toRow][toCol];
    
    if (targetPiece && 
        ((isWhitePiece(piece) && isWhitePiece(targetPiece)) ||
         (isBlackPiece(piece) && isBlackPiece(targetPiece)))) {
      return false;
    }

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    switch (piece.toLowerCase()) {
      case 'p':
        const isWhite = isWhitePiece(piece);
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        if (colDiff === 0 && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction) return true;
        }
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
          return true;
        }
        return false;

      case 'r':
        if (rowDiff === 0 || colDiff === 0) {
          for (let i = 1; i < Math.max(rowDiff, colDiff); i++) {
            if (board[fromRow + i * rowDir][fromCol + i * colDir]) return false;
          }
          return true;
        }
        return false;

      case 'n':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'b':
        if (rowDiff === colDiff) {
          for (let i = 1; i < rowDiff; i++) {
            if (board[fromRow + i * rowDir][fromCol + i * colDir]) return false;
          }
          return true;
        }
        return false;

      case 'q':
        if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
          for (let i = 1; i < Math.max(rowDiff, colDiff); i++) {
            if (board[fromRow + i * rowDir][fromCol + i * colDir]) return false;
          }
          return true;
        }
        return false;

      case 'k':
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const fromPiece = board[fromRow][fromCol];

      if (row === fromRow && col === fromCol) {
        setSelectedSquare(null);
      } else if (canMovePiece(piece) && piece) {
        setSelectedSquare([row, col]);
      } else if (isValidMove(fromRow, fromCol, row, col, fromPiece)) {
        const newBoard = board.map(r => [...r]);
        const movedPiece = newBoard[fromRow][fromCol];
        const capturedPiece = newBoard[row][col];
        
        if (capturedPiece) {
          const capturedBy = isWhitePiece(movedPiece) ? 'white' : 'black';
          setCapturedPieces(prev => ({
            ...prev,
            [capturedBy]: [...prev[capturedBy], capturedPiece]
          }));
        }
        
        newBoard[row][col] = movedPiece;
        newBoard[fromRow][fromCol] = null;

        setBoard(newBoard);
        setSelectedSquare(null);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        
        const moveNotation = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}-${String.fromCharCode(97 + col)}${8 - row}`;
        setMoveHistory([...moveHistory, moveNotation]);
      } else {
        setSelectedSquare(null);
      }
    } else if (canMovePiece(piece)) {
      setSelectedSquare([row, col]);
    }
  };

  const resetBoard = () => {
    setBoard(initialBoard.map(row => [...row]));
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
  };

  const getSquareColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
    
    if (isSelected) {
      return 'bg-yellow-400 shadow-lg ring-4 ring-yellow-300 ring-opacity-50';
    } else if (isLight) {
      return 'bg-amber-50';
    } else {
      return 'bg-amber-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Tablero de Ajedrez Profesional
            </h1>
            <p className="text-slate-600">Disfruta de una partida con este elegante tablero</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
            
            {/* Tablero principal */}
            <div className="flex-shrink-0">
              <div className="relative">
                
                {/* Números del lado izquierdo */}
                <div className="absolute -left-10 top-0 h-full flex flex-col justify-around">
                  {['8', '7', '6', '5', '4', '3', '2', '1'].map(num => (
                    <div key={num} className="h-20 flex items-center justify-center text-xl font-bold text-slate-700">
                      {num}
                    </div>
                  ))}
                </div>

                {/* Tablero */}
                <div className="border-8 border-amber-900 rounded-lg overflow-hidden shadow-2xl">
                  {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((piece, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`w-20 h-20 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-200 ${getSquareColor(rowIndex, colIndex)}`}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                        >
                          {piece && (
                            <img
                              src={pieceImages[piece]}
                              alt={`${isWhitePiece(piece) ? 'White' : 'Black'} ${piece.toLowerCase()}`}
                              className="w-16 h-16 object-contain select-none transition-transform duration-200 hover:scale-110 drop-shadow-lg"
                              style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                              }}
                              draggable={false}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Letras abajo */}
                <div className="flex justify-center mt-3">
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
                    <div key={letter} className="w-20 text-center text-xl font-bold text-slate-700">
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel lateral */}
            <div className="flex-1 max-w-md space-y-6">
              
              {/* Estado del juego */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  Estado del Juego
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-medium text-slate-700 mb-2">Turno actual:</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
                      currentPlayer === 'white' 
                        ? 'bg-white text-slate-800 border-2 border-slate-300 shadow-md' 
                        : 'bg-slate-800 text-white shadow-md'
                    }`}>
                      {currentPlayer === 'white' ? '♔ Blancas' : '♚ Negras'}
                    </div>
                  </div>
                  <button 
                    onClick={resetBoard} 
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    ↻ Reiniciar
                  </button>
                </div>
                {selectedSquare && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                    <p className="text-yellow-800 font-medium">
                      Pieza seleccionada en {String.fromCharCode(97 + selectedSquare[1])}{8 - selectedSquare[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Piezas capturadas */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold mb-4 text-slate-800">
                  Piezas Capturadas
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-700 mb-2">Por las Blancas:</p>
                    <div className="flex gap-1 flex-wrap min-h-[3rem] bg-white rounded-lg p-3 border">
                      {capturedPieces.white.map((piece, index) => (
                        <span 
                          key={index} 
                          className="text-3xl"
                          style={{
                            color: '#000000',
                            textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                            filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))'
                          }}
                        >
                          {pieces[piece]}
                        </span>
                      ))}
                      {capturedPieces.white.length === 0 && <span className="text-slate-400 text-sm flex items-center">Ninguna pieza capturada</span>}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-2">Por las Negras:</p>
                    <div className="flex gap-1 flex-wrap min-h-[3rem] bg-white rounded-lg p-3 border">
                      {capturedPieces.black.map((piece, index) => (
                        <span 
                          key={index} 
                          className="text-3xl"
                          style={{
                            color: '#ffffff',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))'
                          }}
                        >
                          {pieces[piece]}
                        </span>
                      ))}
                      {capturedPieces.black.length === 0 && <span className="text-slate-400 text-sm flex items-center">Ninguna pieza capturada</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold mb-4 text-slate-800">
                  Historial de Movimientos
                </h3>
                <div className="max-h-48 overflow-y-auto bg-white rounded-lg p-3 border">
                  {moveHistory.length === 0 ? (
                    <p className="text-slate-500 text-center">No hay movimientos registrados</p>
                  ) : (
                    <div className="space-y-1">
                      {moveHistory.map((move, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-100 px-3 py-2 rounded text-sm">
                          <span className="font-medium">{index + 1}.</span>
                          <span className="font-mono">{move}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold mb-4 text-slate-800">
                  Instrucciones
                </h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>• Haz clic en una pieza para seleccionarla</p>
                  <p>• Haz clic en una casilla válida para mover</p>
                  <p>• Solo puedes mover piezas de tu color</p>
                  <p>• La casilla amarilla indica selección</p>
                  <p>• Las piezas capturadas se muestran arriba</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}