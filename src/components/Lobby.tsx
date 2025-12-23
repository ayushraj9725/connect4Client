import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

interface LobbyProps {
  onJoin: (username: string, token: string) => void;
}

interface JwtPayload {
  name: string;
  email: string;
  sub: string;
  picture?: string;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const decoded = jwtDecode<JwtPayload>(credentialResponse.credential);
        console.log("Login Success:", decoded);
        const username = decoded.name || decoded.email;
        onJoin(username, credentialResponse.credential);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  };

  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const guestName = `Guest_${Math.floor(Math.random() * 1000000)}`;
    onJoin(guestName, "");
  };

  return (
    <div className="lobby-container">
      <h1>Connect 4</h1>
      <div className="login-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <p>Sign in to play</p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', flex: 1 }}></div>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>OR</span>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', flex: 1 }}></div>
        </div>

        <button className="secondary" onClick={handleGuestJoin}>
          Play as Guest
        </button>
      </div>
    </div>
  );
};
