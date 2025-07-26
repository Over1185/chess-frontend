import { useState, useEffect } from "react";

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

// Piezas de ajedrez con símbolos Unicode (fallback)
const pieceSymbols = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Función para convertir FEN a matriz del tablero
const fenToBoard = (fen) => {
  const fenBoard = fen.split(' ')[0];
  const rows = fenBoard.split('/');
  
  return rows.map(row => {
    const squares = [];
    for (let char of row) {
      if (isNaN(char)) {
        squares.push(char);
      } else {
        for (let i = 0; i < parseInt(char); i++) {
          squares.push(null);
        }
      }
    }
    return squares;
  });
};

// Función para parsear moves del puzzle
const parsePuzzleMoves = (movesString) => {
  if (!movesString) return [];
  return movesString.split(' ').filter(move => move.length > 0);
};

// Función para convertir notación algebraica a coordenadas
const algebraicToCoords = (algebraic) => {
  if (algebraic.length < 4) return null;
  
  const fromFile = algebraic.charCodeAt(0) - 97; // a=0, b=1, etc.
  const fromRank = 8 - parseInt(algebraic[1]);   // 8=0, 7=1, etc.
  const toFile = algebraic.charCodeAt(2) - 97;
  const toRank = 8 - parseInt(algebraic[3]);
  
  return {
    from: [fromRank, fromFile],
    to: [toRank, toFile]
  };
};

