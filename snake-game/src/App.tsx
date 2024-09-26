import React, { useState } from 'react';
import Game from './components/Game';
import Menu from './components/Menu';
import Leaderboard from './components/Leaderboard';

function App() {
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  return (
    <div className="App">
      {playerId ? (
        <>
          <button onClick={() => setShowLeaderboard(!showLeaderboard)}>
            {showLeaderboard ? 'Jouer' : 'Leaderboard'}
          </button>
          {showLeaderboard ? (
            <Leaderboard />
          ) : (
            <Game playerId={playerId} />
          )}
        </>
      ) : (
        <Menu setPlayerId={setPlayerId} />
      )}
    </div>
  );
}

export default App;