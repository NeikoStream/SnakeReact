import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  pseudo: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/leaderboard/facile');
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={index}>
            {index + 1}. {entry.pseudo} - {entry.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;