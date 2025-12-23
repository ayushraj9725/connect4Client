import React from 'react';

interface GameBoardProps {
  board: number[][];
  onDrop: (col: number) => void;
  myTurn: boolean;
  winner: number;
  youAre: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, onDrop, myTurn, winner, youAre }) => {
  const [hoverCol, setHoverCol] = React.useState<number | null>(null);

  const getDropRow = (col: number) => {
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === 0) return r;
    }
    return -1;
  };

  return (
    <div className="game-board">
      <div className="status-bar">
        {winner !== 0 ? (
          <h2>{winner === youAre ? "You Won!" : winner === -1 ? "Draw!" : "You Lost!"}</h2>
        ) : (
          <h2>{myTurn ? "Your Turn" : "Opponent's Turn"}</h2>
        )}
      </div>

      <div className="grid" onMouseLeave={() => setHoverCol(null)}>
        {/* Render columns for click handling */}
        {board[0].map((_, colIndex) => (
          <div
            key={colIndex}
            className={`column ${myTurn && winner === 0 ? 'interactive' : ''}`}
            onClick={() => myTurn && winner === 0 && onDrop(colIndex)}
            onMouseEnter={() => setHoverCol(colIndex)}
            style={{ position: 'relative' }} // Needed for ghost overlay? Or just render in cell logic
          >
            {board.map((row, rowIndex) => {
              const isGhost = myTurn && winner === 0 && hoverCol === colIndex && rowIndex === getDropRow(colIndex);
              return (
                <div key={`${rowIndex}-${colIndex}`} className="cell">
                  <div className={`disc player-${row[colIndex]}`}></div>
                  {isGhost && (
                    <div
                      className={`disc player-${youAre}`}
                      style={{ position: 'absolute', opacity: 0.3, zIndex: 0, transform: 'scale(0.9)' }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
