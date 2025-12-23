import React, { useEffect, useState } from 'react';

interface Player {
  username: string;
  wins: number;
}

export const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch('https://connect4server.onrender.com/api/leaderboard')
      .then(res => res.json())
      .then(data => setPlayers(data || [])) // Handle potential null
      .catch(err => console.error("Failed to fetch leaderboard", err));
  }, []);

  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{p.username}</td>
              <td>{p.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
