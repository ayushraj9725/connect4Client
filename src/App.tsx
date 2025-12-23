import { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { Dashboard } from './components/Dashboard';
import './index.css';

// REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = "1065803344553-7frcbko78j9cshb0nvnd08qp888ci2l2.apps.googleusercontent.com";

function App() {
  const [gameState, setGameState] = useState<any>(null);
  const [status, setStatus] = useState<string>('lobby'); // lobby, dashboard, waiting, playing, finished, error
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('connect4_user');
    const storedToken = localStorage.getItem('connect4_token');
    const storedExpiry = localStorage.getItem('connect4_expiry');

    if (storedUser !== null && storedToken !== null && storedExpiry !== null) {
      if (Date.now() < parseInt(storedExpiry)) {
        // Restore session
        setUsername(storedUser);
        setToken(storedToken);
        setStatus('dashboard');
      } else {
        // Expired
        localStorage.removeItem('connect4_user');
        localStorage.removeItem('connect4_token');
        localStorage.removeItem('connect4_expiry');
      }
    }
  }, []); // Empty dependency array run once on mount

  const handleLogin = (user: string, t: string) => {
    setUsername(user);
    setToken(t);
    setGameState(null); // Clear any old state
    setStatus('dashboard');

    // Save session for 7 days
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('connect4_user', user);
    localStorage.setItem('connect4_token', t);
    localStorage.setItem('connect4_expiry', expiry.toString());
  };

  const logout = () => {
    setUsername('');
    setToken('');
    setStatus('lobby');
    if (wsRef.current) {
      wsRef.current.close(1000, "Logout");
    }
    setConnectionStatus('Disconnected');

    // Clear session
    localStorage.removeItem('connect4_user');
    localStorage.removeItem('connect4_token');
    localStorage.removeItem('connect4_expiry');
  };

  const connect = () => {
    if (isConnecting) return;

    setConnectionStatus('Connecting...');
    setIsConnecting(true);
    console.log("Attempting to connect with user:", username);

    // Pass token in query param or header.
    const wsUrl = `ws://localhost:8082/ws?token=${encodeURIComponent(token)}&username=${encodeURIComponent(username)}`;
    console.log("Connecting to:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus('Connected');
      setIsConnecting(false);
      // Send join message
      const joinMsg = { type: 'join', payload: { username: username, token: token } };
      console.log("Sending join message:", joinMsg);
      ws.send(JSON.stringify(joinMsg));
    };

    ws.onmessage = (event) => {
      console.log("Received message:", event.data);
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected", event.code, event.reason);
      setConnectionStatus(`Disconnected (${event.code})`);
      setIsConnecting(false);

      if (status !== 'lobby') {
        setStatus('dashboard');
        if (event.code !== 1000 && event.code !== 1001) {
          alert("Disconnected from server.");
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus('Connection Error');
      setIsConnecting(false);
      alert("WebSocket connection error. Is the server running?");
    };
  };

  const handleMessage = (msg: any) => {
    switch (msg.type) {
      case 'status':
        if (msg.status === 'waiting_for_opponent') {
          setStatus('waiting');
        }
        break;
      case 'match_found':
        setStatus('playing');
        break;
      case 'gamestate':
        setGameState(msg);
        break;
      case 'error':
        alert(msg.message);
        break;
    }
  };

  const handleDrop = (col: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'move', payload: { column: col } }));
    }
  };

  const handleLeaveGame = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setStatus('dashboard');
    setGameState(null);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-container">

        {status === 'lobby' && (
          <Lobby onJoin={handleLogin} />
        )}

        {status === 'dashboard' && (
          <Dashboard
            username={username}
            onPlay={connect}
            onLogout={logout}
          />
        )}

        {isConnecting && (
          <div className="waiting-screen">
            <h2>Connecting to Server...</h2>
          </div>
        )}

        {status === 'waiting' && (
          <div className="waiting-screen">
            <h2>Waiting for opponent...</h2>
            <p>Bot will join if no one else does within 10 seconds.</p>
            <button onClick={() => { if (wsRef.current) wsRef.current.close(); setStatus('dashboard'); }}>Cancel</button>
          </div>
        )}

        {(status === 'playing' || gameState?.status === 'finished') && gameState && (
          <div className="game-container">
            <div className="header">
              <span>Player: {username}</span>
              <button onClick={handleLeaveGame}>Leave Game</button>
            </div>

            <GameBoard
              board={gameState.board}
              onDrop={handleDrop}
              myTurn={gameState.turn === gameState.youAre}
              winner={gameState.winner}
              youAre={gameState.youAre}
            />
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '12px', color: '#888' }}>
          WS: {connectionStatus}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