export default function PuzzlesView({ user, onBack }) {
  const [puzzles, setPuzzles] = useState([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [board, setBoard] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [puzzleMoves, setPuzzleMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'solved', 'failed'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userElo, setUserElo] = useState(user?.elo || 800);

  // Cargar puzzles de ejemplo
  const loadSamplePuzzles = () => {
    setPuzzles([
      { 
        puzzle_id: '1', 
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        rating: 1200,
        dificultad: 'easy',
        moves: 'h5h7 g8h6 h7f7',
        game_url: '#'
      },
      { 
        puzzle_id: '2', 
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        rating: 1400,
        dificultad: 'medium',
        moves: 'd1h5 g8f6 h5f7',
        game_url: '#'
      },
      { 
        puzzle_id: '3', 
        fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
        rating: 1800,
        dificultad: 'hard',
        moves: 'a7a8q b6a5 a8a5',
        game_url: '#'
      }
    ]);
  };

  useEffect(() => {
    loadSamplePuzzles();
  }, []);

  // Obtener un puzzle asignado para el usuario
  const getAssignedPuzzle = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/puzzle/asignar';
      
      // Si hay usuario logueado, usar su username
      if (user?.username) {
        url += `/${user.username}`;
      } else {
        // Si no hay usuario, obtener uno random (puedes ajustar esta lógica)
        url += '/guest';
      }
      
      const response = await fetch(url);
      const puzzleData = await response.json();
      
      const puzzle = {
        puzzle_id: puzzleData.puzzle_id,
        fen: puzzleData.fen,
        rating: puzzleData.rating,
        dificultad: puzzleData.dificultad,
        moves: puzzleData.moves,
        game_url: puzzleData.game_url || '#',
        themes: puzzleData.themes
      };
      
      startPuzzle(puzzle);
    } catch (error) {
      console.error('Error obteniendo puzzle asignado:', error);
      setMessage('Error al obtener puzzle. Inténtalo de nuevo.');
      
      // Fallback: usar un puzzle de ejemplo
      const fallbackPuzzle = {
        puzzle_id: 'fallback',
        fen: '1k2rr2/1pp5/p1p5/3qP1P1/1P6/4Q1Pp/5R1K/4R3 w - - 5 30',
        rating: 1251,
        dificultad: 'easy',
        moves: 'f2f8 d5g2',
        game_url: 'https://lichess.org/EVbCgAku#59',
        themes: 'endgame mate mateIn1 oneMove'
      };
      startPuzzle(fallbackPuzzle);
    } finally {
      setLoading(false);
    }
  };

  const startPuzzle = (puzzle) => {
    setSelectedPuzzle(puzzle);
    const initialBoard = fenToBoard(puzzle.fen);
    setBoard(initialBoard);
    
    // Determinar quién mueve primero basado en el FEN
    const fenParts = puzzle.fen.split(' ');
    const activeColor = fenParts[1] === 'w' ? 'white' : 'black';
    setCurrentPlayer(activeColor);
    
    const moves = parsePuzzleMoves(puzzle.moves);
    setPuzzleMoves(moves);
    setCurrentMoveIndex(0);
    setGameStatus('playing');
    setSelectedSquare(null);
    setMessage(`Tu turno: ${activeColor === 'white' ? 'Blancas' : 'Negras'}`);
  };

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
    if (gameStatus !== 'playing') return;

    const piece = board[row][col];

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const fromPiece = board[fromRow][fromCol];

      if (row === fromRow && col === fromCol) {
        setSelectedSquare(null);
      } else if (canMovePiece(piece) && piece) {
        setSelectedSquare([row, col]);
      } else if (isValidMove(fromRow, fromCol, row, col, fromPiece)) {
        makeMove(fromRow, fromCol, row, col);
      } else {
        setSelectedSquare(null);
      }
    } else if (canMovePiece(piece)) {
      setSelectedSquare([row, col]);
    }
  };

  const makeMove = async (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(r => [...r]);
    const movedPiece = newBoard[fromRow][fromCol];
    newBoard[toRow][toCol] = movedPiece;
    newBoard[fromRow][fromCol] = null;

    setBoard(newBoard);
    setSelectedSquare(null);

    // Crear notación del movimiento
    const moveNotation = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    
    // Verificar si el movimiento es correcto
    const expectedMove = puzzleMoves[currentMoveIndex];
    
    if (expectedMove && moveNotation === expectedMove) {
      // Movimiento correcto
      if (currentMoveIndex === puzzleMoves.length - 1) {
        // Puzzle resuelto
        setGameStatus('solved');
        setMessage('¡Excelente! Puzzle resuelto correctamente 🎉');
        await submitPuzzleResult(true);
      } else {
        // Continuar con el siguiente movimiento
        setCurrentMoveIndex(currentMoveIndex + 1);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setMessage('¡Correcto! Continúa...');
      }
    } else {
      // Movimiento incorrecto
      setGameStatus('failed');
      setMessage('Movimiento incorrecto. Inténtalo de nuevo.');
      await submitPuzzleResult(false);
    }
  };

  const submitPuzzleResult = async (solved) => {
    if (!user?.username || !selectedPuzzle) return;

    try {
      const response = await fetch('http://localhost:8000/puzzle/resuelto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          puzzle_id: selectedPuzzle.puzzle_id,
          solved: solved
        }),
      });

      const result = await response.json();
      setUserElo(result.elo_actual);
      
      if (solved) {
        setMessage(`${result.mensaje} (${result.elo_anterior} → ${result.elo_actual})`);
      } else {
        setMessage(`Puzzle fallido. ELO: ${result.elo_anterior} → ${result.elo_actual}`);
      }
    } catch (error) {
      console.error('Error enviando resultado:', error);
    }
  };

  const resetPuzzle = () => {
    if (selectedPuzzle) {
      startPuzzle(selectedPuzzle);
    }
  };

  const backToMenu = () => {
    setSelectedPuzzle(null);
    setBoard([]);
    setGameStatus('playing');
    setMessage('');
  };

  const getSquareColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
    
    if (isSelected) {
      return 'bg-yellow-400 shadow-lg ring-4 ring-yellow-300 ring-opacity-50';
    } else if (isLight) {
      return 'bg-amber-100';
    } else {
      return 'bg-amber-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return 'Desconocido';
    }
  };

  // Componente para renderizar una pieza
  const PieceComponent = ({ piece }) => {
    if (!piece) return null;
    
    return (
      <img 
        src={pieceImages[piece]} 
        alt={piece}
        className="w-12 h-12 select-none"
        onError={(e) => {
          // Fallback a símbolo Unicode si la imagen no carga
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
    );
  };

  if (selectedPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            
            {/* Header del puzzle */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Puzzle de Ajedrez
                </h1>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedPuzzle.dificultad)}`}>
                    {getDifficultyText(selectedPuzzle.dificultad)}
                  </span>
                  <span className="text-slate-600">Rating: {selectedPuzzle.rating}</span>
                  <span className="text-slate-600">Tu ELO: {userElo}</span>
                  {selectedPuzzle.themes && (
                    <span className="text-slate-500 text-sm">Temas: {selectedPuzzle.themes}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={resetPuzzle} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Reiniciar
                </button>
                <button 
                  onClick={backToMenu} 
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ← Volver
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
              
              {/* Tablero principal */}
              <div className="flex-shrink-0">
                <div className="relative">
                  
                  {/* Números del lado izquierdo */}
                  <div className="absolute -left-10 top-0 h-full flex flex-col justify-around">
                    {['8', '7', '6', '5', '4', '3', '2', '1'].map(num => (
                      <div key={num} className="h-16 flex items-center justify-center text-lg font-bold text-slate-700">
                        {num}
                      </div>
                    ))}
                  </div>

                  {/* Tablero */}
                  <div className="border-8 border-amber-800 rounded-lg overflow-hidden shadow-2xl bg-amber-800">
                    {board.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex">
                        {row.map((piece, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-16 h-16 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-200 ${getSquareColor(rowIndex, colIndex)}`}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                          >
                            {piece && (
                              <>
                                <PieceComponent piece={piece} />
                                <span className="text-4xl select-none hidden">
                                  {pieceSymbols[piece] || piece}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Letras abajo */}
                  <div className="flex justify-center mt-3">
                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
                      <div key={letter} className="w-16 text-center text-lg font-bold text-slate-700">
                        {letter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel lateral */}
              <div className="flex-1 max-w-md space-y-6">
                
                {/* Estado del puzzle */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-xl font-bold mb-4 text-slate-800">
                    Estado del Puzzle
                  </h3>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      gameStatus === 'solved' ? 'bg-green-100 border-green-300 text-green-800' :
                      gameStatus === 'failed' ? 'bg-red-100 border-red-300 text-red-800' :
                      'bg-blue-100 border-blue-300 text-blue-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {gameStatus === 'solved' && <span>✅</span>}
                        {gameStatus === 'failed' && <span>❌</span>}
                        {gameStatus === 'playing' && <span>🧩</span>}
                        <span className="font-bold">
                          {gameStatus === 'solved' ? 'Resuelto' :
                           gameStatus === 'failed' ? 'Fallido' :
                           `Turno: ${currentPlayer === 'white' ? 'Blancas' : 'Negras'}`}
                        </span>
                      </div>
                      <p>{message}</p>
                    </div>

                    {selectedSquare && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                        <p className="text-yellow-800 font-medium">
                          Pieza seleccionada en {String.fromCharCode(97 + selectedSquare[1])}{8 - selectedSquare[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objetivo del puzzle */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-xl font-bold mb-4 text-slate-800">
                    💡 Objetivo
                  </h3>
                  <p className="text-slate-700">
                    Encuentra la mejor secuencia de movimientos. 
                    {selectedPuzzle.dificultad === 'easy' && ' Busca un mate rápido o gana material.'}
                    {selectedPuzzle.dificultad === 'medium' && ' Encuentra la táctica ganadora.'}
                    {selectedPuzzle.dificultad === 'hard' && ' Resuelve esta compleja posición.'}
                  </p>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Tu ELO actual:</strong> {userElo}
                    </p>
                    {selectedPuzzle.game_url && selectedPuzzle.game_url !== '#' && (
                      <p className="text-sm text-amber-800 mt-2">
                        <a href={selectedPuzzle.game_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600">
                          Ver partida original
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Puzzles de Ajedrez</h1>
              <p className="text-slate-600">
                Mejora tus habilidades tácticas resolviendo puzzles. Tu ELO actual: <strong>{userElo}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={getAssignedPuzzle} 
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                🧩 {loading ? 'Cargando...' : 'Puzzle Asignado'}
              </button>
              <button 
                onClick={onBack} 
                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Volver al Home
              </button>
            </div>
          </div>
          
          {/* Grid de puzzles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puzzles.map(puzzle => (
              <div key={puzzle.puzzle_id} className="bg-slate-50 rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800">Puzzle #{puzzle.puzzle_id.slice(-4)}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(puzzle.dificultad)}`}>
                    {getDifficultyText(puzzle.dificultad)}
                  </span>
                </div>
                
                <div className="mb-4 p-2 bg-white rounded-lg border">
                  <div className="grid grid-cols-8 gap-0 w-full max-w-[200px] mx-auto">
                    {fenToBoard(puzzle.fen).map((row, rowIndex) => 
                      row.map((piece, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`aspect-square flex items-center justify-center text-lg ${
                            (rowIndex + colIndex) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800'
                          }`}
                        >
                          {piece && (
                            <span className="text-sm">
                              {pieceSymbols[piece] || piece}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-600 mb-2">Rating: {puzzle.rating}</p>
                </div>
                
                <button 
                  onClick={() => startPuzzle(puzzle)}
                  className="w-full px-4 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
                >
                  🧩 Resolver Puzzle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}