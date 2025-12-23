import React, { useState } from 'react';
import { Leaderboard } from './Leaderboard';

interface DashboardProps {
  username: string;
  onPlay: () => void;
  onLogout: () => void;
}

interface ProfileStats {
  username: string;
  games: number;
  wins: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ username, onPlay, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8082/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    fetchProfile();
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome, {username}!</h1>

      <div style={{ margin: '30px 0', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button onClick={onPlay} style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
          Play Now
        </button>
        <button className="secondary" onClick={handleProfileClick}>
          Profile
        </button>
        <button className="secondary" onClick={onLogout} style={{ background: '#444' }}>
          Logout
        </button>
      </div>

      <Leaderboard />

      {showProfile && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal" style={{ background: '#222', padding: '30px', borderRadius: '10px', minWidth: '300px' }}>
            <h2>User Profile</h2>
            <div style={{ textAlign: 'left', margin: '20px 0' }}>
              <p><strong>Username:</strong> {username}</p>
              {stats ? (
                <>
                  <p><strong>Total Games:</strong> {stats.games}</p>
                  <p><strong>Wins:</strong> {stats.wins}</p>
                  <p><strong>Win Rate:</strong> {stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : 0}%</p>
                </>
              ) : <p>Loading stats...</p>}
            </div>
            <button onClick={() => setShowProfile(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
